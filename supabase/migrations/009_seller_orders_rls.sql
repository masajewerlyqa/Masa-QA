-- Allow sellers to view and update orders that contain at least one item from their store.
-- Uses is_store_member from migration 005.

-- Orders: sellers can SELECT orders that have an order_item for a product in their store
CREATE POLICY "Sellers can view orders containing their store products"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id
        AND (p.store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
             OR public.is_store_member(p.store_id, auth.uid()))
    )
  );

-- Orders: sellers can UPDATE orders that contain their store products (e.g. set status to shipped/delivered)
CREATE POLICY "Sellers can update orders containing their store products"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id
        AND (p.store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
             OR public.is_store_member(p.store_id, auth.uid()))
    )
  );

-- Order items: sellers can SELECT items for products in their store (so they can show order detail)
CREATE POLICY "Sellers can view order items for their store products"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = order_items.product_id
        AND (p.store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
             OR public.is_store_member(p.store_id, auth.uid()))
    )
  );
