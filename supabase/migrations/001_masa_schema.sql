-- MASA Marketplace – PostgreSQL Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- Requires: auth.users (Supabase Auth)

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================
CREATE TYPE masa_role AS ENUM ('admin', 'seller', 'customer');

CREATE TYPE seller_application_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE store_status AS ENUM ('active', 'suspended', 'closed');

CREATE TYPE store_member_role AS ENUM ('owner', 'manager', 'member');

CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived', 'out_of_stock');

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================================================
-- PROFILES
-- =============================================================================
-- Extends Supabase auth.users. One row per user; role controls access (admin/seller/customer).
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role masa_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users; role determines admin/seller/customer access.';

-- =============================================================================
-- SELLER APPLICATIONS
-- =============================================================================
-- Applications to become a seller. Admin approves or rejects; only approved users get seller access.
CREATE TABLE public.seller_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status seller_application_status NOT NULL DEFAULT 'pending',
  business_name TEXT NOT NULL,
  business_description TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  reviewed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.seller_applications IS 'Seller applications; admin approves/rejects before user can create or join stores.';

CREATE INDEX idx_seller_applications_user_id ON public.seller_applications (user_id);
CREATE INDEX idx_seller_applications_status ON public.seller_applications (status);
CREATE INDEX idx_seller_applications_reviewed_at ON public.seller_applications (reviewed_at) WHERE reviewed_at IS NOT NULL;

-- =============================================================================
-- STORES
-- =============================================================================
-- Stores belong to approved sellers. Products are scoped to a store.
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  status store_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (slug)
);

COMMENT ON TABLE public.stores IS 'Stores owned by approved sellers; contain products.';

CREATE INDEX idx_stores_owner_id ON public.stores (owner_id);
CREATE INDEX idx_stores_slug ON public.stores (slug);
CREATE INDEX idx_stores_status ON public.stores (status);

-- =============================================================================
-- STORE MEMBERS
-- =============================================================================
-- Many-to-many: sellers can be members of stores (owner, manager, member). Owner created the store.
CREATE TABLE public.store_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role store_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, user_id)
);

COMMENT ON TABLE public.store_members IS 'Which sellers belong to which stores; roles: owner, manager, member.';

CREATE INDEX idx_store_members_store_id ON public.store_members (store_id);
CREATE INDEX idx_store_members_user_id ON public.store_members (user_id);

-- =============================================================================
-- PRODUCTS
-- =============================================================================
-- Products belong to a store. Slug unique per store.
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  sku TEXT,
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  status product_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, slug)
);

COMMENT ON TABLE public.products IS 'Products belong to a store; slug is unique per store.';

CREATE INDEX idx_products_store_id ON public.products (store_id);
CREATE INDEX idx_products_status ON public.products (status);
CREATE INDEX idx_products_created_at ON public.products (created_at DESC);
CREATE INDEX idx_products_store_slug ON public.products (store_id, slug);

-- =============================================================================
-- PRODUCT IMAGES
-- =============================================================================
-- Images for a product; sort_order for display order.
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.product_images IS 'Product images with optional alt text and display order.';

CREATE INDEX idx_product_images_product_id ON public.product_images (product_id);
CREATE INDEX idx_product_images_product_sort ON public.product_images (product_id, sort_order);

-- =============================================================================
-- ORDERS
-- =============================================================================
-- Customer orders; one order can contain items from multiple stores.
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'Customer orders; totals and shipping/billing addresses.';

CREATE INDEX idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);

-- =============================================================================
-- ORDER ITEMS
-- =============================================================================
-- Line items in an order; store price snapshot at order time.
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, product_id)
);

COMMENT ON TABLE public.order_items IS 'Order line items with quantity and price snapshot.';

CREATE INDEX idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items (product_id);

-- =============================================================================
-- REVIEWS
-- =============================================================================
-- Customer reviews for products; optional moderation (pending/approved/rejected).
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  status review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, customer_id)
);

COMMENT ON TABLE public.reviews IS 'Customer reviews for products; one review per customer per product.';

CREATE INDEX idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews (customer_id);
CREATE INDEX idx_reviews_status ON public.reviews (status);
CREATE INDEX idx_reviews_created_at ON public.reviews (created_at DESC);

-- =============================================================================
-- WISHLISTS
-- =============================================================================
-- One wishlist per customer; wishlist_items link to products.
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.wishlists IS 'One wishlist per customer.';

CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (wishlist_id, product_id)
);

COMMENT ON TABLE public.wishlist_items IS 'Products in a customer wishlist.';

CREATE INDEX idx_wishlist_items_wishlist_id ON public.wishlist_items (wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items (product_id);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
-- In-app notifications for users (application result, order updates, etc.).
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notifications; type and optional data for routing.';

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications (user_id, read_at);
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

-- =============================================================================
-- ANALYTICS EVENTS
-- =============================================================================
-- Event stream for analytics (page views, product views, add to cart, etc.).
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  session_id TEXT,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.analytics_events IS 'Analytics event log; event_type and payload define the event.';

CREATE INDEX idx_analytics_events_event_type ON public.analytics_events (event_type);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events (user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_entity ON public.analytics_events (entity_type, entity_id);

-- =============================================================================
-- UPDATED_AT TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER seller_applications_updated_at
  BEFORE UPDATE ON public.seller_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- RLS (Row Level Security)
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all (for display), update own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Seller applications: applicant sees own; admins see all and can update
CREATE POLICY "Users can view own application"
  ON public.seller_applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own application"
  ON public.seller_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.seller_applications FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update applications (approve/reject)"
  ON public.seller_applications FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Stores: public read; store owner/members manage
CREATE POLICY "Stores are viewable by everyone"
  ON public.stores FOR SELECT USING (true);

CREATE POLICY "Store owners can insert store"
  ON public.stores FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'seller'
    AND EXISTS (
      SELECT 1 FROM public.seller_applications sa
      WHERE sa.user_id = auth.uid() AND sa.status = 'approved'
    )
  );

CREATE POLICY "Store owner/members can update store"
  ON public.stores FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM public.store_members WHERE store_id = id AND user_id = auth.uid())
  );

-- Store members: visible to store members; owner can manage
CREATE POLICY "Store members viewable by store members"
  ON public.store_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = store_id AND sm.user_id = auth.uid())
  );

CREATE POLICY "Store owner can manage members"
  ON public.store_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND owner_id = auth.uid()));

-- Products: public read active; store members manage
CREATE POLICY "Active products viewable by everyone"
  ON public.products FOR SELECT USING (status = 'active' OR status = 'out_of_stock');

CREATE POLICY "Store members can view all store products"
  ON public.products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = products.store_id AND sm.user_id = auth.uid())
  );

CREATE POLICY "Store owner/members can insert product"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = products.store_id AND sm.user_id = auth.uid())
  );

CREATE POLICY "Store owner/members can update product"
  ON public.products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = products.store_id AND sm.user_id = auth.uid())
  );

-- Product images: same as products (tied to product visibility)
CREATE POLICY "Product images viewable with product"
  ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Store can manage product images"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_images.product_id AND (s.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = p.store_id AND sm.user_id = auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.stores s ON s.id = p.store_id
      WHERE p.id = product_images.product_id AND (s.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = p.store_id AND sm.user_id = auth.uid()))
    )
  );

-- Orders: customer sees own; store sees orders containing their products (optional, add later if needed)
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own pending orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = customer_id AND status = 'pending');

-- Order items: visible with order
CREATE POLICY "Order items viewable with order"
  ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()));

CREATE POLICY "Order items insert with order"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()));

-- Reviews: public read approved; customers write own; store/admin can moderate
CREATE POLICY "Approved reviews viewable by everyone"
  ON public.reviews FOR SELECT USING (status = 'approved');

CREATE POLICY "Customers can insert own review"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own review"
  ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view and update all reviews"
  ON public.reviews FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Wishlists: own only
CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist items"
  ON public.wishlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND user_id = auth.uid()));

-- Notifications: own only
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (e.g. mark read)"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Analytics: service role or authenticated insert; restrict read to admin if needed
CREATE POLICY "Authenticated users can insert events"
  ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR session_id IS NOT NULL);

CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- =============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
