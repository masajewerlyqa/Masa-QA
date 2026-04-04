-- Store return/exchange/same-day policy, per-order policy snapshot, delivery timestamp, buyer requests.

-- -----------------------------------------------------------------------------
-- Store policy columns (current policy; buyers see this until an order captures a snapshot)
-- -----------------------------------------------------------------------------
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS returns_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS exchanges_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS return_period_days INT NOT NULL DEFAULT 3
    CHECK (return_period_days >= 1 AND return_period_days <= 14),
  ADD COLUMN IF NOT EXISTS exchange_period_days INT NOT NULL DEFAULT 3
    CHECK (exchange_period_days >= 1 AND exchange_period_days <= 14),
  ADD COLUMN IF NOT EXISTS policy_custom_conditions TEXT,
  ADD COLUMN IF NOT EXISTS same_day_delivery_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS same_day_cutoff_local TIME NOT NULL DEFAULT '14:00:00',
  ADD COLUMN IF NOT EXISTS store_policy_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.stores.returns_enabled IS 'When true, store accepts returns per return_period_days from delivery (buyer-facing).';
COMMENT ON COLUMN public.stores.exchanges_enabled IS 'When true, store accepts exchanges per exchange_period_days from delivery.';
COMMENT ON COLUMN public.stores.return_period_days IS 'Return window length in days from delivered_at (order snapshot).';
COMMENT ON COLUMN public.stores.exchange_period_days IS 'Exchange window length in days from delivered_at.';
COMMENT ON COLUMN public.stores.policy_custom_conditions IS 'Free-text conditions (unused, packaging, etc.).';
COMMENT ON COLUMN public.stores.same_day_delivery_enabled IS 'Store offers same-day delivery when order is before same_day_cutoff_local (store local time).';
COMMENT ON COLUMN public.stores.same_day_cutoff_local IS 'Local cutoff time (store business day) for same-day delivery promise.';
COMMENT ON COLUMN public.stores.store_policy_updated_at IS 'Last time store policy was saved; enforces 14-day cooldown between edits.';

-- -----------------------------------------------------------------------------
-- Orders: snapshot of each store policy involved + actual delivery moment
-- -----------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS policy_snapshots JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

COMMENT ON COLUMN public.orders.policy_snapshots IS 'Map store_id -> policy fields at checkout time; protects buyers from later seller changes.';
COMMENT ON COLUMN public.orders.delivered_at IS 'Set when status becomes delivered; return/exchange windows count from this time.';

CREATE INDEX IF NOT EXISTS idx_orders_policy_snapshots_gin ON public.orders USING gin (policy_snapshots);

-- Set delivered_at when transitioning into delivered (idempotent if already set)
CREATE OR REPLACE FUNCTION public.trg_orders_set_delivered_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'delivered'::public.order_status
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NEW.delivered_at IS NULL THEN
      NEW.delivered_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_set_delivered_at ON public.orders;
CREATE TRIGGER trg_orders_set_delivered_at
  BEFORE INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_orders_set_delivered_at();

-- Approximate delivery moment for existing delivered rows (snapshot eligibility)
UPDATE public.orders
SET delivered_at = COALESCE(delivered_at, updated_at)
WHERE status = 'delivered'::public.order_status AND delivered_at IS NULL;

-- -----------------------------------------------------------------------------
-- Buyer return / exchange requests (notifies sellers; audit trail)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_return_exchange_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('return', 'exchange')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.order_return_exchange_requests IS 'Buyer-submitted return or exchange intent; eligibility enforced in application layer.';

-- Repair partial runs: table may exist without store_id before indexes/policies reference it.
ALTER TABLE public.order_return_exchange_requests
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_order_rer_order_id ON public.order_return_exchange_requests (order_id);
CREATE INDEX IF NOT EXISTS idx_order_rer_customer_id ON public.order_return_exchange_requests (customer_id);
CREATE INDEX IF NOT EXISTS idx_order_rer_store_id ON public.order_return_exchange_requests (store_id);

ALTER TABLE public.order_return_exchange_requests ENABLE ROW LEVEL SECURITY;

-- INSERT policy: subqueries on order_items/products expose columns named order_id / store_id; bare names can shadow the
-- new row and break the check. Delegate to a SECURITY DEFINER SQL function with explicit parameters.
CREATE OR REPLACE FUNCTION public.order_return_exchange_request_insert_allowed(
  p_order_id UUID,
  p_store_id UUID,
  p_customer_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    auth.uid() = p_customer_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = p_order_id AND o.customer_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = p_order_id AND p.store_id = p_store_id
    );
$$;

REVOKE ALL ON FUNCTION public.order_return_exchange_request_insert_allowed(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.order_return_exchange_request_insert_allowed(UUID, UUID, UUID) TO authenticated;

DROP POLICY IF EXISTS "Customers insert return exchange for own orders" ON public.order_return_exchange_requests;
CREATE POLICY "Customers insert return exchange for own orders"
  ON public.order_return_exchange_requests FOR INSERT
  WITH CHECK (
    public.order_return_exchange_request_insert_allowed(order_id, store_id, customer_id)
  );

DROP POLICY IF EXISTS "Customers read own return exchange requests" ON public.order_return_exchange_requests;
CREATE POLICY "Customers read own return exchange requests"
  ON public.order_return_exchange_requests FOR SELECT
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Sellers read return exchange for store orders" ON public.order_return_exchange_requests;
CREATE POLICY "Sellers read return exchange for store orders"
  ON public.order_return_exchange_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_id AND s.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.store_members sm
      WHERE sm.store_id = store_id AND sm.user_id = auth.uid()
    )
  );
