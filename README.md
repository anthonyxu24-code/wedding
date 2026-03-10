# Cindy & Anthony · Wedding

> A minimal, Japanese-inspired wedding invitation site — one link to share with RSVP, registry, and everything your guests need.

[![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![SendGrid](https://img.shields.io/badge/SendGrid-1A82E2?logo=twilio&logoColor=white)](https://sendgrid.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel)](https://vercel.com)

**Live:** [cindyandanthony2026.com](https://cindyandanthony2026.com)

---

## Features

| Feature | Description |
|---------|-------------|
| **Sakura Home Page** | Cover image with falling cherry blossom petals, lavender-blush gradient, and live countdown to the wedding |
| **Personalized RSVP** | Each guest gets a unique token link — name is pre-filled and locked, supports plus-ones, mailing address collection |
| **RSVP Editing** | Guests can update their response anytime via their personalized link or the confirmation email |
| **Smart Token Persistence** | One click from the email "activates" the token site-wide — all RSVP buttons remember the guest |
| **Confirmation Emails** | Automatic confirmation email on RSVP with an "Edit Your Response" button |
| **Milestone Reminders** | Automated reminder emails at 30, 14, and 7 days before the wedding (Vercel Cron) |
| **Registry** | Cash gift via Stripe Checkout + Venmo (no fees) + optional Alipay and gift registry links |
| **Bilingual** | Full EN / 中文 toggle — all copy, dates, and labels switch to Simplified Chinese |
| **Password Gate** | Shared guest password protects the site; token-authenticated RSVP links bypass the gate |
| **Admin Panel** | Manage guest list, send/resend invitations, view RSVPs with full details, stats dashboard |
| **Responsive** | Desktop sticky top nav + mobile bottom tab bar, swipe-enabled photo carousel, 44px touch targets |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GUEST FLOW                           │
│                                                             │
│  Email Invitation                                           │
│    ├── "View Invitation" → Home page (with token)           │
│    └── "RSVP Now"        → RSVP page (with token)          │
│                              │                              │
│  Home Page (/)               │                              │
│    ├── Sakura petals + countdown clock                      │
│    ├── RSVP button (auto-includes saved token)              │
│    └── "I've already RSVP'd" → shows venue details          │
│                              │                              │
│  RSVP Page (/rsvp?token=xxx) │                              │
│    ├── Fetches guest info via token                         │
│    ├── Pre-fills name (locked) + email                      │
│    ├── Form → Review → Confirm → Done (redirect to home)   │
│    └── Sends confirmation email with edit link              │
│                                                             │
│  Other Pages                                                │
│    ├── /registry  — Stripe + Venmo + optional links         │
│    ├── /details   — Dress code + itinerary                  │
│    └── /location  — Venue photos, map, directions, travel   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        ADMIN FLOW                           │
│                                                             │
│  /admin (password protected)                                │
│    ├── RSVPs tab: view all responses, stats, delete         │
│    │   └── Click row to expand full message + address       │
│    └── Guest List tab: add guests, send/resend invitations  │
│        └── Each guest gets a unique cute token              │
│            (e.g. happy-panda-3847)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     AUTOMATED EMAILS                        │
│                                                             │
│  Invitation  → Sent from admin panel (batch or individual)  │
│  Confirmation → Sent on RSVP submit (with edit link)        │
│  Reminders   → Vercel Cron daily at 9AM UTC                 │
│               └── Milestones: 30 / 14 / 7 days before      │
│                   (attending guests only, no duplicates)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Server + client rendering, API routes |
| **Styling** | Tailwind CSS | Utility-first styling, responsive design |
| **Database** | Supabase (PostgreSQL) | `guests`, `rsvps`, `sent_reminders` tables with RLS |
| **Email** | SendGrid | Invitations, confirmations, reminders |
| **Payments** | Stripe Checkout + Venmo | Cash gift registry |
| **Hosting** | Vercel | Auto-deploy on push, cron jobs, serverless functions |
| **DNS** | Cloudflare | Custom domain, SSL |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Home — sakura petals, countdown, RSVP CTA
│   ├── rsvp/page.tsx                     # RSVP form (token-based, 3-step flow)
│   ├── registry/page.tsx                 # Gift registry (Stripe + Venmo)
│   ├── details/page.tsx                  # Dress code + itinerary
│   ├── location/page.tsx                 # Venue, photos, map, travel info
│   ├── admin/page.tsx                    # Admin panel (RSVPs + guest list)
│   ├── globals.css                       # Sakura gradient, petal animations, fade-in
│   └── api/
│       ├── rsvp/
│       │   ├── route.ts                  # POST — submit/update RSVP
│       │   └── guest/route.ts            # GET  — lookup guest by token
│       ├── checkout/route.ts             # POST — create Stripe session
│       ├── cron/reminders/route.ts       # GET  — daily reminder cron job
│       └── admin/
│           ├── login/route.ts            # POST — admin authentication
│           ├── logout/route.ts           # POST — clear admin session
│           ├── guests/route.ts           # GET/POST/DELETE — guest CRUD
│           ├── rsvps/route.ts            # GET/DELETE — RSVP management
│           └── send-invites/route.ts     # POST — batch send invitations
├── components/
│   ├── AppShell.tsx                      # Root wrapper — gate logic, token persistence
│   ├── GuestGate.tsx                     # Password gate (sessionStorage)
│   ├── PageNav.tsx                       # Responsive nav (desktop top / mobile bottom)
│   ├── PhotoCarousel.tsx                 # Swipe-enabled image carousel
│   └── LanguageToggle.tsx                # EN/中文 pill toggle
├── contexts/
│   └── LocaleContext.tsx                 # Translations, date/time, address
└── lib/
    ├── email-templates.ts                # Invite, confirmation, reminder HTML (EN/ZH)
    ├── generate-token.ts                 # Cute token generator (adjective-animal-NNNN)
    ├── admin-auth.ts                     # Admin session cookie helper
    └── supabase/server.ts                # Supabase service-role client

supabase/
├── schema.sql                            # Full database schema (fresh setup)
└── migration-rsvp-tokens.sql             # Migration for existing databases

vercel.json                               # Cron job config (daily reminders)
```

---

## Database Schema

```sql
┌──────────────────────────────┐       ┌──────────────────────────────┐
│           guests             │       │           rsvps              │
├──────────────────────────────┤       ├──────────────────────────────┤
│ id          uuid (PK)        │──┐    │ id            uuid (PK)     │
│ name        text             │  │    │ guest_id      uuid (FK, UQ) │◄─┐
│ email       text             │  │    │ primary_name  text          │  │
│ locale      text (en/zh)     │  └───►│ email         text          │  │
│ rsvp_token  text (unique)    │       │ attending     boolean       │  │
│ invited     boolean          │       │ guest_count   integer       │  │
│ created_at  timestamptz      │       │ guest_names   text[]        │  │
└──────────────────────────────┘       │ message       text          │  │
                                       │ address       text          │  │
┌──────────────────────────────┐       │ created_at    timestamptz   │  │
│       sent_reminders         │       └──────────────────────────────┘  │
├──────────────────────────────┤                                        │
│ milestone   text (PK)        │       guest_id references guests(id) ──┘
│ sent_at     timestamptz      │
└──────────────────────────────┘
```

---

## RSVP Token Flow

```
1. Admin adds guest → cute token generated (e.g. "happy-panda-3847")
2. Admin sends invitation → email contains personalized links:
   • "View Invitation" → /?token=happy-panda-3847
   • "RSVP Now"        → /rsvp?token=happy-panda-3847
3. Guest clicks link → token saved to localStorage (persists across pages)
4. Guest navigates to RSVP → form pre-fills name (locked), email (read-only)
5. Guest submits → upsert to DB (allows future edits), confirmation email sent
6. Guest returns later → can edit via:
   • Any saved link (token in localStorage)
   • "Edit Your Response" button in confirmation email
   • Nav bar RSVP tab (auto-includes token)
```

---

## Quick Start

### 1. Install & Run Locally

```bash
npm install
cp .env.example .env   # fill in your keys (see below)
npm run dev
```

Open **http://localhost:3000** · Admin: **http://localhost:3000/admin**

### 2. Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql)
3. Copy your URL + keys from **Project Settings → API** into `.env`

> **Existing database?** Run [`supabase/migration-rsvp-tokens.sql`](supabase/migration-rsvp-tokens.sql) to add token, address, and reminder columns.

### 3. Email Setup (SendGrid)

1. Create an account at [sendgrid.com](https://sendgrid.com)
2. Authenticate your sending domain (SPF/DKIM via DNS)
3. Create an API key and add to `.env` as `SENDGRID_API_KEY`

### 4. Deploy (Vercel)

1. [Import this repo](https://vercel.com/new) on Vercel
2. Add the same env vars from `.env.example`
3. Deploy — auto-deploys on every push to `main`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `ADMIN_PASSWORD` | Yes | Password for `/admin` |
| `NEXT_PUBLIC_GUEST_PASSWORD` | Yes | Shared password for guest access |
| `SENDGRID_API_KEY` | Yes | SendGrid API key |
| `SENDGRID_FROM` | Yes | Verified sender (e.g. `Name <you@domain.com>`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (used in email links) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for checkout sessions |
| `NEXT_PUBLIC_VENMO_URL` | No | Direct Venmo profile link |
| `NEXT_PUBLIC_STRIPE_REGISTRY_URL` | No | Stripe Payment Link (fallback) |
| `NEXT_PUBLIC_ALIPAY_REGISTRY_URL` | No | Alipay payment link |
| `NEXT_PUBLIC_GIFT_REGISTRY_URL` | No | External gift registry (e.g. Amazon) |
| `CRON_SECRET` | Auto | Set by Vercel for cron job authentication |

---

## Email Templates

All emails are inline-styled HTML with full EN/中文 support:

| Email | Trigger | Contents |
|-------|---------|----------|
| **Invitation** | Admin sends from guest list | Cover image, date/venue, "View Invitation" + "RSVP Now" buttons, site password |
| **Confirmation** | Guest submits RSVP | Thank you, attending status + count, "Edit Your Response" button, venue details |
| **Reminder** | Vercel Cron (30/14/7 days before) | Countdown number, date/venue, "Edit Your RSVP" button |

---

## Styling

- **Sakura theme** — lavender-blush gradient (`bg-hero-sakura`) with falling cherry blossom petal CSS animations
- **Fade-in** — page content animates up on load (`animate-fade-in`)
- **Touch-friendly** — 44px minimum tap targets (Apple HIG), `active:scale-[0.97]` press feedback
- **Typography** — serif headings, sans-serif body, tabular numbers for countdown
- **Responsive** — mobile-first with desktop enhancements, bottom tab bar on mobile, top nav on desktop

---

*Cindy & Anthony · April 10, 2026 · Four Seasons Hotel Kyoto*
