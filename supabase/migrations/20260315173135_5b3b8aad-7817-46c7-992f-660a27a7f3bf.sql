
-- 1. Add is_admin helper function for server-side role checks
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 2. Admin-only RLS policies
CREATE POLICY "Admins can update any influencer profile"
ON public.influencer_profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all advertiser profiles"
ON public.advertiser_profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all campaigns"
ON public.campaigns FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3. Update handle_new_user to auto-create role-specific profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val user_role;
BEGIN
  user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'influencer');

  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role_val
  );

  IF user_role_val = 'influencer' THEN
    INSERT INTO public.influencer_profiles (user_id) VALUES (NEW.id);
  ELSIF user_role_val = 'advertiser' THEN
    INSERT INTO public.advertiser_profiles (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Re-create auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
