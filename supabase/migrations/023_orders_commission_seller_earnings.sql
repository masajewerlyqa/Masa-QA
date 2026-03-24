-- Add commission and seller earnings to orders (MASA marketplace commission system).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS commission_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_earnings NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.orders.commission_amount IS 'MASA platform commission (from subtotal after discount).';
COMMENT ON COLUMN public.orders.seller_earnings IS 'Amount to sellers (subtotal after discount minus commission).';
