-- Add image_credit column to articles table
ALTER TABLE public.articles 
ADD COLUMN image_credit text;