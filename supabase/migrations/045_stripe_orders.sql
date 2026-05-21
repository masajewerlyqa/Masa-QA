-- Stripe Checkout: paid status + session idempotency columns.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'paid'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'paid';
  END IF;
END
$$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.stripe_checkout_session_id IS 'Stripe Checkout Session id; unique when set (webhook idempotency).';
COMMENT ON COLUMN public.orders.stripe_payment_intent_id IS 'Stripe PaymentIntent id from completed checkout.';
COMMENT ON COLUMN public.orders.paid_at IS 'When Stripe checkout.session.completed was processed.';

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_checkout_session_id_key
  ON public.orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
