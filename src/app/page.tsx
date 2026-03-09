"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

export default function Home() {
  const { lang, date, time, address } = useLocale();
  const [hasRsvped, setHasRsvped] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setHasRsvped(localStorage.getItem("hasRsvped") === "1");
    } catch {
      setHasRsvped(false);
    }
  }, []);

  // Avoid flash while checking localStorage
  if (hasRsvped === null) {
    return <main className="min-h-screen bg-[#fafaf9]" />;
  }

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
      <PageNav />

      <div className="max-w-md md:max-w-2xl mx-auto py-10 px-4 flex flex-col items-center">
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

        {!hasRsvped ? (
          /* RSVP-focused view for first-time visitors */
          <div className="mt-10 flex flex-col items-center gap-4 w-full max-w-xs">
            <Link
              href="/rsvp"
              className="w-full py-3.5 text-center text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              {lang.rsvp}
            </Link>
            <button
              type="button"
              onClick={() => {
                try { localStorage.setItem("hasRsvped", "1"); } catch {}
                setHasRsvped(true);
              }}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {lang.alreadyRsvped}
            </button>
          </div>
        ) : (
          /* Normal view for returning visitors */
          <div className="mt-8 text-center">
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
        )}
      </div>

      <footer className="py-10 px-4 text-center text-sm text-[var(--muted)]">
        {lang.footer}
      </footer>
    </main>
  );
}
