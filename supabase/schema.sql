-- Run this in Supabase Dashboard: SQL Editor → New query → paste → Run

-- ============================================================
-- Guests table (invite list managed from /admin) — must be first (rsvps references it)
-- ============================================================

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  locale text not null default 'en' check (locale in ('en', 'zh')),
  rsvp_token text unique not null default gen_random_uuid()::text,
  invite_sent boolean not null default false,
  invite_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.guests enable row level security;

create policy "No anon access to guests"
  on public.guests for all
  to anon
  using (false)
  with check (false);

-- ============================================================
-- RSVPs table
-- ============================================================

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references public.guests(id),
  primary_name text not null,
  email text not null,
  attending boolean not null default true,
  guest_count integer not null default 1 check (guest_count >= 1 and guest_count <= 20),
  guest_names jsonb default '[]'::jsonb,
  message text,
  address text,
  created_at timestamptz not null default now(),
  constraint rsvps_guest_id_unique unique (guest_id)
);

alter table public.rsvps enable row level security;

create policy "Allow anonymous insert"
  on public.rsvps for insert
  to anon
  with check (true);

create policy "No anon read"
  on public.rsvps for select
  to anon
  using (false);

create policy "No anon update"
  on public.rsvps for update
  to anon
  using (false);

create policy "No anon delete"
  on public.rsvps for delete
  to anon
  using (false);

-- ============================================================
-- Sent reminders (milestone tracking for cron)
-- ============================================================

create table if not exists public.sent_reminders (
  milestone text primary key,
  sent_at timestamptz not null default now()
);
