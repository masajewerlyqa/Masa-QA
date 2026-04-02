-- Unapproved seller signups: role = pending_seller (not customer).
-- Email/password: registration_intent in raw_user_meta_data (see RegisterForm).
-- OAuth: auth callback upgrades customer → pending_seller when next=/apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'masa_role' AND e.enumlabel = 'pending_seller'
  ) THEN
    ALTER TYPE public.masa_role ADD VALUE 'pending_seller';
  END IF;
END
$$;

COMMENT ON TYPE public.masa_role IS 'admin | seller | pending_seller (seller awaiting approval) | customer';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.masa_role;
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'registration_intent', '') = 'seller' THEN
    v_role := 'pending_seller';
  ELSE
    v_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, email, phone, newsletter_opt_in, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    COALESCE((NEW.raw_user_meta_data->>'newsletter_opt_in')::boolean, false),
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    newsletter_opt_in = public.profiles.newsletter_opt_in OR COALESCE(EXCLUDED.newsletter_opt_in, false),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
