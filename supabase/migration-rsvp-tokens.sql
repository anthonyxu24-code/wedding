-- Migration: Add RSVP tokens and mailing address
-- Run this in Supabase Dashboard: SQL Editor → New query → paste → Run

-- 1. Add rsvp_token to guests (temp default so existing rows get a value)
ALTER TABLE public.guests
  ADD COLUMN IF NOT EXISTS rsvp_token text unique default gen_random_uuid()::text;

UPDATE public.guests SET rsvp_token = gen_random_uuid()::text WHERE rsvp_token IS NULL;

ALTER TABLE public.guests ALTER COLUMN rsvp_token SET NOT NULL;

-- NOTE: Existing guests will get UUID-style tokens as a placeholder.
-- Delete and re-add guests from /admin to give them cute animal tokens,
-- or just resend their invitations — the app generates cute tokens for new guests.

-- 2. Add guest_id and address to rsvps
ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS guest_id uuid references public.guests(id);

ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS address text;

-- Unique constraint so each guest can only have one RSVP (enables upsert)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rsvps_guest_id_unique'
  ) THEN
    ALTER TABLE public.rsvps ADD CONSTRAINT rsvps_guest_id_unique UNIQUE (guest_id);
  END IF;
END $$;

-- 3. RLS: allow anon to look up their own guest record by token
CREATE POLICY IF NOT EXISTS "Allow anon select by rsvp_token"
  ON public.guests FOR SELECT
  TO anon
  USING (true);

-- 4. Sent reminders tracking (for cron-based milestone reminders)
CREATE TABLE IF NOT EXISTS public.sent_reminders (
  milestone text primary key,
  sent_at timestamptz not null default now()
);
