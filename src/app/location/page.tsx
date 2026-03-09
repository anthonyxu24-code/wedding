"use client";

import { useLocale, ADDRESS } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";
import { PhotoCarousel } from "@/components/PhotoCarousel";

const VENUE_PHOTOS = [
  { src: "/venue-1.png", alt: "Four Seasons Hotel Kyoto — Entrance" },
  { src: "/venue-2.png", alt: "Four Seasons Hotel Kyoto — Pond Garden" },
  { src: "/venue-3.png", alt: "Four Seasons Hotel Kyoto — Cherry Blossoms" },
  { src: "/kyoto-1.jpg", alt: "Kyoto — Fushimi Inari" },
  { src: "/venue-4.png", alt: "Kyoto — Sakura Season" },
  { src: "/venue-5.png", alt: "Four Seasons Hotel Kyoto — Garden Bridge" },
  { src: "/kyoto-2.jpg", alt: "Kyoto — Bamboo Grove" },
  { src: "/kyoto-3.jpg", alt: "Kyoto — Traditional Temple" },
];

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
      className="inline-block w-full py-3 text-sm rounded-lg border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-200 hover:shadow-md"
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
    <div className="rounded-lg bg-white/60 p-4 shadow-sm">
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

export default function LocationPage() {
  const { lang } = useLocale();

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
      <PageNav />
      <div className="max-w-md md:max-w-4xl mx-auto py-10 px-4">

        {/* Photo Carousel */}
        <section className="mb-12">
          <PhotoCarousel photos={VENUE_PHOTOS} interval={4500} />
        </section>

        {/* The Venue — map + info side by side on desktop */}
        <section className="mb-12">
          <h2 className="font-serif text-lg text-[var(--foreground)] text-center mb-6">
            {lang.venueTitle}
          </h2>
          <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 md:mb-0 bg-[var(--border)] shadow-sm">
              <iframe
                src={EMBED_FALLBACK}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Four Seasons Hotel Kyoto"
                allowFullScreen
              />
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-2">
                {lang.venueDescription}
              </p>
              <p className="text-xs text-[var(--muted)] mb-6">{ADDRESS}</p>
              <DirectionsLink label={lang.getDirections} />
            </div>
          </div>
        </section>

        {/* Getting There — side by side on desktop */}
        <section className="mb-12">
          <h2 className="font-serif text-lg text-[var(--foreground)] text-center mb-6">
            {lang.gettingThereTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/60 p-4 shadow-sm">
              <p className="text-sm font-medium text-[var(--foreground)]">{lang.fromTokyo}</p>
              <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{lang.fromTokyoDesc}</p>
            </div>
            <div className="rounded-lg bg-white/60 p-4 shadow-sm">
              <p className="text-sm font-medium text-[var(--foreground)]">{lang.fromKansai}</p>
              <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{lang.fromKansaiDesc}</p>
            </div>
          </div>
        </section>

        {/* Where to Stay — 2-column grid on desktop */}
        <section>
          <h2 className="font-serif text-lg text-[var(--foreground)] text-center mb-6">
            {lang.whereToStayTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
