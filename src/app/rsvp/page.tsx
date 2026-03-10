"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";
import { PageNav } from "@/components/PageNav";

type GuestInfo = {
  name: string;
  email: string;
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
  const token = searchParams.get("token");

  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [loadingGuest, setLoadingGuest] = useState(true);
  const [tokenError, setTokenError] = useState(false);

  const [step, setStep] = useState<Step>("form");
  const [isUpdate, setIsUpdate] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
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
      setTokenError(true);
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
      })
      .catch(() => setTokenError(true))
      .finally(() => setLoadingGuest(false));
  }, [token]);

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setStep("review");
  }

  async function handleConfirmSubmit() {
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
    }
  }

  function handleEditAgain() {
    setStep("form");
    setRsvpError("");
  }

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

  const parsedGuestNames = form.guestNames.trim()
    ? form.guestNames.trim().split(/\n/).map((s) => s.trim()).filter(Boolean)
    : [];

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
            <button
              type="button"
              onClick={handleEditAgain}
              className="mt-6 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)] transition-colors min-h-[44px]"
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
                <span className="text-[var(--foreground)] font-medium text-right">{guest.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">{lang.email}</span>
                <span className="text-[var(--foreground)] text-right">{guest.email}</span>
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
                  value={guest.name}
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
                  value={guest.email}
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
