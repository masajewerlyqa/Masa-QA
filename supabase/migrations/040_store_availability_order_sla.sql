-- Store business hours (per store) + seller response SLA on orders.

-- -----------------------------------------------------------------------------
-- Order status: awaiting seller confirmation (2h window)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'awaiting_seller'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'awaiting_seller';
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Stores: working schedule (times interpreted in business_timezone)
-- -----------------------------------------------------------------------------
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS business_timezone TEXT NOT NULL DEFAULT 'Asia/Qatar';

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS working_days INTEGER[] NOT NULL DEFAULT '{}';

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS opening_time_local TIME;

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS closing_time_local TIME;

COMMENT ON COLUMN public.stores.business_timezone IS 'IANA timezone for opening/closing (e.g. Asia/Qatar).';
COMMENT ON COLUMN public.stores.working_days IS '0=Sun … 6=Sat (JavaScript getDay). Empty = hours not configured.';
COMMENT ON COLUMN public.stores.opening_time_local IS 'Local opening time in business_timezone.';
COMMENT ON COLUMN public.stores.closing_time_local IS 'Local closing time same calendar day (must be after opening).';

-- -----------------------------------------------------------------------------
-- Orders: seller response SLA + system auto-cancel metadata
-- -----------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS seller_response_deadline TIMESTAMPTZ;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS auto_cancelled_at TIMESTAMPTZ;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform_cancellation_reason TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancellation_source TEXT;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_cancellation_source_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_cancellation_source_check
  CHECK (cancellation_source IS NULL OR cancellation_source IN ('seller', 'system', 'customer'));

COMMENT ON COLUMN public.orders.seller_response_deadline IS 'Buyer order must be confirmed/rejected by seller before this time (typically created_at + 2h).';
COMMENT ON COLUMN public.orders.platform_cancellation_reason IS 'Shown to buyer when platform/system cancels (e.g. SLA timeout).';
COMMENT ON COLUMN public.orders.cancellation_source IS 'Who initiated cancellation: seller, system (SLA), or customer.';

CREATE INDEX IF NOT EXISTS idx_orders_seller_sla
  ON public.orders (status, seller_response_deadline)
  WHERE status = 'awaiting_seller' AND seller_response_deadline IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Restore stock when an order is cancelled (seller reject or SLA auto-cancel)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.restore_order_stock(items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  pid uuid;
  qty int;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    pid := (item->>'product_id')::uuid;
    qty := (item->>'quantity')::int;
    IF qty IS NULL OR qty < 1 THEN
      RAISE EXCEPTION 'invalid_quantity';
    END IF;

    UPDATE public.products
    SET
      stock_quantity = stock_quantity + qty,
      status = CASE
        WHEN (stock_quantity + qty) > 0 AND status = 'out_of_stock'::product_status THEN 'active'::product_status
        ELSE status
      END
    WHERE id = pid;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.restore_order_stock(jsonb) IS 'Restores product stock when an order line is released (cancellation).';
