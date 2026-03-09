"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

export default function Home() {
  const { lang, date, time, address } = useLocale();

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
      <PageNav />

      <div className="max-w-md md:max-w-xl mx-auto py-10 px-4 flex flex-col items-center">
        {/* Cover image */}
        <div className="w-full max-w-[420px] aspect-[3/4] relative rounded-xl overflow-hidden shadow-md">
          <Image
            src="/cover.png"
            alt="Cindy and Anthony — Four Seasons Kyoto, April 10, 2026"
            fill
            className="object-contain object-center"
            sizes="(max-width: 768px) 90vw, 420px"
            quality={95}
            priority
          />
        </div>

        {/* Venue details */}
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
      </div>

      <footer className="py-10 px-4 text-center text-sm text-[var(--muted)]">
        {lang.footer}
      </footer>
    </main>
  );
}
