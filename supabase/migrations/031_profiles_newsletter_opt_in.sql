-- Optional newsletter preference (signup checkbox + settings); no OTP.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS newsletter_opt_in BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.newsletter_opt_in IS 'User opted in to MASA marketing/newsletter emails; default false.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, phone, newsletter_opt_in)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    COALESCE((NEW.raw_user_meta_data->>'newsletter_opt_in')::boolean, false)
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
