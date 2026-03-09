"use client";

import { useLocale } from "@/contexts/LocaleContext";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="fixed top-4 right-4 z-[50] flex items-center gap-0 rounded border border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setLocale("en")}
        className="px-3 py-1.5 text-xs tracking-wide transition-colors"
        style={{
          color: locale === "en" ? "var(--foreground)" : "var(--muted)",
          fontWeight: locale === "en" ? 500 : 400,
        }}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <span className="text-[var(--border)]">|</span>
      <button
        type="button"
        onClick={() => setLocale("zh")}
        className="px-3 py-1.5 text-xs tracking-wide transition-colors"
        style={{
          color: locale === "zh" ? "var(--foreground)" : "var(--muted)",
          fontWeight: locale === "zh" ? 500 : 400,
        }}
        aria-pressed={locale === "zh"}
      >
        中文
      </button>
    </div>
  );
}
