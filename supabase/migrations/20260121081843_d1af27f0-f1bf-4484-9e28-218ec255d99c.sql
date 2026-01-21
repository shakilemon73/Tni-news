-- Create page_views table for accurate daily view tracking
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  referrer TEXT,
  user_agent TEXT
);

-- Create indexes for efficient querying
CREATE INDEX idx_page_views_article_id ON public.page_views(article_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX idx_page_views_view_date ON public.page_views(view_date);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anonymous inserts for view tracking (public pages)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Admins/editors can view all page views for analytics
CREATE POLICY "Admins and editors can view page views"
ON public.page_views
FOR SELECT
USING (is_admin_or_editor(auth.uid()));

-- Users can view their own page views
CREATE POLICY "Users can view their own page views"
ON public.page_views
FOR SELECT
USING (auth.uid() = user_id);