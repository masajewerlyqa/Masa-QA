-- One overall purchase-experience rating per delivered order (buyer).

CREATE TABLE IF NOT EXISTS public.order_experience_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT order_experience_ratings_order_id_key UNIQUE (order_id)
);

COMMENT ON TABLE public.order_experience_ratings IS 'Buyer rating (1–5) of the purchase experience for a delivered order; one per order.';

CREATE INDEX IF NOT EXISTS idx_order_experience_ratings_order_id ON public.order_experience_ratings (order_id);
CREATE INDEX IF NOT EXISTS idx_order_experience_ratings_customer_id ON public.order_experience_ratings (customer_id);

CREATE TRIGGER order_experience_ratings_updated_at
  BEFORE UPDATE ON public.order_experience_ratings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.order_experience_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own order experience ratings"
  ON public.order_experience_ratings FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert order experience ratings for own delivered orders"
  ON public.order_experience_ratings FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_experience_ratings.order_id
        AND o.customer_id = auth.uid()
        AND o.status = 'delivered'
    )
  );

CREATE POLICY "Customers can update own order experience ratings"
  ON public.order_experience_ratings FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Sellers can view experience ratings for their store orders"
  ON public.order_experience_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      JOIN public.stores s ON s.id = p.store_id
      WHERE oi.order_id = order_experience_ratings.order_id
        AND s.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      JOIN public.store_members sm ON sm.store_id = p.store_id AND sm.user_id = auth.uid()
      WHERE oi.order_id = order_experience_ratings.order_id
    )
  );

CREATE POLICY "Admins can view all order experience ratings"
  ON public.order_experience_ratings FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
