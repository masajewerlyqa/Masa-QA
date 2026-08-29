-- Stop applicants writing their own review outcome.
--
-- "Users can update own application" (migration 005) exists so an applicant can
-- resubmit their form, but RLS grants rows, not columns: the same policy lets
-- them set status = 'approved', clear a rejection, or backdate
-- payment_verified_at with a direct PostgREST call. That was low impact when
-- the column only tracked form review; now that it gates a paid seller plan it
-- is a way to fake a verified payment.
--
-- Postgres cannot express "these columns are admin-only" in a policy, so this
-- is enforced with a trigger instead. Admins and the service role are
-- unaffected, so the existing approve/reject actions keep working.

CREATE OR REPLACE FUNCTION public.guard_seller_application_review_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Service role has no JWT claim and must stay unrestricted: approvals run
  -- through it, as does anything operational.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.current_user_role() = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Applicant editing their own row: pin every field that represents a
  -- decision about them back to its stored value.
  NEW.status                := OLD.status;
  NEW.reviewed_by           := OLD.reviewed_by;
  NEW.reviewed_at           := OLD.reviewed_at;
  NEW.review_notes          := OLD.review_notes;
  NEW.rejection_reason      := OLD.rejection_reason;
  NEW.payment_verified_at   := OLD.payment_verified_at;
  NEW.payment_amount_qar    := OLD.payment_amount_qar;
  NEW.payment_reference     := OLD.payment_reference;
  NEW.seller_plan           := OLD.seller_plan;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.guard_seller_application_review_fields() IS
  'Silently reverts applicant edits to review/payment-decision columns. Admins and service role bypass.';

DROP TRIGGER IF EXISTS seller_applications_guard_review_fields ON public.seller_applications;

CREATE TRIGGER seller_applications_guard_review_fields
  BEFORE UPDATE ON public.seller_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_seller_application_review_fields();
