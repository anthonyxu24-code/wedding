-- Add verify_code column to guests table
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS verify_code text;
