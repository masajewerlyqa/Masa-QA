-- Restrict profile SELECT to own profile or admin only.
-- Public lookups use the profiles_public view (safe fields only).

-- Drop the overly broad policy.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can read their own full profile.
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles.
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Secure view exposing only non-sensitive fields for public consumption
-- (e.g., product cards showing seller name + avatar).
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT id, full_name, avatar_url, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
