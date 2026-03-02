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

## GitHub

Repo is live at **https://github.com/anthonyxu24-code/wedding**. To push updates: `git add .` → `git commit -m "..."` → `git push`.

---

## Next steps (to go live)

1. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In Dashboard → SQL Editor, run the contents of [`supabase/schema.sql`](supabase/schema.sql) to create the `rsvps` table.
   - In Project Settings → API, copy the URL and anon key and service_role key.

2. **Env**
   - Copy `.env.example` to `.env`.
   - Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_PASSWORD`.

3. **Cover image**
   - Put your wedding invitation image at `public/cover.png` (replace the placeholder if present).

4. **Run locally**
   - In a terminal (with Node installed): `npm install` then `npm run dev`. Open http://localhost:3000.

5. **Registry (optional)**
   - In [Stripe Dashboard](https://dashboard.stripe.com) create a Payment Link for cash gifts; set `NEXT_PUBLIC_STRIPE_REGISTRY_URL` in `.env`.
   - Optionally set `NEXT_PUBLIC_GIFT_REGISTRY_URL` for an external gift registry.

6. **Deploy**
   - Connect the GitHub repo to [Vercel](https://vercel.com), add the same env vars, and deploy. Share the Vercel URL as your invitation link.

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
| Supabase table schema | `supabase/schema.sql` |
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
