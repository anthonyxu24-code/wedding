"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

export default function RegistryPage() {
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

        <div className="text-center">
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto mb-8">
            {lang.registryIntro}
          </p>
          <div className="flex flex-col gap-4">
            {process.env.NEXT_PUBLIC_STRIPE_REGISTRY_URL ? (
              <a
                href={process.env.NEXT_PUBLIC_STRIPE_REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 text-sm border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
              >
                {lang.contribute}
              </a>
            ) : (
              <span className="inline-block w-full py-3 text-sm border border-[var(--border)] text-[var(--muted)] cursor-default">
                {lang.contributeNotSet}
              </span>
            )}
            {process.env.NEXT_PUBLIC_VENMO_URL && (
              <a
                href={process.env.NEXT_PUBLIC_VENMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 text-sm border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
              >
                {lang.venmo}
              </a>
            )}
            {process.env.NEXT_PUBLIC_ALIPAY_REGISTRY_URL && (
              <a
                href={process.env.NEXT_PUBLIC_ALIPAY_REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 text-sm border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
              >
                {lang.alipay}
              </a>
            )}
            {process.env.NEXT_PUBLIC_GIFT_REGISTRY_URL && (
              <a
                href={process.env.NEXT_PUBLIC_GIFT_REGISTRY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 text-sm border border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {lang.giftRegistry}
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
