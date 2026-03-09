"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

const TIMELINE = [
  { time: "3:00 PM", timeZh: "下午 3:00", key: "ceremony" },
  { time: "4:00 PM", timeZh: "下午 4:00", key: "cocktailHour" },
  { time: "5:00 PM", timeZh: "下午 5:00", key: "dinnerReception" },
  { time: "8:30 PM", timeZh: "晚上 8:30", key: "sendOff" },
] as const;

export default function DetailsPage() {
  const { lang, locale } = useLocale();

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9]">
      <div className="max-w-md mx-auto py-16 px-4">
        <Link
          href="/"
          className="inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-10"
        >
          ← {lang.back}
        </Link>

        {/* Dress Code */}
        <section className="text-center mb-16">
          <h2 className="font-serif text-lg text-[var(--foreground)] mb-1">
            {lang.attireTitle}
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">{lang.attireSubtitle}</p>

          <div className="space-y-4 text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
            <p>{lang.attireMen}</p>
            <p>{lang.attireWomen}</p>
          </div>
        </section>

        {/* Itinerary */}
        <section className="text-center">
          <h2 className="font-serif text-lg text-[var(--foreground)] mb-8">
            {lang.itineraryTitle}
          </h2>

          <div className="space-y-6">
            {TIMELINE.map((item) => (
              <div key={item.key} className="flex items-baseline gap-4 justify-center">
                <span className="text-sm text-[var(--muted)] w-24 text-right shrink-0">
                  {locale === "zh" ? item.timeZh : item.time}
                </span>
                <span className="text-sm text-[var(--foreground)] w-40 text-left">
                  {lang[item.key]}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
