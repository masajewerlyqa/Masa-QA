-- Cart per user; cart_items store product_id and quantity.
-- One cart per user (unique user_id); one row per product in cart (unique cart_id, product_id).

CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.carts IS 'One cart per user (buyer).';

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

COMMENT ON TABLE public.cart_items IS 'Cart line items; quantity per product.';

CREATE INDEX idx_carts_user_id ON public.carts (user_id);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items (cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items (product_id);

CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON public.carts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items"
  ON public.cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.carts WHERE id = cart_id AND user_id = auth.uid()));
