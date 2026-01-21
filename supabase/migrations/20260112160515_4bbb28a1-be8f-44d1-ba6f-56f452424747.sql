-- Add gallery_images column to articles table for multiple images
ALTER TABLE public.articles 
ADD COLUMN gallery_images text[] DEFAULT '{}'::text[];

-- Add gallery_credits column to store credits for each gallery image
ALTER TABLE public.articles 
ADD COLUMN gallery_credits text[] DEFAULT '{}'::text[];