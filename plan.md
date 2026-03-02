# Cindy & Anthony Wedding Website – Plan

> This file is updated as the project is built. Current status and setup live here.

---

## Progress

| Step | Status | Notes |
|------|--------|--------|
| Create plan.md | Done | |
| Scaffold Next.js 14 + Tailwind | Done | |
| Landing + cover | Done | `public/cover.png` (replace with your image if needed) |
| RSVP + API + Supabase | Done | Needs Supabase env vars + `rsvps` table |
| Admin page | Done | `/admin` – set `ADMIN_PASSWORD` |
| Registry (Stripe + gifts) | Done | Set `NEXT_PUBLIC_STRIPE_REGISTRY_URL` (and optional gift link) |
| Polish | Done | .env.example, README, .gitignore |

---

## Update GitHub first

1. Create a new repo on [github.com/new](https://github.com/new) (e.g. name: `wedding`).
2. In this folder (with Git installed):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: wedding site with RSVP and registry"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/wedding.git
   git push -u origin main
   ```

   Use your GitHub username and the repo URL from step 1.

---

## Key paths

| What | Path |
|------|------|
| Main page (landing, RSVP, registry) | `src/app/page.tsx` |
| RSVP API | `src/app/api/rsvp/route.ts` |
| Admin page | `src/app/admin/page.tsx` |
| Admin login API | `src/app/api/admin/login/route.ts` |
| Admin RSVPs API | `src/app/api/admin/rsvps/route.ts` |
| Supabase server client | `src/lib/supabase/server.ts` |
| Env template | `.env.example` |

---

## Env vars & setup

Copy `.env.example` to `.env` and fill in:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Admin:** `ADMIN_PASSWORD` (for `/admin`)
- **Registry:** `NEXT_PUBLIC_STRIPE_REGISTRY_URL` (Stripe Payment Link for cash gifts)
- **Optional:** `NEXT_PUBLIC_GIFT_REGISTRY_URL` (e.g. Amazon, Crate and Barrel)

---

## Your checklist

- [ ] Cover image in `public/cover.png` (or path you prefer)
- [ ] Supabase project + `rsvps` table created
- [ ] Stripe account + Payment Link or Checkout
- [ ] Set `ADMIN_PASSWORD` for `/admin`

---

## Event details (for reference)

- **Names:** Cindy & Anthony
- **Date:** April 10, 2026 · 3:00 PM – 8:30 PM
- **Venue:** Four Seasons Hotel Kyoto  
  445-3, Myohoin Maekawa-cho, Higashiyama-ku, 605-0932 Kyoto, Japan
