
-- Fix: use auth user id as fallback phone to avoid unique constraint violation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.customers (name, phone, auth_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NEW.id::text),
    NEW.id
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
