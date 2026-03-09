"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface PhotoCarouselProps {
  photos: { src: string; alt: string }[];
  interval?: number;
}

const SWIPE_THRESHOLD = 50;

export function PhotoCarousel({ photos, interval = 4000 }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % photos.length);
  }, [photos.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + photos.length) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? next() : prev();
    }
    touchStart.current = null;
  }

  if (photos.length === 0) return null;

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-md group"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            quality={90}
            priority={i === 0}
          />
        </div>
      ))}

      {/* Nav arrows — always visible on mobile, hover on desktop */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm active:scale-90"
        aria-label="Previous photo"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity backdrop-blur-sm active:scale-90"
        aria-label="Next photo"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-5" : "bg-white/50 w-2.5"
            }`}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
