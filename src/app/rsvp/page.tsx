"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

type GuestInfo = {
  name: string | null;
  email: string | null;
  locale: string;
};

type ExistingRsvp = {
  attending: boolean;
  guest_count: number;
  guest_names: string[];
  message: string | null;
  address: string | null;
};

type Step = "form" | "review" | "done";

function RsvpPageInner() {
  const { lang } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [loadingGuest, setLoadingGuest] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  const [verified, setVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeVerifying, setCodeVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [selfEmail, setSelfEmail] = useState("");
  const [selfName, setSelfName] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [isUpdate, setIsUpdate] = useState(false);
  const [redirectCount, setRedirectCount] = useState(5);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const submittingRef = useRef(false);
  const [rsvpError, setRsvpError] = useState("");
  const [form, setForm] = useState({
    attending: true,
    guestCount: "1",
    guestNames: "",
    message: "",
    address: "",
  });

  useEffect(() => {
    if (!token) {
      setLoadingGuest(false);
      setTokenError(false);
      setGuest({ name: null, email: null, locale: searchParams.get("lang") || "en" });
      return;
    }

    fetch(`/api/rsvp/guest?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        setGuest(data.guest);
        if (data.rsvp) {
          setIsUpdate(true);
          setVerified(true);
          setForm({
            attending: data.rsvp.attending,
            guestCount: String(data.rsvp.guest_count),
            guestNames: Array.isArray(data.rsvp.guest_names)
              ? data.rsvp.guest_names.join("\n")
              : "",
            message: data.rsvp.message || "",
            address: data.rsvp.address || "",
          });
        }
        if (searchParams.get("codeSent") === "1") {
          setCodeSent(true);
          const em = data.guest?.email || "";
          setMaskedEmail(em ? em.replace(/(.{2}).*(@.*)/, "$1***$2") : "");
        }
      })
      .catch(() => setTokenError(true))
      .finally(() => setLoadingGuest(false));
  }, [token]);

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setStep("review");
  }

  async function handleConfirmSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setRsvpError("");
    setRsvpLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          attending: form.attending,
          guest_count: parseInt(form.guestCount, 10) || 1,
          guest_names: form.guestNames.trim()
            ? form.guestNames
                .trim()
                .split(/\n/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          message: form.message || null,
          address: form.address,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit RSVP");
      setStep("done");
      setIsUpdate(true);
      try { localStorage.setItem("hasRsvped", "1"); } catch {}
    } catch (err) {
      setRsvpError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setRsvpLoading(false);
      submittingRef.current = false;
    }
  }

  function handleEditAgain() {
    setStep("form");
    setRsvpError("");
    setRedirectCount(5);
  }

  useEffect(() => {
    if (step !== "done") return;
    if (redirectCount <= 0) {
      window.location.href = "/";
      return;
    }
    const t = setTimeout(() => setRedirectCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, redirectCount]);

  if (loadingGuest) {
    return (
      <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
        <PageNav />
        <div className="max-w-md md:max-w-xl mx-auto py-10 px-4 animate-fade-in">
          <p className="text-center text-[var(--muted)] py-12">{lang.sending}</p>
        </div>
      </main>
    );
  }

  if (tokenError || !guest) {
    return (
      <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
        <PageNav />
        <div className="max-w-md md:max-w-xl mx-auto py-10 px-4 animate-fade-in">
          <div className="text-center py-12">
            <p className="font-serif text-[var(--foreground)] text-xl mb-2">
              {lang.rsvpTokenRequired}
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {lang.rsvpTokenInstructions}
            </p>
          </div>
        </div>
      </main>
    );
  }

  async function handleSendCode() {
    const isOpen = !token;
    const needsEmail = !guest?.email;
    const needsName = !guest?.name?.trim();
    if (needsEmail && !selfEmail.trim()) return;
    if (needsName && !selfName.trim()) return;
    setCodeSending(true);
    setCodeError("");
    try {
      const res = await fetch("/api/rsvp/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: isOpen ? undefined : token,
          email: needsEmail ? selfEmail.trim() : undefined,
          name: needsName ? selfName.trim() : undefined,
          locale: guest?.locale || searchParams.get("lang") || "en",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");
      setCodeSent(true);
      setMaskedEmail(data.email || guest?.email || "");
      if (isOpen && data.token) {
        const lang = guest?.locale || searchParams.get("lang") || "en";
        router.replace(`/rsvp?token=${encodeURIComponent(data.token)}&lang=${lang}&codeSent=1`);
        return;
      }
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCodeSending(false);
    }
  }

  async function handleVerifyCode() {
    setCodeVerifying(true);
    setCodeError("");
    try {
      const res = await fetch("/api/rsvp/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code: codeInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      if (guest && (!guest.name?.trim() || !guest.email) && (selfName.trim() || selfEmail.trim())) {
        setGuest((prev) => prev ? { ...prev, name: selfName.trim() || prev.name || "", email: selfEmail.trim() || prev.email || "" } : prev);
      }
      setVerified(true);
    } catch {
      setCodeError(lang.verifyCodeInvalid);
    } finally {
      setCodeVerifying(false);
    }
  }

  const parsedGuestNames = form.guestNames.trim()
    ? form.guestNames.trim().split(/\n/).map((s) => s.trim()).filter(Boolean)
    : [];

  if (guest && !verified) {
    return (
      <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
        <PageNav />
        <div className="max-w-md md:max-w-xl mx-auto py-10 px-4 animate-fade-in">
          <div className="text-center space-y-6 py-8">
            <h1 className="font-serif text-[var(--foreground)] text-xl">
              {lang.rsvp}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {guest.name?.trim() ? guest.name : ""}{guest.name?.trim() && guest.email ? ` \u00b7 ${guest.email}` : guest.email ? guest.email : ""}
            </p>

            {!codeSent ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
                  {guest.name?.trim() && guest.email
                    ? (guest.locale === "zh"
                      ? "我们需要验证您的电子邮箱才能继续"
                      : "We need to verify your email to continue")
                    : !guest.name?.trim() && !guest.email
                    ? (guest.locale === "zh"
                      ? "请输入您的姓名和电子邮箱以接收验证码"
                      : "Please enter your name and email to receive a verification code")
                    : !guest.email
                    ? (guest.locale === "zh"
                      ? "请输入您的电子邮箱以接收验证码"
                      : "Please enter your email to receive a verification code")
                    : (guest.locale === "zh"
                      ? "请输入您的姓名以继续"
                      : "Please enter your name to continue")}
                </p>
                {!guest.name?.trim() && (
                  <input
                    type="text"
                    value={selfName}
                    onChange={(e) => setSelfName(e.target.value)}
                    placeholder={guest.locale === "zh" ? "您的姓名" : "Your name"}
                    className="w-full max-w-xs mx-auto block px-0 py-3 text-center bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  />
                )}
                {!guest.email && (
                  <input
                    type="email"
                    value={selfEmail}
                    onChange={(e) => setSelfEmail(e.target.value)}
                    placeholder={guest.locale === "zh" ? "您的电子邮箱" : "Your email address"}
                    className="w-full max-w-xs mx-auto block px-0 py-3 text-center bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  />
                )}
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={codeSending || (!guest.email && !selfEmail.trim()) || (!guest.name?.trim() && !selfName.trim())}
                  className="w-full max-w-xs mx-auto min-h-[44px] py-3 text-sm rounded-lg border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:shadow-md active:scale-[0.97] transition-all duration-200 disabled:opacity-50 block"
                >
                  {codeSending ? lang.sending : lang.sendVerifyCode}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {lang.verifyCodeSent} <strong>{maskedEmail}</strong>
                </p>
                <p className="text-xs text-[var(--muted)]">{lang.checkSpam}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={lang.verifyCodePlaceholder}
                  className="w-full max-w-[200px] mx-auto block px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] bg-transparent border-0 border-b-2 border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  autoFocus
                />
                {codeError && (
                  <p className="text-sm text-red-600/90">{codeError}</p>
                )}
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={codeVerifying || codeInput.length !== 6}
                  className="w-full max-w-xs mx-auto min-h-[44px] py-3 text-sm rounded-lg border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:shadow-md active:scale-[0.97] transition-all duration-200 disabled:opacity-50 block"
                >
                  {codeVerifying ? lang.sending : lang.verifyCode}
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={codeSending}
                  className="text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)] transition-colors min-h-[44px]"
                >
                  {lang.resendCode}
                </button>
              </div>
            )}

            {codeError && !codeSent && (
              <p className="text-sm text-red-600/90">{codeError}</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen font-sans bg-[#fafaf9] pb-28 md:pb-0">
      <PageNav />
      <div className="max-w-md md:max-w-xl mx-auto py-10 px-4 animate-fade-in">

        {/* ── Done ── */}
        {step === "done" && (
          <div className="text-center py-12 text-[var(--muted)]">
            <p className="font-serif text-[var(--foreground)] text-xl">
              {lang.thankYou}
            </p>
            <p className="text-sm mt-2 leading-relaxed">
              {isUpdate ? lang.rsvpUpdated : lang.receivedResponse}
            </p>
            <p className="text-sm mt-3 leading-relaxed">
              {lang.confirmationEmailNote}
            </p>
            <p className="text-xs mt-4 text-[var(--muted)]">
              Redirecting to home in {redirectCount}s…
            </p>
            <button
              type="button"
              onClick={handleEditAgain}
              className="mt-4 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)] transition-colors min-h-[44px]"
            >
              {lang.editResponse}
            </button>
          </div>
        )}

        {/* ── Review / Confirm ── */}
        {step === "review" && (
          <div className="space-y-6">
            <p className="text-sm text-center text-[var(--muted)]">
              {lang.reviewBeforeSubmit}
            </p>

            <div className="rounded-lg bg-white/60 p-5 shadow-sm space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">{lang.yourName}</span>
                <span className="text-[var(--foreground)] font-medium text-right">{guest.name || ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">{lang.email}</span>
                <span className="text-[var(--foreground)] text-right">{guest.email || ""}</span>
              </div>
              <hr className="border-[var(--border)]" />
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">{lang.attending}</span>
                <span className="text-[var(--foreground)] font-medium">{form.attending ? lang.yes : lang.no}</span>
              </div>
              {form.attending && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">{lang.numberOfGuests}</span>
                    <span className="text-[var(--foreground)]">{form.guestCount}</span>
                  </div>
                  {parsedGuestNames.length > 0 && (
                    <div>
                      <span className="text-[var(--muted)]">{lang.namesOfOtherGuests}</span>
                      <p className="text-[var(--foreground)] mt-1">{parsedGuestNames.join(", ")}</p>
                    </div>
                  )}
                </>
              )}
              <hr className="border-[var(--border)]" />
              <div>
                <span className="text-[var(--muted)]">{lang.mailingAddress}</span>
                <p className="text-[var(--foreground)] mt-1 whitespace-pre-line">{form.address}</p>
              </div>
              {form.message && (
                <div>
                  <span className="text-[var(--muted)]">{lang.message}</span>
                  <p className="text-[var(--foreground)] mt-1">{form.message}</p>
                </div>
              )}
            </div>

            {rsvpError && (
              <p className="text-sm text-red-600/90">{rsvpError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 min-h-[44px] py-3 text-sm rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] active:scale-[0.97] transition-all duration-200"
              >
                {lang.back}
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={rsvpLoading}
                className="flex-1 min-h-[44px] py-3 text-sm rounded-lg border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:shadow-md active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
              >
                {rsvpLoading ? lang.sending : lang.confirmSubmit}
              </button>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        {step === "form" && (
          <form onSubmit={handleReview} className="space-y-6">
            {isUpdate && (
              <p className="text-sm text-center text-[var(--muted)] -mb-2">
                {lang.rsvpUpdateNote}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-[var(--muted)] mb-2"
                >
                  {lang.yourName}
                </label>
                <input
                  id="name"
                  type="text"
                  readOnly
                  value={guest.name || ""}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none transition-colors opacity-70 cursor-default"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-[var(--muted)] mb-2"
                >
                  {lang.email}
                </label>
                <input
                  id="email"
                  type="email"
                  readOnly
                  value={guest.email || ""}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none transition-colors opacity-70 cursor-default"
                />
              </div>
            </div>

            <div>
              <span className="block text-sm text-[var(--muted)] mb-3">
                {lang.attending}
              </span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm min-h-[44px] px-4 py-2 rounded-lg border border-[var(--border)] transition-all duration-200 select-none active:scale-[0.97]"
                  style={form.attending === true ? { borderColor: 'var(--foreground)', backgroundColor: 'var(--foreground)', color: 'var(--background)' } : {}}
                >
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === true}
                    onChange={() =>
                      setForm((f) => ({ ...f, attending: true }))
                    }
                    className="sr-only"
                  />
                  {lang.yes}
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm min-h-[44px] px-4 py-2 rounded-lg border border-[var(--border)] transition-all duration-200 select-none active:scale-[0.97]"
                  style={form.attending === false ? { borderColor: 'var(--foreground)', backgroundColor: 'var(--foreground)', color: 'var(--background)' } : {}}
                >
                  <input
                    type="radio"
                    name="attending"
                    checked={form.attending === false}
                    onChange={() =>
                      setForm((f) => ({ ...f, attending: false }))
                    }
                    className="sr-only"
                  />
                  {lang.no}
                </label>
              </div>
            </div>
            {form.attending && (
              <>
                <div>
                  <label
                    htmlFor="guestCount"
                    className="block text-sm text-[var(--muted)] mb-2"
                  >
                    {lang.numberOfGuests}
                  </label>
                  <input
                    id="guestCount"
                    type="number"
                    min={1}
                    max={20}
                    value={form.guestCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        guestCount: e.target.value,
                      }))
                    }
                    onBlur={() =>
                      setForm((f) => {
                        const n = parseInt(f.guestCount, 10);
                        return {
                          ...f,
                          guestCount: String(
                            isNaN(n) || n < 1 ? 1 : n > 20 ? 20 : n
                          ),
                        };
                      })
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="guestNames"
                    className="block text-sm text-[var(--muted)] mb-2"
                  >
                    {lang.namesOfOtherGuests}
                  </label>
                  <textarea
                    id="guestNames"
                    rows={2}
                    value={form.guestNames}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, guestNames: e.target.value }))
                    }
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                    placeholder={lang.onePerLine}
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="address"
                className="block text-sm text-[var(--muted)] mb-2"
              >
                {lang.mailingAddress}
              </label>
              <textarea
                id="address"
                rows={2}
                required
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                placeholder={lang.mailingAddressPlaceholder}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm text-[var(--muted)] mb-2"
              >
                {lang.message}
              </label>
              <textarea
                id="message"
                rows={2}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)] transition-colors resize-none placeholder:text-zinc-400"
                placeholder=" "
              />
            </div>
            {rsvpError && (
              <p className="text-sm text-red-600/90">{rsvpError}</p>
            )}
            <button
              type="submit"
              className="w-full min-h-[44px] py-3 mt-4 text-sm rounded-lg border border-[var(--foreground)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:shadow-md active:scale-[0.97] transition-all duration-200"
            >
              {isUpdate ? lang.updateRsvp : lang.reviewAndSubmit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function RsvpPage() {
  return (
    <Suspense>
      <RsvpPageInner />
    </Suspense>
  );
}
