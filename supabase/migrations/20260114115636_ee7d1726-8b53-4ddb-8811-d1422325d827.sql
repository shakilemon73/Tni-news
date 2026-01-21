-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert comments on articles" ON public.comments;

-- Create a new PERMISSIVE policy that allows anyone (including guests) to insert comments
CREATE POLICY "Anyone can insert comments on articles"
ON public.comments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (article_id IS NOT NULL) AND 
  (content IS NOT NULL) AND 
  (length(TRIM(BOTH FROM content)) > 0) AND 
  (author_name IS NOT NULL) AND 
  (length(TRIM(BOTH FROM author_name)) > 0)
);