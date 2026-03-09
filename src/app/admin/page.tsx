"use client";

import { useEffect, useState, useCallback } from "react";

type Rsvp = {
  id: string;
  primary_name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  guest_names: string[];
  message: string | null;
  created_at: string;
};

type Guest = {
  id: string;
  name: string;
  email: string;
  locale: "en" | "zh";
  invite_sent: boolean;
  invite_sent_at: string | null;
  created_at: string;
};

type Tab = "rsvps" | "guests";

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
  const [sendAllLoading, setSendAllLoading] = useState(false);

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
    if (!newGuest.name.trim() || !newGuest.email.trim()) return;
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
                    <th className="p-3 font-medium text-stone-700">Names</th>
                    <th className="p-3 font-medium text-stone-700">Message</th>
                    <th className="p-3 font-medium text-stone-700">Date</th>
                    <th className="p-3 font-medium text-stone-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r) => (
                    <tr key={r.id} className="border-b border-stone-100">
                      <td className="p-3">{r.primary_name}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.attending ? "Yes" : "No"}</td>
                      <td className="p-3">{r.guest_count ?? 1}</td>
                      <td className="p-3 max-w-[180px] truncate">
                        {Array.isArray(r.guest_names) && r.guest_names.length ? r.guest_names.join(", ") : "—"}
                      </td>
                      <td className="p-3 max-w-[160px] truncate">{r.message || "—"}</td>
                      <td className="p-3 text-stone-500">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteRsvp(r.id, r.primary_name)}
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
            {rsvps.length === 0 && <p className="text-center text-stone-500 py-8">No RSVPs yet.</p>}
          </>
        )}

        {/* ═══ Guest List Tab ═══ */}
        {tab === "guests" && (
          <>
            {/* Add guest form */}
            <form onSubmit={handleAddGuest} className="flex flex-wrap gap-3 mb-6 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs text-stone-500 mb-1">Name</label>
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest((g) => ({ ...g, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                  placeholder="Guest name"
                  required
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-stone-500 mb-1">Email</label>
                <input
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest((g) => ({ ...g, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm"
                  placeholder="email@example.com"
                  required
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
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-stone-600">
                <strong>{guests.length}</strong> guest{guests.length !== 1 ? "s" : ""} · <strong>{guests.filter((g) => g.invite_sent).length}</strong> sent · <strong>{unsentCount}</strong> unsent
              </span>
              <button
                onClick={handleSendAll}
                disabled={sendAllLoading || unsentCount === 0}
                className="px-4 py-2 rounded-md bg-stone-800 text-white text-sm hover:bg-stone-700 disabled:opacity-60"
              >
                {sendAllLoading ? "Sending…" : `Send All Unsent (${unsentCount})`}
              </button>
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
                        <td className="p-3">{g.name}</td>
                        <td className="p-3">{g.email}</td>
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
                        <td className="p-3 flex gap-3">
                          <button
                            onClick={() => handleSendInvites([g.id])}
                            disabled={sendingIds.has(g.id)}
                            className="text-xs text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
                          >
                            {sendingIds.has(g.id) ? "Sending…" : g.invite_sent ? "Resend" : "Send"}
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g.id, g.name)}
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
      </div>
    </div>
  );
}
