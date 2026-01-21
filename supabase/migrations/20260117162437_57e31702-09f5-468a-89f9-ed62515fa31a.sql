-- Add AdSense configuration to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS adsense_client_id TEXT,
ADD COLUMN IF NOT EXISTS adsense_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS adsense_slots JSONB DEFAULT '{"header": "", "sidebar": "", "article_top": "", "article_bottom": "", "in_feed": ""}'::jsonb;