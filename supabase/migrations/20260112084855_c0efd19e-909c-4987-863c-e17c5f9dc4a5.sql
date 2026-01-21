-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create e-paper table
CREATE TABLE public.epapers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  publish_date DATE NOT NULL,
  pdf_url TEXT NOT NULL,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epapers ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (status = 'approved' OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Users can insert comments"
ON public.comments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins/editors can manage comments"
ON public.comments
FOR ALL
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- E-paper policies
CREATE POLICY "Published e-papers are viewable by everyone"
ON public.epapers
FOR SELECT
USING (status = 'published' OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage e-papers"
ON public.epapers
FOR ALL
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_epapers_updated_at
BEFORE UPDATE ON public.epapers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_epapers_publish_date ON public.epapers(publish_date);
CREATE INDEX idx_epapers_status ON public.epapers(status);