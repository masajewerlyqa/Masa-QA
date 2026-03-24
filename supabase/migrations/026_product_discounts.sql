-- Seller-controlled product discounts.
-- Discount fields on products: only sellers manage these via dashboard (admin does not).

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IS NULL OR discount_type IN ('percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS discount_value DECIMAL(12, 2) CHECK (discount_value IS NULL OR discount_value >= 0),
  ADD COLUMN IF NOT EXISTS discount_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_active BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.discount_type IS 'percentage or fixed; seller-defined.';
COMMENT ON COLUMN public.products.discount_value IS 'Percentage (0-100) or fixed amount in same currency as price.';
COMMENT ON COLUMN public.products.discount_start_at IS 'Optional start of discount validity window.';
COMMENT ON COLUMN public.products.discount_end_at IS 'Optional end of discount validity window.';
COMMENT ON COLUMN public.products.discount_active IS 'Seller toggles; discount applies only when true and within date window.';

CREATE INDEX IF NOT EXISTS idx_products_discount_active ON public.products (discount_active) WHERE discount_active = true;
