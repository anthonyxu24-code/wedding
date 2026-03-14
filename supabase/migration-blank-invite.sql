-- Allow blank invitations (guests with no name/email — they provide during RSVP)
ALTER TABLE public.guests ALTER COLUMN name DROP NOT NULL;
