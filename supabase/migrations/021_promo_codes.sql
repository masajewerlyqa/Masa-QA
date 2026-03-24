-- =============================================================================
-- Promo codes for MASA marketplace (percentage or fixed discount; store or platform-wide)
-- =============================================================================

CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL,
  store_id UUID REFERENCES public.stores (id) ON DELETE SET NULL,
  min_order_amount NUMERIC NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_code_unique UNIQUE (code),
  CONSTRAINT promo_codes_value_positive CHECK (value > 0),
  CONSTRAINT promo_codes_min_order_non_negative CHECK (min_order_amount >= 0),
  CONSTRAINT promo_codes_used_count_non_negative CHECK (used_count >= 0),
  CONSTRAINT promo_codes_usage_limit_positive CHECK (usage_limit IS NULL OR usage_limit > 0)
);

COMMENT ON TABLE public.promo_codes IS 'Discount codes for checkout; platform-wide (store_id NULL) or per-store.';
COMMENT ON COLUMN public.promo_codes.code IS 'Unique code string (e.g. SAVE10).';
COMMENT ON COLUMN public.promo_codes.type IS 'percentage = discount % of order; fixed = fixed amount off.';
COMMENT ON COLUMN public.promo_codes.value IS 'Percentage (e.g. 10) or fixed amount in currency.';
COMMENT ON COLUMN public.promo_codes.store_id IS 'NULL = platform-wide; set = valid only for this store.';
COMMENT ON COLUMN public.promo_codes.min_order_amount IS 'Minimum order total required to use the code.';
COMMENT ON COLUMN public.promo_codes.usage_limit IS 'Max redemptions; NULL = unlimited.';
COMMENT ON COLUMN public.promo_codes.used_count IS 'Number of times the code has been used.';
COMMENT ON COLUMN public.promo_codes.starts_at IS 'When the code becomes valid; NULL = no start limit.';
COMMENT ON COLUMN public.promo_codes.expires_at IS 'When the code expires; NULL = no expiry.';
COMMENT ON COLUMN public.promo_codes.active IS 'If false, code cannot be used (for soft disable).';

-- Indexes for lookups and listing
CREATE UNIQUE INDEX idx_promo_codes_code ON public.promo_codes (code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes (active) WHERE active = true;
CREATE INDEX idx_promo_codes_store_id ON public.promo_codes (store_id) WHERE store_id IS NOT NULL;
CREATE INDEX idx_promo_codes_expires_at ON public.promo_codes (expires_at) WHERE expires_at IS NOT NULL;

-- RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Admin: full access to all promo codes
CREATE POLICY "Admins can manage all promo codes"
  ON public.promo_codes FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- Seller: manage only promo codes for their own approved store(s)
CREATE POLICY "Sellers can manage promo codes for their approved stores"
  ON public.promo_codes FOR ALL
  USING (
    store_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = promo_codes.store_id
        AND s.status = 'approved'
        AND (s.owner_id = auth.uid() OR public.is_store_member(s.id, auth.uid()))
    )
  )
  WITH CHECK (
    store_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = promo_codes.store_id
        AND s.status = 'approved'
        AND (s.owner_id = auth.uid() OR public.is_store_member(s.id, auth.uid()))
    )
  );

-- Checkout: anyone can read active promo codes (for validation only)
CREATE POLICY "Active promo codes readable for checkout validation"
  ON public.promo_codes FOR SELECT
  USING (active = true);
