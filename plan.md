# Cindy & Anthony Wedding Website – Plan

> This file is the single source of truth. Current status and setup live here.

---

## Handoff summary (for a new chat)

**Project:** Wedding invitation site for Cindy & Anthony. `c:\Users\Admin\Documents\Wedding`. Next.js 14, Tailwind, Supabase (RSVP storage), Stripe (registry). EN/中文 toggle. Admin at `/admin`. Repo: https://github.com/anthonyxu24-code/wedding.

**Architecture (current):**
- `src/app/page.tsx` — Hero only. Fixed full-screen cover image (`public/cover.png`) that shrinks on scroll (Apple-style). Down-arrow button scrolls to venue details + nav buttons (RSVP, Registry, Details, Location). Animated falling sakura petals. Kyoto watercolour backdrop (soft blossom colour washes). `overscroll-behavior: none`. Scroll animation uses `requestAnimationFrame` + direct DOM ref updates (no React re-render per frame) to avoid mobile jitter.
- `src/app/rsvp/page.tsx` — Standalone RSVP form page (separate route, not a scroll section). Back link to home.
- `src/app/registry/page.tsx` — Standalone Registry page (separate route). Stripe + Alipay buttons. Back link to home.
- `src/app/details/page.tsx` — Attire (business formal) & wedding day itinerary. Back link to home.
- `src/app/location/page.tsx` — Venue info, embedded Google Map, directions (from Tokyo / Kansai Airport), where to stay (including Osaka as budget option). Back link to home.
- `src/app/admin/page.tsx` — Password-protected RSVP list at `/admin`.
- `src/contexts/LocaleContext.tsx` — Shared locale state (EN/中文), translations, date/time, address. Provided by `AppShell` in root layout so language choice persists across all pages.
- `src/components/AppShell.tsx` + `src/components/LanguageToggle.tsx` — Wrap the whole app; language toggle fixed top-right on every page.

**Cover image:** Custom watercolour illustration of Cindy & Anthony at Four Seasons Kyoto. `public/cover.png`. Rendered with `quality={95}`, `sizes="(max-width: 768px) 95vw, 720px"`.

**Styling notes:**
- Background gradient: lavender-blush sky → warm ivory (`.bg-hero-sakura` in `globals.css`).
- Sakura petal fall animations in `globals.css` (`petalFall1/2/3`), 14 petals in `page.tsx`.
- Form labels: `text-sm` normal case (not all-caps/tracked). Buttons: `text-sm`, no uppercase tracking.
- `overscroll-behavior: none` on body (no rubber-band bounce on mobile).

**What's next:** (1) Supabase: create project, run `supabase/schema.sql`, add env vars to `.env`. (2) Copy `.env.example` → `.env`, fill Supabase keys + `ADMIN_PASSWORD`. (3) Stripe Payment Link → `NEXT_PUBLIC_STRIPE_REGISTRY_URL`. (4) Stripe Payment Link with Alipay → `NEXT_PUBLIC_ALIPAY_REGISTRY_URL`. (5) Deploy to Vercel with same env vars. (6) Push latest changes to GitHub (`git add . && git commit -m "..." && git push`).

---

## Progress

| Step | Status | Notes |
|------|--------|--------|
| Scaffold Next.js 14 + Tailwind | Done | |
| Hero + shrink-on-scroll + sakura petals | Done | `public/cover.png` |
| RSVP page (`/rsvp`) | Done | Needs Supabase env vars + `rsvps` table |
| Registry page (`/registry`) | Done | Set `NEXT_PUBLIC_STRIPE_REGISTRY_URL` |
| Admin page (`/admin`) | Done | Set `ADMIN_PASSWORD` |
| Locale context (EN/中文 shared across pages) | Done | `src/contexts/LocaleContext.tsx` |
| Mobile jitter fix (rAF + DOM refs) | Done | |
| Kyoto watercolour backdrop | Done | Soft blossom washes in `page.tsx` |
| Cover image updated | Done | Custom watercolour illustration |
| Image quality fix | Done | `quality={95}`, proper `sizes` |
| Alipay button on Registry | Done | `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` |
| Details page (`/details`) | Done | Attire (business formal) + itinerary |
| Location page (`/location`) | Done | Venue, map, travel directions, where to stay |
| Home page nav (4 buttons) | Done | RSVP, Registry, Details, Location |
| Supabase setup | Pending | Run schema, add env vars |
| Stripe registry link | Pending | Set `NEXT_PUBLIC_STRIPE_REGISTRY_URL` |
| Alipay registry link | Pending | Set `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` |
| Vercel deployment | Pending | |

---

## GitHub

Repo: **https://github.com/anthonyxu24-code/wedding**. Push updates: `git add .` → `git commit -m "..."` → `git push`.

---

## Key paths

| What | Path |
|------|------|
| Main page (hero) | `src/app/page.tsx` |
| RSVP page | `src/app/rsvp/page.tsx` |
| Registry page | `src/app/registry/page.tsx` |
| RSVP API | `src/app/api/rsvp/route.ts` |
| Admin page | `src/app/admin/page.tsx` |
| Admin login API | `src/app/api/admin/login/route.ts` |
| Admin RSVPs API | `src/app/api/admin/rsvps/route.ts` |
| Details page | `src/app/details/page.tsx` |
| Location page | `src/app/location/page.tsx` |
| Locale context | `src/contexts/LocaleContext.tsx` |
| App shell + language toggle | `src/components/AppShell.tsx`, `src/components/LanguageToggle.tsx` |
| Supabase server client | `src/lib/supabase/server.ts` |
| Supabase table schema | `supabase/schema.sql` |
| Global styles + animations | `src/app/globals.css` |
| Env template | `.env.example` |

---

## Env vars & setup

Copy `.env.example` to `.env` and fill in:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Admin:** `ADMIN_PASSWORD` (for `/admin`)
- **Registry:** `NEXT_PUBLIC_STRIPE_REGISTRY_URL` (Stripe Payment Link for cash gifts)
- **Alipay:** `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` (Stripe Payment Link with Alipay enabled)
- **Optional:** `NEXT_PUBLIC_GIFT_REGISTRY_URL` (e.g. Amazon, Crate and Barrel)

---

## Your checklist

- [x] Cover image in `public/cover.png`
- [ ] Supabase project + `rsvps` table created
- [ ] Env vars filled in `.env`
- [ ] Stripe Payment Link (card) → `NEXT_PUBLIC_STRIPE_REGISTRY_URL`
- [ ] Stripe Payment Link (Alipay) → `NEXT_PUBLIC_ALIPAY_REGISTRY_URL`
- [ ] Set `ADMIN_PASSWORD` for `/admin`
- [ ] Deploy to Vercel

---

## Event details (for reference)

- **Names:** Cindy & Anthony
- **Date:** April 10, 2026 · 3:00 PM – 8:30 PM
- **Venue:** Four Seasons Hotel Kyoto
  445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan
