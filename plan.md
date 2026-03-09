# Cindy & Anthony Wedding Website – Plan

> This file is the single source of truth. Current status and setup live here.

---

## Handoff summary (for a new chat)

**Project:** Wedding invitation site for Cindy & Anthony. `c:\Users\Admin\Documents\Wedding`. Next.js 14, Tailwind, Supabase (RSVP storage), Stripe (registry), Resend (emails). EN/中文 toggle. Admin at `/admin`. Password-gated for guests. Deployed on Vercel.

**Live site:** `https://cindyandanthonykyoto2026.vercel.app`
**Repo:** https://github.com/anthonyxu24-code/wedding

**Architecture (current):**
- `src/app/page.tsx` — Hero only. Fixed full-screen cover image (`public/cover.png`) that shrinks on scroll (Apple-style). Down-arrow button scrolls to venue details + nav buttons (RSVP, Registry, Details, Location) in a 2×2 grid. Animated falling sakura petals. Kyoto watercolour backdrop (soft blossom colour washes). `overscroll-behavior: none`. Scroll animation uses `requestAnimationFrame` + direct DOM ref updates (no React re-render per frame) to avoid mobile jitter.
- `src/app/rsvp/page.tsx` — Standalone RSVP form page. After submit, fires confirmation email via Resend (non-blocking). Back link to home.
- `src/app/registry/page.tsx` — Standalone Registry page. Stripe (card) + Alipay buttons, each driven by env vars. Back link to home.
- `src/app/details/page.tsx` — Attire (business formal: dark suit/white shirt/tie for men, formal cocktail for women) & wedding day itinerary (3 PM ceremony, 4 PM cocktail, 5 PM dinner, 8:30 PM send-off). Back link to home.
- `src/app/location/page.tsx` — Venue info (Four Seasons Kyoto, Higashiyama), embedded Google Maps iframe, "Get Directions" button (Apple Maps on iOS, Google Maps elsewhere), travel from Tokyo (Shinkansen) and Kansai Airport (Haruka Express), where to stay (venue, Kyoto Station area, guesthouses, Osaka as budget option). Back link to home.
- `src/app/admin/page.tsx` — Password-protected admin panel with two tabs: **RSVPs** (view/delete responses, attendance stats) and **Guest List** (add guests with EN/ZH flag, batch send invitations via Resend, per-row resend/delete, send status tracking).
- `src/contexts/LocaleContext.tsx` — Shared locale state (EN/中文), translations, date/time, address. Reads `?lang=en` or `?lang=zh` from URL on load (for email links). Provided by `AppShell` in root layout.
- `src/components/AppShell.tsx` — Wraps the whole app. Checks pathname — `/admin` bypasses guest gate, all other pages go through `GuestGate` → `LocaleProvider` → `LanguageToggle`.
- `src/components/GuestGate.tsx` — Shared guest password gate. Checks `NEXT_PUBLIC_GUEST_PASSWORD`. Uses sessionStorage so guests only enter it once per session.
- `src/components/LanguageToggle.tsx` — EN/中文 toggle fixed top-right on every page.
- `src/lib/email-templates.ts` — Invitation email (cover image, bold title, date/venue, RSVP button, password box, secondary links) and confirmation email (thank you, RSVP summary, links to other pages). Both have EN and ZH versions. All inline-styled HTML for email client compatibility.
- `src/lib/admin-auth.ts` — Shared admin auth helper (checks admin_session cookie).
- `src/app/api/rsvp/route.ts` — POST: insert RSVP into Supabase, fire confirmation email via Resend (looks up guest locale from guests table).
- `src/app/api/admin/guests/route.ts` — GET/POST/DELETE for guest list CRUD.
- `src/app/api/admin/send-invites/route.ts` — POST: batch send invitation emails via Resend, marks guests as sent in Supabase.
- `src/app/api/admin/rsvps/route.ts` — GET/DELETE for RSVP management.
- `src/app/api/admin/login/route.ts` — POST: admin login, sets session cookie.
- `src/app/api/admin/logout/route.ts` — POST: clears session cookie.

**Cover image:** Custom watercolour illustration of Cindy & Anthony at Four Seasons Kyoto. `public/cover.png`. Rendered with `quality={95}`, `sizes="(max-width: 768px) 95vw, 720px"`.

**Styling notes:**
- Background gradient: lavender-blush sky → warm ivory (`.bg-hero-sakura` in `globals.css`).
- Sakura petal fall animations in `globals.css` (`petalFall1/2/3`), 14 petals in `page.tsx`.
- Form labels: `text-sm` normal case (not all-caps/tracked). Buttons: `text-sm`, no uppercase tracking.
- `overscroll-behavior: none` on body (no rubber-band bounce on mobile).

**What's next:** (1) Stripe activation (pending approval) — update `NEXT_PUBLIC_STRIPE_REGISTRY_URL` with live Payment Link. (2) Alipay Payment Link → `NEXT_PUBLIC_ALIPAY_REGISTRY_URL`. (3) Any UI/content tweaks.

---

## Progress

| Step | Status | Notes |
|------|--------|--------|
| Scaffold Next.js 14 + Tailwind | Done | |
| Hero + shrink-on-scroll + sakura petals | Done | `public/cover.png` |
| RSVP page (`/rsvp`) | Done | Connected to Supabase |
| Registry page (`/registry`) | Done | Stripe + Alipay buttons |
| Admin page (`/admin`) | Done | Tabbed: RSVPs + Guest List |
| Locale context (EN/中文 shared across pages) | Done | `src/contexts/LocaleContext.tsx` |
| Mobile jitter fix (rAF + DOM refs) | Done | |
| Kyoto watercolour backdrop | Done | Soft blossom washes in `page.tsx` |
| Cover image updated | Done | Custom watercolour illustration |
| Image quality fix | Done | `quality={95}`, proper `sizes` |
| Alipay button on Registry | Done | `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` |
| Details page (`/details`) | Done | Attire (business formal) + itinerary |
| Location page (`/location`) | Done | Venue, map, travel directions, where to stay |
| Home page nav (4 buttons) | Done | RSVP, Registry, Details, Location |
| Supabase setup | Done | `rsvps` + `guests` tables |
| Email system (Resend) | Done | Invitation + confirmation emails, EN/ZH |
| Guest list management | Done | Add/delete guests, batch send, resend |
| Password gate | Done | Shared guest password via `NEXT_PUBLIC_GUEST_PASSWORD` |
| Locale from URL param | Done | `?lang=en` / `?lang=zh` from email links |
| Vercel deployment | Done | `cindyandanthonykyoto2026.vercel.app` |
| Stripe activation | Pending | Waiting for Stripe approval |
| Alipay registry link | Pending | Create after Stripe is live |

---

## GitHub

Repo: **https://github.com/anthonyxu24-code/wedding**. Auto-deploys to Vercel on push. Push updates: `git add .` → `git commit -m "..."` → `git push`.

---

## Key paths

| What | Path |
|------|------|
| Main page (hero) | `src/app/page.tsx` |
| RSVP page | `src/app/rsvp/page.tsx` |
| Registry page | `src/app/registry/page.tsx` |
| Details page | `src/app/details/page.tsx` |
| Location page | `src/app/location/page.tsx` |
| Admin page | `src/app/admin/page.tsx` |
| RSVP API | `src/app/api/rsvp/route.ts` |
| Admin login API | `src/app/api/admin/login/route.ts` |
| Admin logout API | `src/app/api/admin/logout/route.ts` |
| Admin RSVPs API | `src/app/api/admin/rsvps/route.ts` |
| Admin guests API | `src/app/api/admin/guests/route.ts` |
| Send invites API | `src/app/api/admin/send-invites/route.ts` |
| Email templates | `src/lib/email-templates.ts` |
| Admin auth helper | `src/lib/admin-auth.ts` |
| Locale context | `src/contexts/LocaleContext.tsx` |
| App shell | `src/components/AppShell.tsx` |
| Guest gate | `src/components/GuestGate.tsx` |
| Language toggle | `src/components/LanguageToggle.tsx` |
| Supabase server client | `src/lib/supabase/server.ts` |
| Supabase table schema | `supabase/schema.sql` |
| Global styles + animations | `src/app/globals.css` |
| Env template | `.env.example` |

---

## Env vars & setup

Copy `.env.example` to `.env` and fill in. Also set these in **Vercel > Settings > Environment Variables**.

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Admin:** `ADMIN_PASSWORD` (for `/admin`)
- **Registry:** `NEXT_PUBLIC_STRIPE_REGISTRY_URL` (Stripe Payment Link for card gifts)
- **Alipay:** `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` (Stripe Payment Link with Alipay enabled)
- **Email:** `RESEND_API_KEY` (from resend.com)
- **Site URL:** `NEXT_PUBLIC_SITE_URL` (used in email links + cover image)
- **Guest password:** `NEXT_PUBLIC_GUEST_PASSWORD` (shared password for site access)
- **Optional:** `NEXT_PUBLIC_GIFT_REGISTRY_URL` (e.g. Amazon, Crate and Barrel)

---

## Your checklist

- [x] Cover image in `public/cover.png`
- [x] Supabase project + `rsvps` table created
- [x] Supabase `guests` table created
- [x] Env vars filled in `.env`
- [x] Env vars set in Vercel
- [x] Resend account + API key
- [x] Set `ADMIN_PASSWORD` for `/admin`
- [x] Guest password gate
- [x] Deploy to Vercel
- [ ] Stripe activation (waiting for approval)
- [ ] Live Stripe Payment Link (card) → update `NEXT_PUBLIC_STRIPE_REGISTRY_URL`
- [ ] Stripe Payment Link (Alipay) → `NEXT_PUBLIC_ALIPAY_REGISTRY_URL`

---

## Event details (for reference)

- **Names:** Cindy & Anthony
- **Date:** April 10, 2026 · 3:00 PM – 8:30 PM
- **Venue:** Four Seasons Hotel Kyoto
  445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan
- **Dress code:** Business formal
- **Live site:** https://cindyandanthonykyoto2026.vercel.app
- **Guest password:** Hagabooga
- **Admin password:** Xx950925!
