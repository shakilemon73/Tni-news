-- Add image field to categories table for custom category images
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT DEFAULT NULL;