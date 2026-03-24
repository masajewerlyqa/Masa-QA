-- =============================================================================
-- Reviews admin moderation fields & RLS adjustments
-- =============================================================================

-- Add moderation metadata fields if they don't exist yet.
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles (id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_note TEXT;

COMMENT ON COLUMN public.reviews.approved_by IS 'Admin user id who approved the review';
COMMENT ON COLUMN public.reviews.approved_at IS 'Timestamp when the review was approved';
COMMENT ON COLUMN public.reviews.admin_note IS 'Optional internal note from admin about the review decision';

-- Ensure sellers cannot UPDATE reviews anymore; only admins can via
-- the existing "Admins can view and update all reviews" policy.
DROP POLICY IF EXISTS "Sellers can update reviews for their store products" ON public.reviews;

