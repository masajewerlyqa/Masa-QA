-- Seller application payment state machine (bank-transfer MVP).
--
-- Existing values are kept and keep their meaning, so nothing already in the
-- table has to be rewritten:
--   pending   -- application submitted, awaiting plan payment triage (legacy rows)
--   approved  -- terminal ACTIVE state: seller may operate and publish products
--   rejected  -- terminal REJECTED state
--
-- New values only. Postgres refuses to USE an enum value in the same
-- transaction that adds it, so every column/constraint that references these
-- lives in 050_seller_application_payment_fields.sql.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'seller_application_status' AND e.enumlabel = 'pending_payment'
  ) THEN
    ALTER TYPE public.seller_application_status ADD VALUE 'pending_payment';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'seller_application_status' AND e.enumlabel = 'payment_proof_submitted'
  ) THEN
    ALTER TYPE public.seller_application_status ADD VALUE 'payment_proof_submitted';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'seller_application_status' AND e.enumlabel = 'under_review'
  ) THEN
    ALTER TYPE public.seller_application_status ADD VALUE 'under_review';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'seller_application_status' AND e.enumlabel = 'expired'
  ) THEN
    ALTER TYPE public.seller_application_status ADD VALUE 'expired';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'seller_application_status' AND e.enumlabel = 'cancelled'
  ) THEN
    ALTER TYPE public.seller_application_status ADD VALUE 'cancelled';
  END IF;
END
$$;

COMMENT ON TYPE public.seller_application_status IS
  'Seller application lifecycle: pending_payment -> payment_proof_submitted -> under_review -> approved (ACTIVE) | rejected. Also expired/cancelled. Legacy rows may still be "pending".';
