-- Migration: Add gifts table for registry tracking
-- Run this in Supabase Dashboard: SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount integer NOT NULL,
  method text NOT NULL CHECK (method IN ('stripe', 'venmo', 'other')),
  stripe_session_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gifts' AND policyname = 'No anon access to gifts'
  ) THEN
    CREATE POLICY "No anon access to gifts"
      ON public.gifts FOR ALL
      TO anon
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;
