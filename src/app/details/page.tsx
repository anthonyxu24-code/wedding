"use client";

import Image from "next/image";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

export default function DetailsPage() {
  const { locale } = useLocale();

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
      <PageNav />
      <div className="max-w-[480px] md:max-w-[540px] mx-auto py-10 px-4 animate-fade-in space-y-10">
        {/* Dress Code */}
        <div className="rounded-xl overflow-hidden shadow-md">
          <Image
            src={locale === "zh" ? "/OutfitsChinese.jpg" : "/OutfitsEnglish.jpg"}
            alt={locale === "zh" ? "服装搭配" : "Dress Code"}
            width={1417}
            height={2520}
            className="w-full h-auto"
            quality={95}
            priority
          />
        </div>

        {/* Itinerary */}
        <div className="rounded-xl overflow-hidden shadow-md">
          <Image
            src={locale === "zh" ? "/TimelineChinese.jpg" : "/TimelineEnglish.jpg"}
            alt={locale === "zh" ? "婚礼流程" : "Wedding Process"}
            width={1417}
            height={2520}
            className="w-full h-auto"
            quality={95}
          />
        </div>
      </div>
    </main>
  );
}
