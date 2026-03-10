"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

const WEDDING_UTC = new Date("2026-04-10T06:00:00Z").getTime();

function Countdown() {
  const { lang } = useLocale();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    let last = 0;
    function tick(ts: number) {
      if (ts - last >= 1000) {
        setNow(Date.now());
        last = ts;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!mounted) return null;

  const diff = Math.max(0, WEDDING_UTC - now);
  if (diff === 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const units = [
    { value: days, label: lang.countdownDays },
    { value: hours, label: lang.countdownHours },
    { value: minutes, label: lang.countdownMinutes },
    { value: seconds, label: lang.countdownSeconds },
  ];

  return (
    <div className="mt-8 flex justify-center gap-3 sm:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span
            className="text-2xl sm:text-3xl font-serif text-[var(--foreground)] tabular-nums w-[2.4ch] text-center"
          >
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--muted)] mt-1 uppercase tracking-wider">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { lang, date, time, address } = useLocale();
  const [hasRsvped, setHasRsvped] = useState<boolean | null>(null);
  const [rsvpHref, setRsvpHref] = useState("/rsvp");

  useEffect(() => {
    try {
      setHasRsvped(localStorage.getItem("hasRsvped") === "1");
      const savedToken = localStorage.getItem("rsvpToken");
      if (savedToken) setRsvpHref(`/rsvp?token=${encodeURIComponent(savedToken)}`);
    } catch {
      setHasRsvped(false);
    }
  }, []);

  if (hasRsvped === null) {
    return <main className="min-h-screen bg-[#fafaf9]" />;
  }

  const petals = Array.from({ length: 18 }, (_, i) => {
    const variant = (i % 3) + 1;
    const left = Math.round((i / 18) * 100 + (i % 5) * 3);
    const dur = 8 + (i % 5) * 2;
    const delay = (i * 1.1) % 7;
    const size = 10 + (i % 4) * 3;
    return { variant, left, dur, delay, size };
  });

  return (
    <main className="min-h-screen font-sans bg-hero-sakura pb-28 md:pb-0 relative overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className={`petal petal-${p.variant}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            "--dur": `${p.dur}s`,
            "--delay": `${p.delay}s`,
            borderRadius: "50% 0 50% 50%",
            background: "linear-gradient(135deg, #f9cdd3 0%, #f4a6b0 100%)",
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
      <PageNav />

      <div className="max-w-md md:max-w-2xl mx-auto py-10 px-4 flex flex-col items-center animate-fade-in relative z-10">
        {/* Cover image */}
        <div className="w-full max-w-[420px] md:max-w-[560px] aspect-[3/4] relative rounded-xl overflow-hidden shadow-md">
          <Image
            src="/cover.png"
            alt="Cindy and Anthony — Four Seasons Kyoto, April 10, 2026"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 90vw, 560px"
            quality={95}
            priority
          />
        </div>

        {/* Countdown */}
        <Countdown />

        {!hasRsvped ? (
          <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-xs">
            <Link
              href={rsvpHref}
              className="w-full min-h-[44px] flex items-center justify-center text-center text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all duration-200"
            >
              {lang.rsvp}
            </Link>
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem("hasRsvped", "1"); } catch {}
                setHasRsvped(true);
              }}
              className="min-h-[44px] px-4 text-sm text-[var(--muted)] hover:text-[var(--foreground)] active:opacity-70 transition-colors"
            >
              {lang.alreadyRsvped}
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center text-center">
            <p className="font-serif text-[var(--foreground)] text-xl">
              {lang.venue}
            </p>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-md leading-relaxed">
              {address}
            </p>
            <p className="text-sm text-[var(--muted)] mt-4">
              {date} · {time}
            </p>
            <Link
              href={rsvpHref}
              className="mt-6 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)] transition-colors min-h-[44px] flex items-center"
            >
              {lang.editResponse}
            </Link>
          </div>
        )}
      </div>

      <footer className="py-10 px-4 text-center text-sm text-[var(--muted)]">
        {lang.footer}
      </footer>
    </main>
  );
}
