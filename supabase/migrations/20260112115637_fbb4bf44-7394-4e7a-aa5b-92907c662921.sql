-- Update the handle_new_user function to assign 'reader' role by default
-- Admin roles must be manually assigned by existing admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'reader')
  ON CONFLICT (id) DO NOTHING;
  
  -- ALWAYS assign 'reader' role to new users
  -- Admin/Editor roles must be assigned manually by existing admins
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'reader')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create is_reader function for consistency
CREATE OR REPLACE FUNCTION public.is_reader(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'reader'
  )
$$;

-- Create get_user_role function to easily get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'editor' THEN 2
      WHEN 'reader' THEN 3
      ELSE 4
    END
  LIMIT 1
$$;