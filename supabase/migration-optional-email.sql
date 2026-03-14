-- Make guest email optional (for guests added without email — they provide it during RSVP)
ALTER TABLE public.guests ALTER COLUMN email DROP NOT NULL;
