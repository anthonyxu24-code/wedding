"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const ADDRESS = "445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan";
const DATE_EN = "April 10, 2026";
const TIME_EN = "3:00 PM – 8:30 PM";
const DATE_ZH = "2026年4月10日";
const TIME_ZH = "下午3:00 – 8:30";

const HERO_SCROLL_RANGE = 480;
const HERO_MIN_SCALE = 0.42;

type Tab = "rsvp" | "registry";
type Locale = "en" | "zh";

const t: Record<Locale, Record<string, string>> = {
  en: {
    venue: "Four Seasons Hotel Kyoto",
    rsvp: "RSVP",
    registry: "Registry",
    yourName: "Your name",
    email: "Email",
    attending: "Attending",
    yes: "Yes",
    no: "No",
    numberOfGuests: "Number of guests",
    namesOfOtherGuests: "Names of other guests",
    onePerLine: "One per line",
    message: "Message",
    submit: "Submit",
    sending: "Sending…",
    thankYou: "Thank you.",
    receivedResponse: "We've received your response.",
    registryIntro: "Your presence is our greatest gift. Should you wish to give, we welcome a contribution toward our honeymoon or a gift from the links below.",
    contribute: "Contribute",
    contributeNotSet: "Contribute (link not set)",
    giftRegistry: "Gift registry",
    footer: "Cindy & Anthony · April 10, 2026 · Kyoto",
  },
  zh: {
    venue: "京都四季酒店",
    rsvp: "回复",
    registry: "礼品",
    yourName: "您的姓名",
    email: "电子邮箱",
    attending: "是否出席",
    yes: "是",
    no: "否",
    numberOfGuests: "宾客人数",
    namesOfOtherGuests: "其他宾客姓名",
    onePerLine: "每行一位",
    message: "留言",
    submit: "提交",
    sending: "提交中…",
    thankYou: "谢谢您。",
    receivedResponse: "我们已收到您的回复。",
    registryIntro: "您的莅临是我们最好的礼物。若您想送上一份心意，欢迎以礼金或以下礼品链接的方式表达。",
    contribute: "礼金",
    contributeNotSet: "礼金（未设置链接）",
    giftRegistry: "礼品登记",
    footer: "Cindy & Anthony · 2026年4月10日 · 京都",
  },
};

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [scrollY, setScrollY] = useState(0);
  const [tab, setTab] = useState<Tab>("rsvp");
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const lang = t[locale];
  const date = locale === "zh" ? DATE_ZH : DATE_EN;
  const time = locale === "zh" ? TIME_ZH : TIME_EN;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroScale = Math.max(HERO_MIN_SCALE, 1 - (scrollY / HERO_SCROLL_RANGE) * (1 - HERO_MIN_SCALE));
  const heroOpacity = Math.max(0, 1 - (scrollY - HERO_SCROLL_RANGE) / 200);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState("");
  const [form, setForm] = useState({
    primaryName: "",
    email: "",
    attending: true,
    guestCount: 1,
    guestNames: "",
    message: "",
  });

  async function handleRsvpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRsvpError("");
    setRsvpLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_name: form.primaryName,
          email: form.email,
          attending: form.attending,
          guest_count: form.guestCount,
          guest_names: form.guestNames.trim()
            ? form.guestNames
                .trim()
                .split(/\n/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          message: form.message || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit RSVP");
      setRsvpSubmitted(true);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRsvpLoading(false);
    }
  }

  return (
    <main className="min-h-screen font-sans">
      {/* Language toggle — top right */}
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

      {/* Hero — fixed, shrinks on scroll (Apple-style) */}
      <div
        className="fixed inset-0 z-0 flex items-center justify-center bg-hero-sakura pointer-events-none"
        style={{ opacity: scrollY <= HERO_SCROLL_RANGE ? 1 : heroOpacity }}
        aria-hidden
      >
        <div
          className="relative w-full max-w-[min(720px,95vw)] aspect-[3/4] rounded-sm overflow-hidden transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${heroScale})`,
            transformOrigin: "center center",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04), 0 50px 100px -20px rgba(0,0,0,0.12)",
          }}
        >
          <Image
            src="/cover.png"
            alt="Cindy and Anthony — Four Seasons Kyoto, April 10, 2026"
            fill
            className="object-contain object-center"
            sizes="720px"
            priority
          />
        </div>
      </div>

      {/* RSVP button — fixed, just under the photo */}
      <div
        className="fixed left-1/2 z-[40] -translate-x-1/2 pointer-events-auto transition-opacity duration-200"
        style={{
          bottom: "8%",
          opacity: scrollY < HERO_SCROLL_RANGE + 150 ? 1 : 0,
          pointerEvents: scrollY < HERO_SCROLL_RANGE + 150 ? "auto" : "none",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setTab("rsvp");
            document.getElementById("invite-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-[var(--foreground)] rounded-full shadow-none border border-[var(--foreground)]/20 bg-[var(--sakura-light)]/80 hover:bg-[var(--sakura-light)] transition-colors"
        >
          {lang.rsvp}
        </button>
      </div>

      {/* Spacer so content starts below the fold */}
      <div className="relative z-10 min-h-[100dvh]" />

      {/* Details */}
      <section className="relative z-10 py-12 px-4 border-t border-[var(--border)] bg-[#fafaf9] flex justify-center">
        <div className="max-w-lg w-full flex flex-col items-center text-center">
          <p className="font-serif text-[var(--foreground)] text-lg">{lang.venue}</p>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-md">{ADDRESS}</p>
          <p className="text-sm text-[var(--muted)] mt-4">{date} · {time}</p>
        </div>
      </section>

      {/* Tabs: RSVP | Registry */}
      <section id="invite-section" className="relative z-10 py-16 px-4 bg-[#fafaf9] scroll-mt-4">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center border-b border-[var(--border)] mb-10">
            <button
              type="button"
              onClick={() => setTab("rsvp")}
              className="font-serif text-sm tracking-wide px-6 py-3 -mb-px border-b-2 transition-colors"
              style={{
                borderColor: tab === "rsvp" ? "var(--foreground)" : "transparent",
                color: tab === "rsvp" ? "var(--foreground)" : "var(--muted)",
              }}
            >
              {lang.rsvp}
            </button>
            <button
              type="button"
              onClick={() => setTab("registry")}
              className="font-serif text-sm tracking-wide px-6 py-3 -mb-px border-b-2 transition-colors"
              style={{
                borderColor: tab === "registry" ? "var(--foreground)" : "transparent",
                color: tab === "registry" ? "var(--foreground)" : "var(--muted)",
              }}
            >
              {lang.registry}
            </button>
          </div>

          {tab === "rsvp" && (
            <div>
              {rsvpSubmitted ? (
                <div className="text-center py-12 text-[var(--muted)]">
                  <p className="font-serif text-[var(--foreground)] text-lg">{lang.thankYou}</p>
                  <p className="text-sm mt-1">{lang.receivedResponse}</p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-xs tracking-wider uppercase text-[var(--muted)] mb-2">
                      {lang.yourName}
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.primaryName}
                      onChange={(e) => setForm((f) => ({ ...f, primaryName: e.target.value }))}
                      className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-zinc-400"
                      placeholder=" "
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs tracking-wider uppercase text-[var(--muted)] mb-2">
                      {lang.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors placeholder:text-zinc-400"
                      placeholder=" "
                    />
                  </div>
                  <div>
                    <span className="block text-xs tracking-wider uppercase text-[var(--muted)] mb-3">{lang.attending}</span>
                    <div className="flex gap-8">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="attending"
                          checked={form.attending === true}
                          onChange={() => setForm((f) => ({ ...f, attending: true }))}
                          className="w-3.5 h-3.5 border border-[var(--foreground)] text-[var(--foreground)] focus:ring-0"
                        />
                        {lang.yes}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="attending"
                          checked={form.attending === false}
                          onChange={() => setForm((f) => ({ ...f, attending: false }))}
                          className="w-3.5 h-3.5 border border-[var(--foreground)] text-[var(--foreground)] focus:ring-0"
                        />
                        {lang.no}
                      </label>
                    </div>
                  </div>
                  {form.attending && (
                    <>
                      <div>
                        <label htmlFor="guestCount" className="block text-xs tracking-wider uppercase text-[var(--muted)] mb-2">
                          {lang.numberOfGuests}
                        </label>
                        <input
                          id="guestCount"
                          type="number"
                          min={1}
                          max={20}
                          value={form.guestCount}
                          onChange={(e) => setForm((f) => ({ ...f, guestCount: parseInt(e.target.value, 10) || 1 }))}
                          className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="guestNames" className="block text-xs tracking-wider uppercase text-[var(--muted)] mb-2">
                          {lang.namesOfOtherGuests}
                        </label>
                        <textarea
                          id="guestNames"
                          rows={2}
                          value={form.guestNames}
                          onChange={(e) => setForm((f) => ({ ...f, guestNames: e.target.value }))}
                          className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                          placeholder={lang.onePerLine}
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label htmlFor="message" className="block text-xs tracking-wider uppercase text-[var(--muted)] mb-2">
                      {lang.message}
                    </label>
                    <textarea
                      id="message"
                      rows={2}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full px-0 py-2 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                      placeholder=" "
                    />
                  </div>
                  {rsvpError && <p className="text-sm text-red-600/90">{rsvpError}</p>}
                  <button
                    type="submit"
                    disabled={rsvpLoading}
                    className="w-full py-3 mt-4 text-xs tracking-widest uppercase border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors disabled:opacity-50"
                  >
                    {rsvpLoading ? lang.sending : lang.submit}
                  </button>
                </form>
              )}
            </div>
          )}

          {tab === "registry" && (
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
                    className="inline-block w-full py-3 text-xs tracking-widest uppercase border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                  >
                    {lang.contribute}
                  </a>
                ) : (
                  <span className="inline-block w-full py-3 text-xs tracking-widest uppercase border border-[var(--border)] text-[var(--muted)] cursor-default">
                    {lang.contributeNotSet}
                  </span>
                )}
                {process.env.NEXT_PUBLIC_GIFT_REGISTRY_URL && (
                  <a
                    href={process.env.NEXT_PUBLIC_GIFT_REGISTRY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-3 text-xs tracking-widest uppercase border border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {lang.giftRegistry}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 py-10 px-4 text-center text-xs text-[var(--muted)] tracking-wide">
        {lang.footer}
      </footer>
    </main>
  );
}
