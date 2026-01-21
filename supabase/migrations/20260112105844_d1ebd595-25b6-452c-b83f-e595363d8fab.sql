-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can manage pages" ON public.pages;
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON public.pages;

-- Create new policies with is_admin_or_editor function
CREATE POLICY "Pages are viewable by everyone" 
ON public.pages 
FOR SELECT 
USING (true);

CREATE POLICY "Admins and editors can insert pages" 
ON public.pages 
FOR INSERT 
WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins and editors can update pages" 
ON public.pages 
FOR UPDATE 
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Only admins can delete pages" 
ON public.pages 
FOR DELETE 
USING (is_admin(auth.uid()));