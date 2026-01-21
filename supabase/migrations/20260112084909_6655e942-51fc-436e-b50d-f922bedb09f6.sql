-- Fix the permissive comments insert policy
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;

-- More restrictive: only allow insert if article_id is valid and content is not empty
CREATE POLICY "Users can insert comments on articles"
ON public.comments
FOR INSERT
WITH CHECK (
  article_id IS NOT NULL 
  AND content IS NOT NULL 
  AND length(trim(content)) > 0
  AND author_name IS NOT NULL
  AND length(trim(author_name)) > 0
);