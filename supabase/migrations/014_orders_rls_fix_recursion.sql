-- =============================================================================
-- Fix infinite recursion in RLS policies for orders / order_items (42P17).
-- =============================================================================
-- Cause: Orders SELECT policy "Sellers can view orders containing their store
-- products" queries order_items; order_items SELECT policy "Sellers can view
-- order items for their store products" queries orders → cycle.
-- Fix: Use SECURITY DEFINER helpers that read orders/order_items without RLS
-- so policy evaluation does not re-enter the same tables.
-- =============================================================================

-- Helper: true if the order is owned by the given user (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.order_belongs_to_customer(p_order_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id AND customer_id = p_user_id
  );
$$;

-- Helper: true if the order has at least one item from a store the seller owns or is member of (bypasses RLS)
CREATE OR REPLACE FUNCTION public.order_has_products_from_seller(p_order_id uuid, p_seller_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
      AND (
        p.store_id IN (SELECT id FROM public.stores WHERE owner_id = p_seller_uid)
        OR public.is_store_member(p.store_id, p_seller_uid)
      )
  );
$$;

-- -----------------------------------------------------------------------------
-- Orders: replace seller SELECT/UPDATE policies so they do not query order_items
-- (which would trigger order_items RLS and then orders again).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Sellers can view orders containing their store products" ON public.orders;
CREATE POLICY "Sellers can view orders containing their store products"
  ON public.orders FOR SELECT
  USING (public.order_has_products_from_seller(id, auth.uid()));

DROP POLICY IF EXISTS "Sellers can update orders containing their store products" ON public.orders;
CREATE POLICY "Sellers can update orders containing their store products"
  ON public.orders FOR UPDATE
  USING (public.order_has_products_from_seller(id, auth.uid()));

-- -----------------------------------------------------------------------------
-- Order items: replace policies that SELECT from orders so they use the helper
-- instead (avoids triggering orders RLS, which would trigger order_items again).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Order items viewable with order" ON public.order_items;
CREATE POLICY "Order items viewable with order"
  ON public.order_items FOR SELECT
  USING (public.order_belongs_to_customer(order_id, auth.uid()));

DROP POLICY IF EXISTS "Order items insert with order" ON public.order_items;
CREATE POLICY "Order items insert with order"
  ON public.order_items FOR INSERT
  WITH CHECK (public.order_belongs_to_customer(order_id, auth.uid()));

-- Sellers can view order items: (1) customer viewing own order, or (2) product in seller's store.
-- Use order_belongs_to_customer for (1) to avoid reading orders (and re-entering orders RLS).
DROP POLICY IF EXISTS "Sellers can view order items for their store products" ON public.order_items;
CREATE POLICY "Sellers can view order items for their store products"
  ON public.order_items FOR SELECT
  USING (
    public.order_belongs_to_customer(order_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = order_items.product_id
        AND (
          p.store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid())
          OR public.is_store_member(p.store_id, auth.uid())
        )
    )
  );
