"use client";

import Link from "next/link";
import { useLocale, ADDRESS } from "@/contexts/LocaleContext";

const GOOGLE_MAPS_QUERY = encodeURIComponent(
  "Four Seasons Hotel Kyoto, 445-3 Myohoin Maekawa-cho, Higashiyama-ku, Kyoto"
);
const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${GOOGLE_MAPS_QUERY}`;
const APPLE_MAPS_URL = `https://maps.apple.com/?q=${GOOGLE_MAPS_QUERY}`;
const EMBED_URL = `https://www.google.com/maps/embed/v1/place?key=&q=${GOOGLE_MAPS_QUERY}`;
const EMBED_FALLBACK = `https://maps.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed`;

function DirectionsLink({ label }: { label: string }) {
  const handleClick = () => {
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
    window.open(isApple ? APPLE_MAPS_URL : GOOGLE_MAPS_URL, "_blank", "noopener");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-block w-full py-3 text-sm border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
    >
      {label}
    </button>
  );
}

interface StayCardProps {
  title: string;
  description: string;
}

function StayCard({ title, description }: StayCardProps) {
  return (
    <div className="border-t border-[var(--border)] pt-4">
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

export default function LocationPage() {
  const { lang } = useLocale();

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9]">
      <div className="max-w-md mx-auto py-16 px-4">
        <Link
          href="/"
          className="inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-10"
        >
          ← {lang.back}
        </Link>

        {/* The Venue */}
        <section className="text-center mb-12">
          <h2 className="font-serif text-lg text-[var(--foreground)] mb-4">
            {lang.venueTitle}
          </h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto mb-2">
            {lang.venueDescription}
          </p>
          <p className="text-xs text-[var(--muted)] mb-6">{ADDRESS}</p>

          {/* Embedded map */}
          <div className="w-full aspect-[4/3] rounded overflow-hidden mb-4 bg-[var(--border)]">
            <iframe
              src={EMBED_FALLBACK}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Four Seasons Hotel Kyoto"
              allowFullScreen
            />
          </div>

          <DirectionsLink label={lang.getDirections} />
        </section>

        {/* Getting There */}
        <section className="mb-12">
          <h2 className="font-serif text-lg text-[var(--foreground)] text-center mb-6">
            {lang.gettingThereTitle}
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{lang.fromTokyo}</p>
              <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{lang.fromTokyoDesc}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{lang.fromKansai}</p>
              <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{lang.fromKansaiDesc}</p>
            </div>
          </div>
        </section>

        {/* Where to Stay */}
        <section>
          <h2 className="font-serif text-lg text-[var(--foreground)] text-center mb-6">
            {lang.whereToStayTitle}
          </h2>

          <div className="space-y-5">
            <StayCard title={lang.stayVenue} description={lang.stayVenueDesc} />
            <StayCard title={lang.stayKyotoStation} description={lang.stayKyotoStationDesc} />
            <StayCard title={lang.stayGuesthouses} description={lang.stayGuesthousesDesc} />
            <StayCard title={lang.stayOsaka} description={lang.stayOsakaDesc} />
          </div>
        </section>
      </div>
    </main>
  );
}
