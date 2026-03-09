"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/contexts/LocaleContext";

export default function RegistryPage() {
  const { lang } = useLocale();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasSuccess =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("success") === "1";

  async function handleCardCheckout() {
    const value = parseFloat(amount);
    if (!value || value < 1) {
      setError(lang.giftAmountRequired);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

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

          {hasSuccess && (
            <div className="mb-6 py-3 px-4 border border-green-300 bg-green-50 text-green-800 text-sm rounded">
              {lang.thankYou}
            </div>
          )}

          {/* Amount input */}
          <div className="mb-6">
            <label className="block text-sm text-[var(--muted)] mb-2">
              {lang.giftAmount}
            </label>
            <div className="relative max-w-[200px] mx-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="0"
                className="w-full py-3 pl-7 pr-3 text-sm text-center border border-[var(--border)] bg-white focus:border-[var(--foreground)] outline-none transition-colors"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* Venmo — first */}
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

            {/* Card via Stripe Checkout — second */}
            <button
              onClick={handleCardCheckout}
              disabled={loading}
              className="w-full py-3 text-sm border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? lang.processing : lang.contributeCard}
            </button>

            {/* Alipay — if configured */}
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

            {/* External gift registry — if configured */}
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
