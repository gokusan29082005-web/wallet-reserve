-- Create user_roles table for credential-based routing
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'merchant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create an enum type for role (optional but recommended for data integrity)
CREATE TYPE public.user_role_enum AS ENUM ('customer', 'merchant');

-- Alter the role column to use the enum (optional - comment out if you prefer TEXT)
-- ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.user_role_enum USING role::public.user_role_enum;

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own role
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Admins or system can update roles (restrictive)
CREATE POLICY "Only service role can update roles" ON public.user_roles
  FOR UPDATE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policy: Only service role can insert (for signup trigger)
CREATE POLICY "Only service role can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create a trigger function to auto-create customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Create a function to get customer_id for a user (used in useAuth.tsx)
CREATE OR REPLACE FUNCTION public.get_customer_id_for_user(_user_id UUID)
RETURNS UUID AS $$
DECLARE
  _customer_id UUID;
BEGIN
  SELECT id INTO _customer_id
  FROM public.customers
  WHERE phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = _user_id)
  LIMIT 1;
  RETURN _customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easier user role lookups (optional)
CREATE OR REPLACE VIEW public.user_roles_view AS
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'phone' as phone,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id;
