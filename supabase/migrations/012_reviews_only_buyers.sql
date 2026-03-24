-- Ensure only customers who purchased a product can insert a review for it.
-- This migration updates the reviews RLS policy to require at least one order
-- containing the product for the authenticated customer (excluding cancelled orders).

DROP POLICY IF EXISTS "Customers can insert own reviews" ON public.reviews;

CREATE POLICY "Customers can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.product_id = reviews.product_id
        AND o.customer_id = auth.uid()
        AND o.status <> 'cancelled'
    )
  );

