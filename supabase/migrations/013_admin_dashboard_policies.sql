-- Allow admins to read all orders and products for the dashboard (metrics, recent orders).
-- Uses current_user_role() from migration 005.

-- Orders: admin can SELECT all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Order items: admin can SELECT all (to show order details / revenue)
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.current_user_role() = 'admin');

-- Products: admin can SELECT all (for total count and category distribution)
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (public.current_user_role() = 'admin');
