-- Bank-transfer payment tracking for seller applications.
-- Extends the existing table rather than adding a parallel one: reviewed_by /
-- reviewed_at / review_notes already exist and are reused as the admin audit
-- trail, so only payment-specific state is added here.

ALTER TABLE public.seller_applications
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_amount_qar NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS payment_proof_path TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

COMMENT ON COLUMN public.seller_applications.payment_reference IS
  'Human-quotable reference the seller puts on the bank transfer so admins can match it.';
COMMENT ON COLUMN public.seller_applications.payment_amount_qar IS
  'Amount due in QAR, snapshotted at submission so later plan price changes do not rewrite history.';
COMMENT ON COLUMN public.seller_applications.payment_proof_path IS
  'Object path inside the private seller-payment-proofs bucket. Never a public URL.';
COMMENT ON COLUMN public.seller_applications.payment_verified_at IS
  'Set only when an admin confirms the transfer actually arrived.';
COMMENT ON COLUMN public.seller_applications.rejection_reason IS
  'Shown to the seller so they know what to correct before resubmitting proof.';

-- One reference per application, but only once assigned.
CREATE UNIQUE INDEX IF NOT EXISTS seller_applications_payment_reference_key
  ON public.seller_applications (payment_reference)
  WHERE payment_reference IS NOT NULL;

-- Admin review queue is read by status + recency.
CREATE INDEX IF NOT EXISTS seller_applications_proof_submitted_idx
  ON public.seller_applications (payment_proof_submitted_at DESC)
  WHERE payment_proof_submitted_at IS NOT NULL;

-- Guard the money column: an amount, once set, must be positive.
ALTER TABLE public.seller_applications
  DROP CONSTRAINT IF EXISTS seller_applications_payment_amount_positive;

ALTER TABLE public.seller_applications
  ADD CONSTRAINT seller_applications_payment_amount_positive
  CHECK (payment_amount_qar IS NULL OR payment_amount_qar > 0);

-- A verified payment must name the admin who verified it, so approval is
-- always attributable. Enforced in the database, not just the UI.
ALTER TABLE public.seller_applications
  DROP CONSTRAINT IF EXISTS seller_applications_verified_requires_reviewer;

ALTER TABLE public.seller_applications
  ADD CONSTRAINT seller_applications_verified_requires_reviewer
  CHECK (payment_verified_at IS NULL OR reviewed_by IS NOT NULL);

-- A rejected application must carry a reason the seller can act on.
-- NOT VALID: this is a forward-looking guarantee. Applications rejected before
-- this migration predate the requirement, and failing the deploy over them
-- would be worse than leaving them as-is.
ALTER TABLE public.seller_applications
  DROP CONSTRAINT IF EXISTS seller_applications_rejected_requires_reason;

ALTER TABLE public.seller_applications
  ADD CONSTRAINT seller_applications_rejected_requires_reason
  CHECK (
    status <> 'rejected'
    OR rejection_reason IS NOT NULL
    OR review_notes IS NOT NULL
  )
  NOT VALID;
