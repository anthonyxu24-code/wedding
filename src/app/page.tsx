"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const VENUE = "Four Seasons Hotel Kyoto";
const ADDRESS = "445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan";
const DATE = "April 10, 2026";
const TIME = "3:00 PM – 8:30 PM";

export default function Home() {
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
          guest_names: form.guestNames.trim() ? form.guestNames.trim().split(/\n/).map((s) => s.trim()).filter(Boolean) : [],
          message: form.message || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit RSVP");
      setRsvpSubmitted(true);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRsvpLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero / Cover */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-end pb-12 px-4 text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/cover.png"
            alt="Cindy and Anthony - Four Seasons Kyoto"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/30" aria-hidden />
        </div>
        <div className="relative z-10 text-white drop-shadow-lg max-w-xl">
          <p className="text-sm sm:text-base tracking-widest uppercase mb-2 opacity-95">
            We sincerely invite you and your family to join us
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif tracking-tight mb-4">
            Cindy & Anthony
          </h1>
          <p className="text-lg sm:text-xl font-medium mb-1">{VENUE}</p>
          <p className="text-sm opacity-90 mb-2">{DATE}</p>
          <p className="text-sm opacity-90">{TIME}</p>
        </div>
        <div className="relative z-10 mt-8 flex flex-wrap gap-4 justify-center">
          <a
            href="#rsvp"
            className="px-6 py-3 rounded-full bg-white/95 text-gray-900 font-medium hover:bg-white transition"
          >
            RSVP
          </a>
          <a
            href="#registry"
            className="px-6 py-3 rounded-full border-2 border-white/90 text-white font-medium hover:bg-white/10 transition"
          >
            Registry
          </a>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 px-4 bg-[var(--background)]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl font-serif text-[var(--accent)] mb-4">Celebrate with us</h2>
          <p className="text-[var(--muted)] mb-2">{VENUE}</p>
          <p className="text-[var(--foreground)] mb-6">{ADDRESS}</p>
          <p className="text-lg">
            {DATE} · {TIME}
          </p>
        </div>
      </section>

      {/* RSVP */}
      <section id="rsvp" className="py-16 px-4 bg-stone-50 scroll-mt-16">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-serif text-center text-[var(--accent)] mb-8">RSVP</h2>
          {rsvpSubmitted ? (
            <div className="text-center py-8 text-[var(--muted)]">
              <p className="text-lg font-medium text-[var(--foreground)]">Thank you!</p>
              <p>We&apos;ve received your response.</p>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Your name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.primaryName}
                  onChange={(e) => setForm((f) => ({ ...f, primaryName: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-[var(--foreground)] mb-2">Attending? *</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attending"
                      checked={form.attending === true}
                      onChange={() => setForm((f) => ({ ...f, attending: true }))}
                      className="text-[var(--accent)]"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attending"
                      checked={form.attending === false}
                      onChange={() => setForm((f) => ({ ...f, attending: false }))}
                      className="text-[var(--accent)]"
                    />
                    No
                  </label>
                </div>
              </div>
              {form.attending && (
                <>
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Number of guests (including you)
                    </label>
                    <input
                      id="guestCount"
                      type="number"
                      min={1}
                      max={20}
                      value={form.guestCount}
                      onChange={(e) => setForm((f) => ({ ...f, guestCount: parseInt(e.target.value, 10) || 1 }))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="guestNames" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Names of other guests (one per line)
                    </label>
                    <textarea
                      id="guestNames"
                      rows={3}
                      value={form.guestNames}
                      onChange={(e) => setForm((f) => ({ ...f, guestNames: e.target.value }))}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      placeholder="Guest 1&#10;Guest 2"
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              {rsvpError && <p className="text-red-600 text-sm">{rsvpError}</p>}
              <button
                type="submit"
                disabled={rsvpLoading}
                className="w-full py-3 rounded-md bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-60 transition"
              >
                {rsvpLoading ? "Sending…" : "Submit RSVP"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Registry */}
      <section id="registry" className="py-16 px-4 bg-[var(--background)] scroll-mt-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-serif text-[var(--accent)] mb-4">Registry</h2>
          <p className="text-[var(--muted)] mb-8">
            Your presence is our greatest gift. If you wish to give, we welcome contributions to our honeymoon or a gift from the links below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {process.env.NEXT_PUBLIC_STRIPE_REGISTRY_URL ? (
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-md bg-[var(--accent)] text-white font-medium hover:opacity-90 transition"
              >
                Contribute (cash gift)
              </a>
            ) : (
              <span className="inline-block px-6 py-3 rounded-md bg-stone-200 text-stone-500 cursor-not-allowed">
                Cash gift link (set NEXT_PUBLIC_STRIPE_REGISTRY_URL)
              </span>
            )}
            {process.env.NEXT_PUBLIC_GIFT_REGISTRY_URL && (
              <a
                href={process.env.NEXT_PUBLIC_GIFT_REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-md border-2 border-[var(--accent)] text-[var(--accent)] font-medium hover:bg-[var(--accent)] hover:text-white transition"
              >
                View gift registry
              </a>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-sm text-[var(--muted)]">
        Cindy & Anthony · April 10, 2026 · Four Seasons Hotel Kyoto
      </footer>
    </main>
  );
}
