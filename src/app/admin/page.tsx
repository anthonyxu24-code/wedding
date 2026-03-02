"use client";

import { useEffect, useState } from "react";

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

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [rsvpsLoading, setRsvpsLoading] = useState(true);

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
  }

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

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif text-stone-800">RSVPs</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            Log out
          </button>
        </div>
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
                    {Array.isArray(r.guest_names) && r.guest_names.length
                      ? r.guest_names.join(", ")
                      : "—"}
                  </td>
                  <td className="p-3 max-w-[160px] truncate">{r.message || "—"}</td>
                  <td className="p-3 text-stone-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rsvps.length === 0 && (
          <p className="text-center text-stone-500 py-8">No RSVPs yet.</p>
        )}
      </div>
    </div>
  );
}
