"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

export default function RsvpPage() {
  const { lang } = useLocale();
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [form, setForm] = useState({
    primaryName: "",
    email: "",
    attending: true,
    guestCount: 1,
    guestNames: "",
    message: "",
  });

  async function handleRsvpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRsvpError("");
    setRsvpLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_name: form.primaryName,
          email: form.email,
          attending: form.attending,
          guest_count: form.guestCount,
          guest_names: form.guestNames.trim()
            ? form.guestNames
                .trim()
                .split(/\n/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          message: form.message || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit RSVP");
      setRsvpSubmitted(true);
      try { localStorage.setItem("hasRsvped", "1"); } catch {}
    } catch (err) {
      setRsvpError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setRsvpLoading(false);
    }
  }

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
      <PageNav />
      <div className="max-w-md md:max-w-xl mx-auto py-10 px-4">

        {rsvpSubmitted ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <p className="font-serif text-[var(--foreground)] text-lg">
              {lang.thankYou}
            </p>
            <p className="text-sm mt-1">{lang.receivedResponse}</p>
          </div>
        ) : (
          <form onSubmit={handleRsvpSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-[var(--muted)] mb-2"
                >
                  {lang.yourName}
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.primaryName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryName: e.target.value }))
                  }
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-zinc-400"
                  placeholder=" "
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-[var(--muted)] mb-2"
                >
                  {lang.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-zinc-400"
                  placeholder=" "
                />
              </div>
            </div>
            <div>
              <span className="block text-sm text-[var(--muted)] mb-3">
                {lang.attending}
              </span>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === true}
                    onChange={() =>
                      setForm((f) => ({ ...f, attending: true }))
                    }
                    className="w-3.5 h-3.5 border border-[var(--foreground)] text-[var(--foreground)] focus:ring-0"
                  />
                  {lang.yes}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === false}
                    onChange={() =>
                      setForm((f) => ({ ...f, attending: false }))
                    }
                    className="w-3.5 h-3.5 border border-[var(--foreground)] text-[var(--foreground)] focus:ring-0"
                  />
                  {lang.no}
                </label>
              </div>
            </div>
            {form.attending && (
              <>
                <div>
                  <label
                    htmlFor="guestCount"
                    className="block text-sm text-[var(--muted)] mb-2"
                  >
                    {lang.numberOfGuests}
                  </label>
                  <input
                    id="guestCount"
                    type="number"
                    min={1}
                    max={20}
                    value={form.guestCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        guestCount: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="guestNames"
                    className="block text-sm text-[var(--muted)] mb-2"
                  >
                    {lang.namesOfOtherGuests}
                  </label>
                  <textarea
                    id="guestNames"
                    rows={2}
                    value={form.guestNames}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, guestNames: e.target.value }))
                    }
                    className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                    placeholder={lang.onePerLine}
                  />
                </div>
              </>
            )}
            <div>
              <label
                htmlFor="message"
                className="block text-sm text-[var(--muted)] mb-2"
              >
                {lang.message}
              </label>
              <textarea
                id="message"
                rows={2}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                placeholder=" "
              />
            </div>
            {rsvpError && (
              <p className="text-sm text-red-600/90">{rsvpError}</p>
            )}
            <button
              type="submit"
              disabled={rsvpLoading}
              className="w-full py-3 mt-4 text-sm rounded-lg border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {rsvpLoading ? lang.sending : lang.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
