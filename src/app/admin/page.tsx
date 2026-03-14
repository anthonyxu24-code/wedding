"use client";

import React, { useEffect, useState, useCallback } from "react";

type Rsvp = {
  id: string;
  primary_name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  guest_names: string[];
  message: string | null;
  address: string | null;
  created_at: string;
};

type Guest = {
  id: string;
  name: string | null;
  email: string | null;
  locale: "en" | "zh";
  rsvp_token: string;
  invite_sent: boolean;
  invite_sent_at: string | null;
  created_at: string;
};

type Gift = {
  id: string;
  name: string;
  amount: number;
  method: string;
  note: string | null;
  created_at: string;
};

type Tab = "rsvps" | "guests" | "gifts";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("rsvps");

  // RSVP state
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);

  // Guest list state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", email: "", locale: "en" as "en" | "zh" });
  const [addingGuest, setAddingGuest] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendAllLoading, setSendAllLoading] = useState(false);
  const [expandedRsvp, setExpandedRsvp] = useState<string | null>(null);

  // Gifts state
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(false);
  const [newGift, setNewGift] = useState({ name: "", amount: "", method: "venmo" as string, note: "" });

  const fetchGuests = useCallback(async () => {
    setGuestsLoading(true);
    try {
      const res = await fetch("/api/admin/guests");
      if (res.ok) {
        const data = await res.json();
        setGuests(data.guests ?? []);
      }
    } catch { /* ignore */ }
    finally { setGuestsLoading(false); }
  }, []);

  const fetchGifts = useCallback(async () => {
    setGiftsLoading(true);
    try {
      const res = await fetch("/api/admin/gifts");
      if (res.ok) setGifts(await res.json());
    } catch { /* ignore */ }
    finally { setGiftsLoading(false); }
  }, []);

  useEffect(() => {
    fetch("/api/admin/rsvps")
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
          return res.json();
        }
        setAuthenticated(false);
        return null;
      })
      .then((data) => {
        if (data?.rsvps) setRsvps(data.rsvps);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setRsvpsLoading(false));
  }, []);

  useEffect(() => {
    if (authenticated && tab === "guests" && guests.length === 0) {
      fetchGuests();
    }
  }, [authenticated, tab, guests.length, fetchGuests]);

  useEffect(() => {
    if (authenticated && tab === "gifts" && gifts.length === 0) {
      fetchGifts();
    }
  }, [authenticated, tab, gifts.length, fetchGifts]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data.error || "Invalid password");
        return;
      }
      setAuthenticated(true);
      const rRes = await fetch("/api/admin/rsvps");
      if (rRes.ok) {
        const rData = await rRes.json();
        setRsvps(rData.rsvps ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setRsvps([]);
    setGuests([]);
  }

  // ── RSVP actions ──

  async function handleDeleteRsvp(id: string, name: string) {
    if (!confirm(`Delete RSVP from "${name}"?`)) return;
    try {
      const res = await fetch("/api/admin/rsvps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setRsvps((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  }

  // ── Guest list actions ──

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    // Allow blank invitation (no name, no email)
    setAddingGuest(true);
    try {
      const res = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGuest),
      });
      if (res.ok) {
        const data = await res.json();
        setGuests((prev) => [data.guest, ...prev]);
        setNewGuest({ name: "", email: "", locale: "en" });
      }
    } catch { /* ignore */ }
    finally { setAddingGuest(false); }
  }

  async function handleDeleteGuest(id: string, name: string) {
    if (!confirm(`Remove "${name}" from guest list?`)) return;
    try {
      const res = await fetch("/api/admin/guests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch { /* ignore */ }
  }

  async function handleSendInvites(guestIds: string[]) {
    if (guestIds.length === 0) return;
    setSendingIds((prev) => {
      const next = new Set(prev);
      guestIds.forEach((id) => next.add(id));
      return next;
    });
    try {
      const res = await fetch("/api/admin/send-invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Send failed: ${data.error || res.statusText}`);
        return;
      }
      const { results } = data;
      const sentIds = new Set(results.filter((r: { status: string }) => r.status === "sent").map((r: { id: string }) => r.id));
      const failedEntries = results.filter((r: { status: string }) => r.status === "failed");

      setGuests((prev) =>
        prev.map((g) =>
          sentIds.has(g.id) ? { ...g, invite_sent: true, invite_sent_at: new Date().toISOString() } : g
        )
      );

      if (failedEntries.length > 0) {
        const details = failedEntries.map((r: { id: string; error?: string }) => {
          const name = guests.find((g) => g.id === r.id)?.name || r.id;
          return `${name}: ${r.error || "unknown error"}`;
        });
        alert(`Failed to send:\n${details.join("\n")}`);
      }
    } catch (err) {
      alert(`Network error: ${err instanceof Error ? err.message : "Could not reach server"}`);
    }
    finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        guestIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  }

  async function handleSendAll() {
    const unsent = guests.filter((g) => !g.invite_sent);
    if (unsent.length === 0) {
      alert("All invitations have already been sent.");
      return;
    }
    if (!confirm(`Send invitations to ${unsent.length} guest${unsent.length > 1 ? "s" : ""}?`)) return;
    setSendAllLoading(true);
    await handleSendInvites(unsent.map((g) => g.id));
    setSendAllLoading(false);
  }

  // ── Render ──

  if (authenticated === null && rsvpsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p className="text-stone-500">Loading…</p>
      </div>
    );
  }

  if (authenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <h1 className="text-xl font-serif text-center text-stone-800">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border border-stone-300 rounded-md"
            autoFocus
          />
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Log in"}
          </button>
        </form>
      </div>
    );
  }

  const attending = rsvps.filter((r) => r.attending);
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count || 1), 0);
  const unsentCount = guests.filter((g) => !g.invite_sent).length;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif text-stone-800">Admin</h1>
          <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-700">
            Log out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-stone-200">
          <button
            onClick={() => setTab("rsvps")}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === "rsvps" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            RSVPs
          </button>
          <button
            onClick={() => setTab("guests")}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === "guests" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Guest List {unsentCount > 0 && <span className="ml-1 text-xs text-orange-500">({unsentCount} unsent)</span>}
          </button>
          <button
            onClick={() => setTab("gifts")}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === "gifts" ? "border-stone-800 text-stone-800" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            Gifts
          </button>
        </div>

        {/* ═══ RSVPs Tab ═══ */}
        {tab === "rsvps" && (
          <>
            <div className="mb-6 flex gap-6 text-sm">
              <span className="text-stone-600">
                Attending: <strong>{attending.length}</strong> responses
              </span>
              <span className="text-stone-600">
                Total guests: <strong>{totalGuests}</strong>
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="p-3 font-medium text-stone-700">Name</th>
                    <th className="p-3 font-medium text-stone-700">Email</th>
                    <th className="p-3 font-medium text-stone-700">Attending</th>
                    <th className="p-3 font-medium text-stone-700">Guests</th>
                    <th className="p-3 font-medium text-stone-700">Date</th>
                    <th className="p-3 font-medium text-stone-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r) => (
                    <React.Fragment key={r.id}>
                      <tr
                        className="border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors"
                        onClick={() => setExpandedRsvp(expandedRsvp === r.id ? null : r.id)}
                      >
                        <td className="p-3">{r.primary_name}</td>
                        <td className="p-3">{r.email}</td>
                        <td className="p-3">{r.attending ? "Yes" : "No"}</td>
                        <td className="p-3">{r.guest_count ?? 1}</td>
                        <td className="p-3 text-stone-500">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="p-3 flex gap-3 items-center">
                          <span className="text-xs text-stone-400">{expandedRsvp === r.id ? "▲" : "▼"}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRsvp(r.id, r.primary_name); }}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedRsvp === r.id && (
                        <tr className="border-b border-stone-100 bg-stone-50/50">
                          <td colSpan={6} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-stone-500 text-xs mb-1">Guest names</p>
                                <p className="text-stone-800 whitespace-pre-line">
                                  {Array.isArray(r.guest_names) && r.guest_names.length ? r.guest_names.join("\n") : "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-stone-500 text-xs mb-1">Message</p>
                                <p className="text-stone-800 whitespace-pre-line">{r.message || "—"}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-stone-500 text-xs mb-1">Mailing address</p>
                                <p className="text-stone-800 whitespace-pre-line">{r.address || "—"}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {rsvps.length === 0 && <p className="text-center text-stone-500 py-8">No RSVPs yet.</p>}
          </>
        )}

        {/* ═══ Guest List Tab ═══ */}
        {tab === "guests" && (
          <>
            {/* Add guest form */}
            <form onSubmit={handleAddGuest} className="flex flex-wrap gap-3 mb-6 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-stone-500 mb-1">Name <span className="text-stone-400">(optional)</span></label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest((g) => ({ ...g, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                  placeholder="Guest name"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-stone-500 mb-1">Email <span className="text-stone-400">(optional)</span></label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest((g) => ({ ...g, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-stone-500 mb-1">Language</label>
                <select
                  value={newGuest.locale}
                  onChange={(e) => setNewGuest((g) => ({ ...g, locale: e.target.value as "en" | "zh" }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm bg-white"
                >
                  <option value="en">EN</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={addingGuest}
                className="px-4 py-2 rounded-md bg-stone-800 text-white text-sm hover:bg-stone-700 disabled:opacity-60"
              >
                {addingGuest ? "Adding…" : "Add Guest"}
              </button>
            </form>

            {/* Send All button */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-sm text-stone-600">
                <strong>{guests.length}</strong> guest{guests.length !== 1 ? "s" : ""} · <strong>{guests.filter((g) => g.invite_sent).length}</strong> sent · <strong>{unsentCount}</strong> unsent
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                    const url = `${base}/rsvp`;
                    const msg = `You're invited to Cindy & Anthony's wedding on April 10, 2026 in Kyoto. RSVP here: ${url}`;
                    navigator.clipboard.writeText(msg).then(() => {
                      setCopiedId("open");
                      setTimeout(() => setCopiedId(null), 2000);
                    });
                  }}
                  className="px-4 py-2 rounded-md border border-stone-300 text-stone-700 text-sm hover:bg-stone-50"
                >
                  {copiedId === "open" ? "Copied!" : "Copy Open RSVP Link"}
                </button>
                <button
                  onClick={handleSendAll}
                  disabled={sendAllLoading || unsentCount === 0}
                  className="px-4 py-2 rounded-md bg-stone-800 text-white text-sm hover:bg-stone-700 disabled:opacity-60"
                >
                  {sendAllLoading ? "Sending…" : `Send All Unsent (${unsentCount})`}
                </button>
              </div>
            </div>

            {/* Guest table */}
            {guestsLoading ? (
              <p className="text-center text-stone-500 py-8">Loading guests…</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50">
                      <th className="p-3 font-medium text-stone-700">Name</th>
                      <th className="p-3 font-medium text-stone-700">Email</th>
                      <th className="p-3 font-medium text-stone-700">Lang</th>
                      <th className="p-3 font-medium text-stone-700">Status</th>
                      <th className="p-3 font-medium text-stone-700">Sent</th>
                      <th className="p-3 font-medium text-stone-700"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g) => (
                      <tr key={g.id} className="border-b border-stone-100">
                        <td className="p-3">{g.name?.trim() || <span className="text-stone-400 italic">Blank invitation</span>}</td>
                        <td className="p-3">{g.email || <span className="text-stone-400 italic">No email</span>}</td>
                        <td className="p-3">{g.locale === "zh" ? "中文" : "EN"}</td>
                        <td className="p-3">
                          {g.invite_sent ? (
                            <span className="text-green-600 font-medium">Sent</span>
                          ) : (
                            <span className="text-orange-500">Not sent</span>
                          )}
                        </td>
                        <td className="p-3 text-stone-500">
                          {g.invite_sent_at ? new Date(g.invite_sent_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="p-3 flex gap-3 flex-wrap">
                          <button
                            onClick={() => {
                              const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                              const url = `${base}/?token=${encodeURIComponent(g.rsvp_token)}&lang=${g.locale}`;
                              const name = g.name?.trim();
                              const msg = name
                                ? (g.locale === "zh"
                                  ? `嗨 ${name}！诚挚邀请您参加 Cindy & Anthony 的婚礼，2026年4月10日，京都。请在此回复：${url}`
                                  : `Hi ${name}! You're invited to Cindy & Anthony's wedding on April 10, 2026 in Kyoto. RSVP here: ${url}`)
                                : (g.locale === "zh"
                                  ? `诚挚邀请您参加 Cindy & Anthony 的婚礼，2026年4月10日，京都。请在此回复：${url}`
                                  : `You're invited to Cindy & Anthony's wedding on April 10, 2026 in Kyoto. RSVP here: ${url}`);
                              navigator.clipboard.writeText(msg).then(() => {
                                setCopiedId(g.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              });
                            }}
                            className="text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                          >
                            {copiedId === g.id ? "Copied!" : "Copy Link"}
                          </button>
                          <button
                            onClick={() => handleSendInvites([g.id])}
                            disabled={sendingIds.has(g.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
                          >
                            {sendingIds.has(g.id) ? "Sending…" : g.invite_sent ? "Resend" : "Send"}
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g.id, g.name?.trim() || "Blank invitation")}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!guestsLoading && guests.length === 0 && (
              <p className="text-center text-stone-500 py-8">No guests added yet.</p>
            )}
          </>
        )}

        {/* ═══ Gifts Tab ═══ */}
        {tab === "gifts" && (
          <>
            {/* Summary */}
            <div className="mb-6 flex gap-6 text-sm flex-wrap">
              <span className="text-stone-600">
                Total: <strong>${(gifts.reduce((s, g) => s + g.amount, 0) / 100).toFixed(2)}</strong>
              </span>
              <span className="text-stone-600">
                Gifts: <strong>{gifts.length}</strong>
              </span>
              {["stripe", "venmo", "other"].map((m) => {
                const sub = gifts.filter((g) => g.method === m);
                if (sub.length === 0) return null;
                return (
                  <span key={m} className="text-stone-500">
                    {m.charAt(0).toUpperCase() + m.slice(1)}: ${(sub.reduce((s, g) => s + g.amount, 0) / 100).toFixed(2)} ({sub.length})
                  </span>
                );
              })}
            </div>

            {/* Add manual gift (for Venmo / other) */}
            <div className="mb-6 p-4 border border-stone-200 rounded-lg bg-white">
              <p className="text-sm font-medium text-stone-700 mb-3">Record a gift manually</p>
              <div className="flex flex-wrap gap-2 items-end">
                <input
                  type="text"
                  placeholder="Name"
                  value={newGift.name}
                  onChange={(e) => setNewGift((g) => ({ ...g, name: e.target.value }))}
                  className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400"
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  min="1"
                  value={newGift.amount}
                  onChange={(e) => setNewGift((g) => ({ ...g, amount: e.target.value }))}
                  className="w-28 px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400"
                />
                <select
                  value={newGift.method}
                  onChange={(e) => setNewGift((g) => ({ ...g, method: e.target.value }))}
                  className="px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400"
                >
                  <option value="venmo">Venmo</option>
                  <option value="stripe">Stripe</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={newGift.note}
                  onChange={(e) => setNewGift((g) => ({ ...g, note: e.target.value }))}
                  className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-stone-200 rounded-md focus:outline-none focus:border-stone-400"
                />
                <button
                  onClick={async () => {
                    if (!newGift.name.trim() || !newGift.amount) return;
                    try {
                      const res = await fetch("/api/admin/gifts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newGift),
                      });
                      if (res.ok) {
                        setNewGift({ name: "", amount: "", method: "venmo", note: "" });
                        fetchGifts();
                      } else {
                        const d = await res.json().catch(() => ({}));
                        alert(d.error || "Failed to add gift");
                      }
                    } catch { alert("Failed to add gift"); }
                  }}
                  className="px-4 py-2 text-sm bg-stone-800 text-white rounded-md hover:bg-stone-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Gifts table */}
            {giftsLoading && <p className="text-center text-stone-500 py-8">Loading…</p>}
            {!giftsLoading && gifts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-stone-500">
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Amount</th>
                      <th className="py-2 pr-4 font-medium">Method</th>
                      <th className="py-2 pr-4 font-medium">Note</th>
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts.map((gift) => (
                      <tr key={gift.id} className="border-b border-stone-100 hover:bg-stone-50">
                        <td className="py-2 pr-4">{gift.name}</td>
                        <td className="py-2 pr-4 font-medium">${(gift.amount / 100).toFixed(2)}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            gift.method === "stripe" ? "bg-purple-100 text-purple-700" :
                            gift.method === "venmo" ? "bg-blue-100 text-blue-700" :
                            "bg-stone-100 text-stone-600"
                          }`}>
                            {gift.method}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-stone-500 max-w-[200px] truncate">{gift.note || "—"}</td>
                        <td className="py-2 pr-4 text-stone-400">{new Date(gift.created_at).toLocaleDateString()}</td>
                        <td className="py-2">
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete gift from ${gift.name}?`)) return;
                              await fetch(`/api/admin/gifts?id=${gift.id}`, { method: "DELETE" });
                              fetchGifts();
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!giftsLoading && gifts.length === 0 && (
              <p className="text-center text-stone-500 py-8">No gifts recorded yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
