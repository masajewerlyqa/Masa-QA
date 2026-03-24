-- =============================================================================
-- Seller review moderation: sellers can view and update reviews for their products
-- =============================================================================

-- Sellers can SELECT reviews for products in their store
CREATE POLICY "Sellers can view reviews for their store products"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = reviews.product_id
        AND (
          p.store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
          OR public.is_store_member(p.store_id, auth.uid())
        )
    )
  );

-- Sellers can UPDATE reviews for products in their store (approve/reject)
CREATE POLICY "Sellers can update reviews for their store products"
  ON public.reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = reviews.product_id
        AND (
          p.store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
          OR public.is_store_member(p.store_id, auth.uid())
        )
    )
  );
