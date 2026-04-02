-- Email seller registration: require pending_seller_plan (basic|premium) and persist on profiles.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.masa_role;
  v_intent text;
  v_signup_channel text;
  v_terms_accepted text;
  v_terms_version text;
  v_terms_at timestamptz;
  v_require_customer_terms boolean;
  v_accepted_terms boolean := false;
  v_accepted_at timestamptz := NULL;
  v_accepted_version text := NULL;
  v_merchant_accepted text;
  v_merchant_version text;
  v_merchant_at timestamptz;
  v_require_merchant_terms boolean;
  v_accepted_merchant_terms boolean := false;
  v_accepted_merchant_at timestamptz := NULL;
  v_accepted_merchant_version text := NULL;
  v_pending_plan text;
BEGIN
  v_intent := COALESCE(NEW.raw_user_meta_data->>'registration_intent', '');
  IF v_intent = 'seller' THEN
    v_role := 'pending_seller';
  ELSE
    v_role := 'customer';
  END IF;

  v_signup_channel := COALESCE(NEW.raw_user_meta_data->>'signup_channel', '');

  v_pending_plan := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'pending_seller_plan', '')), '');
  IF v_pending_plan IS NOT NULL AND v_pending_plan NOT IN ('basic', 'premium') THEN
    v_pending_plan := NULL;
  END IF;

  -- Customer T&Cs (email buyers)
  v_terms_accepted := NEW.raw_user_meta_data->>'customer_terms_accepted';
  v_terms_version := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'customer_terms_version', '')), '');
  v_terms_at := NULL;
  IF NEW.raw_user_meta_data->>'customer_terms_accepted_at' IS NOT NULL
     AND trim(NEW.raw_user_meta_data->>'customer_terms_accepted_at') <> '' THEN
    BEGIN
      v_terms_at := (NEW.raw_user_meta_data->>'customer_terms_accepted_at')::timestamptz;
    EXCEPTION WHEN OTHERS THEN
      v_terms_at := NULL;
    END;
  END IF;

  v_require_customer_terms := (v_role = 'customer' AND v_signup_channel = 'email');

  IF v_require_customer_terms THEN
    IF v_terms_accepted IS DISTINCT FROM 'true' OR v_terms_version IS NULL THEN
      RAISE EXCEPTION 'CUSTOMER_TERMS_REQUIRED'
        USING HINT = 'Email customer registration requires customer Terms acceptance';
    END IF;
    v_accepted_terms := true;
    v_accepted_version := v_terms_version;
    v_accepted_at := COALESCE(v_terms_at, now());
  END IF;

  -- Merchant T&Cs (email sellers)
  v_merchant_accepted := NEW.raw_user_meta_data->>'merchant_terms_accepted';
  v_merchant_version := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'merchant_terms_version', '')), '');
  v_merchant_at := NULL;
  IF NEW.raw_user_meta_data->>'merchant_terms_accepted_at' IS NOT NULL
     AND trim(NEW.raw_user_meta_data->>'merchant_terms_accepted_at') <> '' THEN
    BEGIN
      v_merchant_at := (NEW.raw_user_meta_data->>'merchant_terms_accepted_at')::timestamptz;
    EXCEPTION WHEN OTHERS THEN
      v_merchant_at := NULL;
    END;
  END IF;

  v_require_merchant_terms := (v_role = 'pending_seller' AND v_signup_channel = 'email');

  IF v_require_merchant_terms THEN
    IF v_merchant_accepted IS DISTINCT FROM 'true' OR v_merchant_version IS NULL THEN
      RAISE EXCEPTION 'MERCHANT_TERMS_REQUIRED'
        USING HINT = 'Email seller registration requires Merchant Terms acceptance';
    END IF;
    v_accepted_merchant_terms := true;
    v_accepted_merchant_version := v_merchant_version;
    v_accepted_merchant_at := COALESCE(v_merchant_at, now());
  END IF;

  -- Email sellers must choose Basic or Premium before account creation (metadata).
  IF v_role = 'pending_seller' AND v_signup_channel = 'email' THEN
    IF v_pending_plan IS NULL OR v_pending_plan NOT IN ('basic', 'premium') THEN
      RAISE EXCEPTION 'SELLER_PLAN_REQUIRED'
        USING HINT = 'Email seller registration requires pending_seller_plan basic or premium';
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    email,
    phone,
    newsletter_opt_in,
    role,
    accepted_terms,
    accepted_terms_at,
    accepted_terms_version,
    accepted_merchant_terms,
    accepted_merchant_terms_at,
    accepted_merchant_terms_version,
    pending_seller_plan
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    COALESCE((NEW.raw_user_meta_data->>'newsletter_opt_in')::boolean, false),
    v_role,
    v_accepted_terms,
    v_accepted_at,
    v_accepted_version,
    v_accepted_merchant_terms,
    v_accepted_merchant_at,
    v_accepted_merchant_version,
    CASE WHEN v_role = 'pending_seller' THEN v_pending_plan ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    newsletter_opt_in = public.profiles.newsletter_opt_in OR COALESCE(EXCLUDED.newsletter_opt_in, false),
    accepted_terms = CASE WHEN EXCLUDED.accepted_terms IS TRUE THEN true ELSE public.profiles.accepted_terms END,
    accepted_terms_at = COALESCE(EXCLUDED.accepted_terms_at, public.profiles.accepted_terms_at),
    accepted_terms_version = COALESCE(EXCLUDED.accepted_terms_version, public.profiles.accepted_terms_version),
    accepted_merchant_terms = CASE WHEN EXCLUDED.accepted_merchant_terms IS TRUE THEN true ELSE public.profiles.accepted_merchant_terms END,
    accepted_merchant_terms_at = COALESCE(EXCLUDED.accepted_merchant_terms_at, public.profiles.accepted_merchant_terms_at),
    accepted_merchant_terms_version = COALESCE(EXCLUDED.accepted_merchant_terms_version, public.profiles.accepted_merchant_terms_version),
    pending_seller_plan = COALESCE(EXCLUDED.pending_seller_plan, public.profiles.pending_seller_plan),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
