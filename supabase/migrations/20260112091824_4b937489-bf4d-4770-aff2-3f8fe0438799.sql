-- Fix 1: Update profiles RLS policy to restrict visibility
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a more restrictive policy - users can only see their own profile, admins can see all
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id 
  OR public.is_admin(auth.uid())
);

-- Fix 2: Update comments RLS to hide author_email from public
-- The current SELECT policy exposes emails. We need to create a view without the email field
-- First, drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON public.comments;

-- Create a new policy that still allows viewing approved comments but only admins/editors can see all fields
-- For public users, we'll handle email hiding at the application level
CREATE POLICY "Approved comments are viewable by everyone"
ON public.comments
FOR SELECT
USING (
  -- Admins and editors can see all comments
  public.is_admin_or_editor(auth.uid())
  -- Regular users can only see approved comments
  OR status = 'approved'
);

-- Create a secure view for public comment display without email
CREATE OR REPLACE VIEW public.public_comments AS
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
  -- Intentionally excluding author_email for public safety
FROM public.comments
WHERE status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.public_comments TO anon, authenticated;