-- =============================================================================
-- Store moderation: pending, approved, rejected.
-- Only approved stores appear in marketplace. Admin can approve/reject stores.
-- =============================================================================

-- Add new enum values (keep existing active/suspended/closed for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'store_status' AND e.enumlabel = 'pending') THEN
    ALTER TYPE store_status ADD VALUE 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'store_status' AND e.enumlabel = 'approved') THEN
    ALTER TYPE store_status ADD VALUE 'approved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'store_status' AND e.enumlabel = 'rejected') THEN
    ALTER TYPE store_status ADD VALUE 'rejected';
  END IF;
END
$$;

-- Migrate existing: active -> approved so marketplace keeps showing them
UPDATE public.stores SET status = 'approved' WHERE status = 'active';

-- New stores default to pending
ALTER TABLE public.stores ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN public.stores.status IS 'pending = awaiting admin approval; approved = visible in marketplace; rejected = not visible. active/suspended/closed retained for compatibility.';

-- Admins can update store status (approve/reject)
DROP POLICY IF EXISTS "Admins can update store status" ON public.stores;
CREATE POLICY "Admins can update store status"
  ON public.stores FOR UPDATE
  USING (public.current_user_role() = 'admin');
