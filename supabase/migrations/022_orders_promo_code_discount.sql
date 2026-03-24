-- Add promo code and discount amount to orders (for checkout promo application).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.orders.promo_code IS 'Promo code applied at checkout (e.g. SAVE10).';
COMMENT ON COLUMN public.orders.discount_amount IS 'Discount amount applied from promo (in order currency).';
