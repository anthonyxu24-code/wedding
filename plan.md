# Cindy & Anthony Wedding Website – Plan

> This file is the single source of truth. Current status and setup live here.

---

## Handoff summary (for a new chat)

**Project:** Wedding invitation site for Cindy & Anthony. `c:\Users\Admin\Documents\Wedding`. Next.js 14, Tailwind, Supabase (RSVP storage), Stripe (registry), SendGrid (emails). EN/中文 toggle. Admin at `/admin`. Password-gated for guests. Deployed on Vercel.

**Live site:** `https://cindyandanthony2026.com` (custom domain via Cloudflare)
**Old URL:** `https://cindyandanthonykyoto2026.vercel.app` (still works, redirects)
**Repo:** https://github.com/anthonyxu24-code/wedding

**Architecture (current):**
- `src/app/page.tsx` — Home page. Shows cover image, then either RSVP button (first-time visitors) or venue details (returning visitors). Uses `localStorage` to track RSVP state. "I've already RSVP'd" skip link for cross-device visitors. Shared `PageNav`.
- `src/app/rsvp/page.tsx` — RSVP form. Token-based: requires `?token=XXX` from invitation email. Pre-fills and locks guest name. Supports update if already RSVP'd. Collects attending, guest count, names, mailing address, message. Sets `localStorage` hasRsvped flag on submit. Sends confirmation email via SendGrid (non-blocking). Shared `PageNav`.
- `src/app/registry/page.tsx` — Registry page. Amount input + Venmo button + Stripe Checkout (card) button. Alipay/gift registry buttons if env vars set. Shared `PageNav`.
- `src/app/api/checkout/route.ts` — POST: creates a Stripe Checkout Session with custom amount, returns checkout URL.
- `src/app/details/page.tsx` — Dress code (Business Formal, with Gentlemen/Ladies labels) & wedding day itinerary. Shared `PageNav`.
- `src/app/location/page.tsx` — Venue info, photo carousel (swipe-enabled), Google Maps, directions (GPS coordinates for Apple Maps + Google Maps), travel info, where to stay. Shared `PageNav`.
- `src/app/admin/page.tsx` — Password-protected admin panel: **RSVPs** (view/delete, stats) and **Guest List** (add guests, batch send invitations via SendGrid, per-row resend/delete, status tracking). Error messages surfaced in alerts.
- `src/contexts/LocaleContext.tsx` — Shared locale state (EN/中文), translations, date/time, address.
- `src/components/AppShell.tsx` — Wraps app. `/admin` bypasses guest gate. `/rsvp?token=...` bypasses guest gate (token authenticates). All other pages: `GuestGate` → `LocaleProvider` → `LanguageToggle`.
- `src/components/GuestGate.tsx` — Guest password gate. Uses sessionStorage.
- `src/components/LanguageToggle.tsx` — EN/中文 toggle fixed top-right (pill shape).
- `src/components/PageNav.tsx` — Responsive nav. Desktop: sticky top bar. Mobile: fixed bottom tab bar with icons. Click-to-scroll-top on navigation.
- `src/components/PhotoCarousel.tsx` — Image carousel with auto-rotation, swipe support on mobile, visible arrows on mobile (hover on desktop), navigation dots.
- `src/lib/email-templates.ts` — Invitation email (cover image, title, date/venue, "View Invitation" button, "RSVP Now" button with personalized token link, password box, secondary links) and confirmation email. Both EN/ZH. Inline-styled HTML.
- `src/lib/admin-auth.ts` — Admin auth helper (checks admin_session cookie).
- `src/app/api/rsvp/route.ts` — POST: validates token, upserts RSVP into Supabase (linked to guest_id), fires confirmation email via SendGrid.
- `src/app/api/rsvp/guest/route.ts` — GET: looks up guest by rsvp_token, returns guest info + existing RSVP if any.
- `src/app/api/admin/guests/route.ts` — GET/POST/DELETE for guest list CRUD.
- `src/app/api/admin/send-invites/route.ts` — POST: batch send invitation emails via SendGrid, marks guests as sent.
- `src/app/api/admin/rsvps/route.ts` — GET/DELETE for RSVP management.
- `src/app/api/admin/login/route.ts` — POST: admin login, sets session cookie.
- `src/app/api/admin/logout/route.ts` — POST: clears session cookie.

**Styling notes:**
- Fade-in animation on page content (`animate-fade-in` in globals.css).
- 44px minimum touch targets on all buttons/links (Apple HIG compliant).
- `active:scale-[0.97]` press feedback on buttons.
- Section headings: `text-xl` for visual weight.
- Rounded corners, soft shadows, hover effects throughout.
- `overscroll-behavior: none` on body.

---

## Progress

| Step | Status | Notes |
|------|--------|--------|
| Scaffold Next.js 14 + Tailwind | Done | |
| RSVP page (`/rsvp`) | Done | Connected to Supabase |
| Registry page (`/registry`) | Done | Amount input + Venmo + Stripe Checkout |
| Admin page (`/admin`) | Done | Tabbed: RSVPs + Guest List |
| Locale context (EN/中文) | Done | |
| Details page (`/details`) | Done | Attire (Gentlemen/Ladies labels) + itinerary |
| Location page (`/location`) | Done | Venue, carousel, map, travel, where to stay |
| Supabase setup | Done | `rsvps` + `guests` tables |
| Email system (SendGrid) | Done | Switched from Resend. Domain authenticated via Cloudflare. |
| Guest list management | Done | Add/delete guests, batch send, resend |
| Password gate | Done | `NEXT_PUBLIC_GUEST_PASSWORD` |
| Vercel deployment | Done | Auto-deploys on push |
| Custom domain | Done | `cindyandanthony2026.com` via Cloudflare |
| SendGrid domain auth | Done | SPF/DKIM/DMARC verified, emails land in inbox |
| Stripe activation | Done | Live |
| Venmo on registry | Done | No fees |
| Responsive PageNav | Done | Desktop sticky top bar + mobile bottom tabs |
| Visual polish | Done | Rounded corners, softer buttons, card-style sections |
| RSVP-first home page | Done | First visitors see RSVP CTA, returning visitors see venue info |
| Mobile UX improvements | Done | Swipe carousel, 44px touch targets, press feedback, fade-in |
| Scroll-to-top on nav | Done | Click handler + scroll prop on Link |
| Fix maps directions | Done | GPS coordinates (34.989766, 135.775972) for Apple Maps + Google Maps |
| Personalized RSVP tokens | Done | Per-guest tokens, locked names, upsert, bypass guest gate |
| Mailing address on RSVP | Done | Required address field, shown in admin |
| RSVP review step | Done | Confirm screen before submit, edit response after submit |
| Confirmation email edit link | Done | "Edit Your Response" button with token link |
| Milestone reminder emails | Done | Vercel cron at 30/14/7 days before wedding, attending guests only |
| Cute RSVP tokens | Done | adjective-animal-NNNN format (e.g. happy-panda-3847) |
| Alipay registry link | Deferred | Will set up direct Alipay link later |

---

## GitHub

Repo: **https://github.com/anthonyxu24-code/wedding**. Auto-deploys to Vercel on push.

**Note:** Git is at `C:\Program Files\Git\cmd\git.exe`. In PowerShell, use `;` not `&&` to chain commands.

---

## Key paths

| What | Path |
|------|------|
| Main page (home) | `src/app/page.tsx` |
| RSVP page | `src/app/rsvp/page.tsx` |
| Registry page | `src/app/registry/page.tsx` |
| Details page | `src/app/details/page.tsx` |
| Location page | `src/app/location/page.tsx` |
| Admin page | `src/app/admin/page.tsx` |
| RSVP API | `src/app/api/rsvp/route.ts` |
| RSVP guest lookup API | `src/app/api/rsvp/guest/route.ts` |
| Admin login API | `src/app/api/admin/login/route.ts` |
| Admin logout API | `src/app/api/admin/logout/route.ts` |
| Admin RSVPs API | `src/app/api/admin/rsvps/route.ts` |
| Admin guests API | `src/app/api/admin/guests/route.ts` |
| Send invites API | `src/app/api/admin/send-invites/route.ts` |
| Checkout API | `src/app/api/checkout/route.ts` |
| Reminder cron API | `src/app/api/cron/reminders/route.ts` |
| Email templates | `src/lib/email-templates.ts` |
| Token generator | `src/lib/generate-token.ts` |
| Admin auth helper | `src/lib/admin-auth.ts` |
| Locale context | `src/contexts/LocaleContext.tsx` |
| App shell | `src/components/AppShell.tsx` |
| Guest gate | `src/components/GuestGate.tsx` |
| Language toggle | `src/components/LanguageToggle.tsx` |
| Page nav | `src/components/PageNav.tsx` |
| Photo carousel | `src/components/PhotoCarousel.tsx` |
| Supabase server client | `src/lib/supabase/server.ts` |
| Supabase table schema | `supabase/schema.sql` |
| RSVP tokens migration | `supabase/migration-rsvp-tokens.sql` |
| Global styles + animations | `src/app/globals.css` |
| Vercel config | `vercel.json` |
| Env template | `.env.example` |

---

## Env vars & setup

Copy `.env.example` to `.env` and fill in. Also set these in **Vercel > Settings > Environment Variables**.

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Admin:** `ADMIN_PASSWORD` (for `/admin`)
- **Stripe:** `STRIPE_SECRET_KEY` (server-side, for creating Checkout Sessions)
- **Registry:** `NEXT_PUBLIC_STRIPE_REGISTRY_URL` (Stripe Payment Link — fallback)
- **Venmo:** `NEXT_PUBLIC_VENMO_URL` (direct Venmo profile link, no fees)
- **Alipay:** `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` (deferred — will be direct Alipay link)
- **Email:** `SENDGRID_API_KEY` (from sendgrid.com), `SENDGRID_FROM` (verified sender: `Cindy and Anthony <invite@cindyandanthony2026.com>`)
- **Cron:** `CRON_SECRET` (auto-set by Vercel for cron jobs)
- **Site URL:** `NEXT_PUBLIC_SITE_URL` (`https://cindyandanthony2026.com`)
- **Guest password:** `NEXT_PUBLIC_GUEST_PASSWORD` (shared password for site access)
- **Optional:** `NEXT_PUBLIC_GIFT_REGISTRY_URL` (e.g. Amazon, Crate and Barrel)

---

## Your checklist

- [x] Cover image in `public/cover.png`
- [x] Supabase project + tables created
- [x] Env vars filled in `.env` and Vercel
- [x] SendGrid account + API key + domain authenticated
- [x] Custom domain `cindyandanthony2026.com` (Cloudflare → Vercel)
- [x] Stripe activation (live)
- [x] Venmo on registry
- [x] Guest password gate
- [x] Deploy to Vercel
- [ ] Run `supabase/migration-rsvp-tokens.sql` in Supabase SQL Editor (adds rsvp_token, guest_id, address columns)
- [ ] Re-send invitations to guests who need the new RSVP link
- [ ] Alipay — set up direct link later (not via Stripe)

---

## Event details (for reference)

- **Names:** Cindy & Anthony
- **Date:** April 10, 2026 · 3:00 PM – 8:30 PM
- **Venue:** Four Seasons Hotel Kyoto
  445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan
- **Dress code:** Business formal
- **Live site:** https://cindyandanthony2026.com
- **Guest password:** Hagabooga
- **Admin password:** Xx950925!
