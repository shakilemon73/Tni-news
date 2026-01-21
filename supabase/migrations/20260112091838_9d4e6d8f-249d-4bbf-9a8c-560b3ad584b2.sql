-- Fix the SECURITY DEFINER view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_comments;

CREATE VIEW public.public_comments 
WITH (security_invoker = true)
AS
SELECT 
  id,
  article_id,
  author_name,
  content,
  created_at,
  updated_at,
  parent_id,
  status,
  user_id
FROM public.comments
WHERE status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.public_comments TO anon, authenticated;