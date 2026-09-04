-- Account deletion (Google Play "Delete account URL" requirement).
--
-- Deleting auth.users cascades to profiles, which cascades to most user-owned
-- tables. Three foreign keys block that cascade today and must be relaxed
-- first, otherwise the delete fails with a foreign key violation:
--
--   orders.customer_id        ON DELETE RESTRICT
--   stores.owner_id           ON DELETE RESTRICT
--   reviews.approved_by       (no ON DELETE clause -> NO ACTION)
--
-- Orders and stores are deliberately NOT deleted: they are financial and
-- marketplace records that must survive for accounting, tax, dispute and audit
-- purposes, and an order also belongs to the seller, not only the buyer.
-- Instead the personal link is severed (SET NULL) and the personal data on the
-- row is erased by public.delete_own_account() below. That is the standard
-- "retain the record, erase the person" pattern.

-- 1. orders: keep the row, drop the link to the deleted buyer.
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_customer_id_fkey
  FOREIGN KEY (customer_id) REFERENCES public.profiles (id) ON DELETE SET NULL;

-- 2. stores: keep the storefront row for order history integrity, but it is
--    deactivated by delete_own_account() so it cannot keep selling ownerless.
ALTER TABLE public.stores ALTER COLUMN owner_id DROP NOT NULL;

ALTER TABLE public.stores DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;
ALTER TABLE public.stores
  ADD CONSTRAINT stores_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.profiles (id) ON DELETE SET NULL;

-- 3. reviews.approved_by: the moderating admin, not the review author. Losing
--    the attribution is acceptable; blocking the admin's deletion is not.
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_approved_by_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_approved_by_fkey
  FOREIGN KEY (approved_by) REFERENCES public.profiles (id) ON DELETE SET NULL;

-- =============================================================================
-- delete_own_account()
-- =============================================================================
-- Erases the caller's personal data from records that are retained.
--
-- Security:
--   * SECURITY DEFINER so it can write rows the caller's RLS would not allow
--     (e.g. anonymising an order the buyer may no longer update).
--   * Takes NO user id argument. The target is always auth.uid(), so a client
--     cannot pass someone else's id -- the single most important property here.
--   * Raises if called without a session, so it is unusable anonymously.
--   * search_path is pinned, matching migration 048's fix, so the function
--     cannot be hijacked by a malicious search_path.
--
-- This does NOT delete auth.users: that requires the service role and is done
-- by the server route that calls this, after this returns.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Strip buyer personal data from retained orders. The order totals, line
  -- items, status and timestamps stay intact for accounting.
  UPDATE public.orders
  SET
    shipping_address = NULL,
    billing_address = NULL,
    notes = NULL,
    delivery_phone = NULL,
    delivery_landmark = NULL,
    delivery_map_url = NULL,
    delivery_lat = NULL,
    delivery_lng = NULL,
    delivery_building_no = NULL,
    delivery_apartment_no = NULL,
    delivery_floor_no = NULL,
    delivery_street_no = NULL,
    delivery_zone_no = NULL,
    delivery_city_area = NULL,
    delivery_building_type = NULL,
    updated_at = NOW()
  WHERE customer_id = uid;

  -- A store whose owner is gone must stop accepting orders. Closing it also
  -- removes it from the public marketplace, whose queries filter on status.
  UPDATE public.stores
  SET status = 'closed', updated_at = NOW()
  WHERE owner_id = uid;

  -- Free the applicant's uploaded document paths; the objects themselves are
  -- removed by the server route, which has storage privileges.
  UPDATE public.seller_applications
  SET logo_path = NULL, license_path = NULL, payment_proof_path = NULL
  WHERE user_id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_own_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

COMMENT ON FUNCTION public.delete_own_account() IS
  'Erases the calling user''s personal data from retained records (orders, stores, seller application files). Target is always auth.uid(); never accepts a user id. Deleting auth.users is done separately by the server with the service role.';
