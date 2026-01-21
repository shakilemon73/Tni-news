-- Create advertisements table for banners and sponsored content
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'banner', -- 'banner', 'sponsored', 'sidebar'
  image_url TEXT,
  link_url TEXT,
  content TEXT, -- For sponsored content articles
  position TEXT NOT NULL DEFAULT 'homepage', -- 'homepage', 'sidebar', 'article', 'header', 'footer'
  slot TEXT, -- 'top', 'middle', 'bottom', 'between-sections'
  priority INTEGER NOT NULL DEFAULT 0, -- Higher priority shows first
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Active advertisements are viewable by everyone" 
ON public.advertisements 
FOR SELECT 
USING (
  is_active = true 
  AND start_date <= now() 
  AND (end_date IS NULL OR end_date >= now())
  OR is_admin_or_editor(auth.uid())
);

CREATE POLICY "Admins/editors can manage advertisements" 
ON public.advertisements 
FOR ALL
USING (is_admin_or_editor(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_advertisements_active ON public.advertisements (is_active, position, start_date, end_date);
CREATE INDEX idx_advertisements_type ON public.advertisements (type);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();