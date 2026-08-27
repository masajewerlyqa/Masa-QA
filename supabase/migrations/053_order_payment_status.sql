-- Separate "where is the parcel" from "have we been paid".
--
-- Until now payment lived inside order_status (which has a 'paid' value), which
-- cannot express an order that is delivered but not yet settled -- exactly the
-- normal case for cash/card on delivery. payment_status splits that out.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_collected_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.payment_status IS
  'pending | paid | failed | refunded. Independent of order_status: money is only collected at delivery.';
COMMENT ON COLUMN public.orders.payment_collected_at IS
  'When the courier actually collected cash or ran the card on their terminal.';

-- Backfill from whatever the old single-status model recorded, so historical
-- orders keep an accurate payment state instead of all reading as unpaid.
UPDATE public.orders
SET payment_status = 'paid'
WHERE payment_status = 'pending'
  AND (paid_at IS NOT NULL OR status::text = 'paid');

UPDATE public.orders
SET payment_status = 'refunded'
WHERE status::text = 'refunded';

UPDATE public.orders
SET payment_collected_at = paid_at
WHERE payment_collected_at IS NULL AND paid_at IS NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Normalise payment methods to the two the marketplace now offers.
-- Historical online card payments keep a distinct legacy value: they really were
-- settled online, and relabelling them 'card_on_delivery' would misstate how
-- those orders were paid.
UPDATE public.orders SET payment_method = 'cash_on_delivery' WHERE payment_method = 'cod';
UPDATE public.orders SET payment_method = 'card_online_legacy' WHERE payment_method = 'card';
UPDATE public.orders SET payment_method = 'cash_on_delivery' WHERE payment_method IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN payment_method SET DEFAULT 'cash_on_delivery';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (
    payment_method IN (
      'cash_on_delivery',
      'card_on_delivery',
      'bank_transfer',
      'card_online_legacy'
    )
  );

-- Money must not be recorded as collected without a timestamp, and vice versa.
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_paid_requires_collected_at;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_paid_requires_collected_at
  CHECK (payment_status <> 'paid' OR payment_collected_at IS NOT NULL)
  NOT VALID;

CREATE INDEX IF NOT EXISTS orders_payment_status_idx
  ON public.orders (payment_status);
