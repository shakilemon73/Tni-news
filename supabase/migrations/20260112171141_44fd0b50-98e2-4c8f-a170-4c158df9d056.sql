-- Add contact information columns to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS contact_email text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_address text DEFAULT NULL;