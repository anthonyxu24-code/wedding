-- Run this in Supabase Dashboard: SQL Editor → New query → paste → Run
-- Creates the rsvps table and RLS so guests can insert, only admin (service role) can read

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  primary_name text not null,
  email text not null,
  attending boolean not null default true,
  guest_count integer not null default 1 check (guest_count >= 1 and guest_count <= 20),
  guest_names jsonb default '[]'::jsonb,
  message text,
  created_at timestamptz not null default now()
);

-- Allow anonymous insert (for RSVP form)
alter table public.rsvps enable row level security;

create policy "Allow anonymous insert"
  on public.rsvps for insert
  to anon
  with check (true);

-- No select/update/delete for anon (admin uses service_role key which bypasses RLS)
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

-- Optional: allow service_role to do everything (default)
-- Service role already bypasses RLS, so no extra policy needed.

-- ============================================================
-- Guests table (invite list managed from /admin)
-- ============================================================

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  locale text not null default 'en' check (locale in ('en', 'zh')),
  invite_sent boolean not null default false,
  invite_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.guests enable row level security;

-- No anonymous access at all — admin uses service_role which bypasses RLS
create policy "No anon access to guests"
  on public.guests for all
  to anon
  using (false)
  with check (false);
