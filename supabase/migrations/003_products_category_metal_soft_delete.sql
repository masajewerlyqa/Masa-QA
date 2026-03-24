-- Add category, metal_type, gold_karat, weight, and soft delete (deleted_at) to products.
-- Public product listing should exclude soft-deleted; store dashboard shows all.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS metal_type TEXT,
  ADD COLUMN IF NOT EXISTS gold_karat TEXT,
  ADD COLUMN IF NOT EXISTS weight DECIMAL(12, 4) CHECK (weight IS NULL OR weight >= 0),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.products.category IS 'Product category e.g. Ring, Necklace, Bracelet.';
COMMENT ON COLUMN public.products.metal_type IS 'Metal type e.g. Gold, Silver, Platinum.';
COMMENT ON COLUMN public.products.gold_karat IS 'Gold karat e.g. 18K, 24K (when metal is gold).';
COMMENT ON COLUMN public.products.weight IS 'Weight in grams.';
COMMENT ON COLUMN public.products.deleted_at IS 'Soft delete; non-null means product is deleted.';

-- Public SELECT: only non-deleted products (keep status filter).
DROP POLICY IF EXISTS "Active products viewable by everyone" ON public.products;
CREATE POLICY "Active products viewable by everyone"
  ON public.products FOR SELECT
  USING (
    deleted_at IS NULL
    AND (status = 'active' OR status = 'out_of_stock')
  );

-- Store members already have "Store members can view all store products" so they see all (including deleted) for their store.
-- No change needed for INSERT/UPDATE; soft delete is just UPDATE SET deleted_at = NOW().
