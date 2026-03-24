-- Profile verification fields (phone OTP ready), order audit trail, refunded status.

-- -----------------------------------------------------------------------------
-- Profiles: phone verification (OTP not enforced yet)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_verification_channel TEXT;

COMMENT ON COLUMN public.profiles.phone_verification_channel IS 'Future: sms | whatsapp when OTP is enabled.';
COMMENT ON COLUMN public.profiles.phone_verified_at IS 'Set when phone is verified via OTP; NULL until then.';

-- -----------------------------------------------------------------------------
-- Order status: refunded
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'refunded'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'refunded';
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Order status transition history (internal + future buyer-visible timeline)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  from_status public.order_status,
  to_status public.order_status NOT NULL,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('seller', 'admin', 'system', 'checkout')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.order_status_events IS 'Append-only history of order status changes; emails/notifications derive from same transitions.';

CREATE INDEX IF NOT EXISTS idx_order_status_events_order_id ON public.order_status_events (order_id, created_at DESC);

ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

-- Customers: read events only for their orders
CREATE POLICY "Customers can read events for own orders"
  ON public.order_status_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.customer_id = auth.uid()
    )
  );

-- Sellers: read events for orders that include their store’s line items
CREATE POLICY "Sellers can read events for their store orders"
  ON public.order_status_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      JOIN public.stores s ON s.id = p.store_id
      WHERE oi.order_id = order_status_events.order_id
        AND s.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      JOIN public.store_members sm ON sm.store_id = p.store_id AND sm.user_id = auth.uid()
      WHERE oi.order_id = order_status_events.order_id
    )
  );

-- Admins: full read
CREATE POLICY "Admins can read all order status events"
  ON public.order_status_events FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- No INSERT/UPDATE/DELETE for authenticated users — use service role from server actions only

-- -----------------------------------------------------------------------------
-- Sync profile on signup: include phone from user metadata
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
