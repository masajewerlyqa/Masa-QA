-- =============================================================================
-- Fix RLS recursion (42P17 / infinite recursion) and seller application submit
-- =============================================================================
-- Problem: store_members SELECT policy referenced store_members in a subquery,
-- causing infinite recursion when the policy was evaluated.
-- Also: seller_applications upsert needs UPDATE on own row; admin checks can
-- use SECURITY DEFINER to avoid any cross-table RLS chains.
-- =============================================================================

-- Helper: current user's role (bypasses RLS to avoid recursion in admin policies)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Helper: is user a member of this store? (bypasses RLS to avoid self-reference on store_members)
CREATE OR REPLACE FUNCTION public.is_store_member(p_store_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = p_user_id
  );
$$;

-- -----------------------------------------------------------------------------
-- seller_applications: use current_user_role() for admin; allow user to update own row (upsert)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all applications" ON public.seller_applications;
CREATE POLICY "Admins can view all applications"
  ON public.seller_applications FOR SELECT
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update applications (approve/reject)" ON public.seller_applications;
CREATE POLICY "Admins can update applications (approve/reject)"
  ON public.seller_applications FOR UPDATE
  USING (public.current_user_role() = 'admin');

-- Allow applicant to update their own application (for form resubmit/upsert)
CREATE POLICY "Users can update own application"
  ON public.seller_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- store_members: remove self-referential subquery; use is_store_member()
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Store members viewable by store members" ON public.store_members;
CREATE POLICY "Store members viewable by store members"
  ON public.store_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.owner_id = auth.uid())
    OR user_id = auth.uid()
    OR public.is_store_member(store_id, auth.uid())
  );

-- -----------------------------------------------------------------------------
-- Optional: use current_user_role() in other admin-only policies to avoid
-- reading profiles under RLS in nested contexts (reviews, analytics_events)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view and update all reviews" ON public.reviews;
CREATE POLICY "Admins can view and update all reviews"
  ON public.reviews FOR ALL
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can read analytics events" ON public.analytics_events;
CREATE POLICY "Admins can read analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.current_user_role() = 'admin');
