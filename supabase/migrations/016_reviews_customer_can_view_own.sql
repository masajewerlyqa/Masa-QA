-- =============================================================================
-- Fix: allow customers to SELECT their own reviews (any status)
-- =============================================================================
-- Problem: RLS only allows SELECT where status = 'approved', so customers
-- cannot read their own pending/rejected reviews. This breaks:
--   - getCustomerReviewForProduct (can't find existing review)
--   - submitReview (thinks no review exists, tries INSERT → duplicate key)
--   - Product page merge (can't show customer's pending review)
-- Fix: add policy allowing customers to SELECT own reviews regardless of status.
-- =============================================================================

CREATE POLICY "Customers can view own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = customer_id);
