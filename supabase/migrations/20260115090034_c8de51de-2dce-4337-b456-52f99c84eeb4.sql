-- Add gemini_api_key column to settings table for AI integration
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;