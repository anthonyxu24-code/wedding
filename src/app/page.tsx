"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";

const HERO_SCROLL_RANGE = 480;
const HERO_MIN_SCALE = 0.42;
const ARROW_HIDE_THRESHOLD = 280;

const PETALS = [
  { left: "8%",  kind: 1, dur: "12s", delay: "0s",    size: 12, color: "#e8a0a8" },
  { left: "18%", kind: 2, dur: "15s", delay: "-5s",   size: 10, color: "#f0b8bc" },
  { left: "28%", kind: 3, dur: "11s", delay: "-9s",   size: 14, color: "#e8a0a8" },
  { left: "38%", kind: 1, dur: "17s", delay: "-3s",   size: 9,  color: "#f5c8cc" },
  { left: "48%", kind: 2, dur: "13s", delay: "-7s",   size: 13, color: "#e08890" },
  { left: "58%", kind: 3, dur: "16s", delay: "-1s",   size: 10, color: "#f0b8bc" },
  { left: "68%", kind: 1, dur: "14s", delay: "-11s",  size: 15, color: "#e8a0a8" },
  { left: "78%", kind: 2, dur: "10s", delay: "-4s",   size: 11, color: "#f5c8cc" },
  { left: "88%", kind: 3, dur: "18s", delay: "-8s",   size: 12, color: "#e08890" },
  { left: "13%", kind: 2, dur: "16s", delay: "-13s",  size: 9,  color: "#f0b8bc" },
  { left: "43%", kind: 3, dur: "13s", delay: "-6s",   size: 14, color: "#e8a0a8" },
  { left: "73%", kind: 1, dur: "11s", delay: "-10s",  size: 10, color: "#f5c8cc" },
  { left: "93%", kind: 2, dur: "15s", delay: "-2s",   size: 13, color: "#e08890" },
  { left: "33%", kind: 1, dur: "17s", delay: "-14s",  size: 11, color: "#f0b8bc" },
];

export default function Home() {
  const { lang, date, time, address } = useLocale();
  const [showArrow, setShowArrow] = useState(true);

  // Refs for direct DOM style updates — avoids React re-renders on every frame
  const heroBgRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let lastShow = true;

    const tick = () => {
      const top = Math.max(
        window.scrollY ?? 0,
        document.documentElement.scrollTop ?? 0,
        document.body.scrollTop ?? 0
      );

      // Update hero background opacity directly on the DOM
      if (heroBgRef.current) {
        const opacity = top <= HERO_SCROLL_RANGE
          ? 1
          : Math.max(0, 1 - (top - HERO_SCROLL_RANGE) / 200);
        heroBgRef.current.style.opacity = String(opacity);
      }

      // Update poster scale directly on the DOM
      if (posterRef.current) {
        const scale = Math.max(
          HERO_MIN_SCALE,
          1 - (top / HERO_SCROLL_RANGE) * (1 - HERO_MIN_SCALE)
        );
        posterRef.current.style.transform = `scale(${scale})`;
      }

      // Only trigger a React re-render when arrow visibility actually changes
      const show = top < ARROW_HIDE_THRESHOLD;
      if (show !== lastShow) {
        setShowArrow(show);
        lastShow = show;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main className="min-h-screen font-sans">
      {/* Hero — fixed, shrinks on scroll (Apple-style) */}
      <div
        ref={heroBgRef}
        className="fixed inset-0 z-0 flex items-center justify-center bg-hero-sakura pointer-events-none"
        aria-hidden
      >
        {/* Soft colour washes — sky, mountains, blossom glow */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 650"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <filter id="f-md"><feGaussianBlur stdDeviation="16" /></filter>
            <filter id="f-lg"><feGaussianBlur stdDeviation="28" /></filter>
            <filter id="f-xl"><feGaussianBlur stdDeviation="42" /></filter>
          </defs>
          {/* Sky lavender wash */}
          <ellipse cx="500" cy="60"  rx="700" ry="200" fill="#d8d0f0" opacity="0.28" filter="url(#f-xl)" />
          {/* Distant mountains */}
          <ellipse cx="500" cy="280" rx="750" ry="120" fill="#c0b8d8" opacity="0.18" filter="url(#f-xl)" />
          <ellipse cx="200" cy="300" rx="360" ry="95"  fill="#b8b0d0" opacity="0.14" filter="url(#f-lg)" />
          <ellipse cx="800" cy="295" rx="320" ry="90"  fill="#b8b0d0" opacity="0.13" filter="url(#f-lg)" />
          {/* Blossom glow — center-left and center-right, visible on all screens */}
          <ellipse cx="200" cy="370" rx="220" ry="160" fill="#f0cdd4" opacity="0.45" filter="url(#f-xl)" />
          <ellipse cx="800" cy="360" rx="220" ry="160" fill="#f0cdd4" opacity="0.42" filter="url(#f-xl)" />
          <ellipse cx="180" cy="340" rx="130" ry="100" fill="#fde8ec" opacity="0.4"  filter="url(#f-lg)" />
          <ellipse cx="820" cy="335" rx="130" ry="100" fill="#fde8ec" opacity="0.38" filter="url(#f-lg)" />
          {/* Mist */}
          <ellipse cx="500" cy="430" rx="700" ry="65"  fill="white"  opacity="0.14" filter="url(#f-xl)" />
          <ellipse cx="500" cy="620" rx="700" ry="90"  fill="#f5f0ea" opacity="0.35" filter="url(#f-lg)" />
        </svg>


        {/* Falling sakura petals */}
        {PETALS.map((p, i) => (
          <div
            key={i}
            className={`petal petal-${p.kind}`}
            style={{
              left: p.left,
              "--dur": p.dur,
              "--delay": p.delay,
            } as React.CSSProperties}
          >
            <svg width={p.size} height={p.size * 1.2} viewBox="0 0 20 24" fill="none">
              <path
                d="M10 1 C14 1 19 5 19 10 C19 16 15 23 10 23 C5 23 1 16 1 10 C1 5 6 1 10 1Z"
                fill={p.color}
                opacity="0.85"
              />
              <path
                d="M10 1 C10 1 10 12 10 23"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.8"
              />
            </svg>
          </div>
        ))}
        <div
          ref={posterRef}
          className="relative w-full max-w-[min(720px,95vw)] aspect-[3/4] rounded-lg overflow-hidden"
          style={{
            transform: "scale(1)",
            transformOrigin: "center center",
            willChange: "transform",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04), 0 50px 100px -20px rgba(0,0,0,0.12)",
          }}
        >
          <Image
            src="/cover.png"
            alt="Cindy and Anthony — Four Seasons Kyoto, April 10, 2026"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 95vw, 720px"
            quality={95}
            priority
          />
        </div>
      </div>

      {/* Down arrow — scroll to RSVP & Registry */}
      <div
        className="fixed left-1/2 z-[40] -translate-x-1/2 transition-opacity duration-200"
        style={{
          bottom: "8%",
          opacity: showArrow ? 1 : 0,
          pointerEvents: showArrow ? "auto" : "none",
        }}
      >
        <button
          type="button"
          onClick={() =>
            document.getElementById("invite-section")?.scrollIntoView({ behavior: "smooth" })
          }
          className="p-2 text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
          aria-label="Scroll to RSVP and Registry"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Spacer so content starts below the fold */}
      <div className="relative z-10 min-h-[100dvh]" />

      {/* Details */}
      <section className="relative z-10 py-12 px-4 border-t border-[var(--border)] bg-[#fafaf9] flex justify-center">
        <div className="max-w-lg w-full flex flex-col items-center text-center">
          <p className="font-serif text-[var(--foreground)] text-lg">
            {lang.venue}
          </p>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-md">
            {address}
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">
            {date} · {time}
          </p>
        </div>
      </section>

      {/* Navigation — RSVP, Registry, Details, Location */}
      <section id="invite-section" className="relative z-10 py-16 px-4 bg-[#fafaf9] scroll-mt-4">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <Link
            href="/rsvp"
            className="text-center py-4 text-sm rounded-xl bg-[var(--foreground)] text-[var(--background)] shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            {lang.rsvp}
          </Link>
          <Link
            href="/registry"
            className="text-center py-4 text-sm rounded-xl border border-[var(--border)] text-[var(--muted)] bg-white/60 shadow-sm hover:border-[var(--foreground)] hover:text-[var(--foreground)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            {lang.registry}
          </Link>
          <Link
            href="/details"
            className="text-center py-4 text-sm rounded-xl border border-[var(--border)] text-[var(--muted)] bg-white/60 shadow-sm hover:border-[var(--foreground)] hover:text-[var(--foreground)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            {lang.details}
          </Link>
          <Link
            href="/location"
            className="text-center py-4 text-sm rounded-xl border border-[var(--border)] text-[var(--muted)] bg-white/60 shadow-sm hover:border-[var(--foreground)] hover:text-[var(--foreground)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            {lang.location}
          </Link>
        </div>
      </section>

      <footer className="relative z-10 py-10 px-4 text-center text-sm text-[var(--muted)]">
        {lang.footer}
      </footer>
    </main>
  );
}
