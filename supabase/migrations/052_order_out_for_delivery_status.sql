-- Completes the delivery lifecycle: pending -> confirmed -> shipped ->
-- out_for_delivery -> delivered. The courier collects payment at this last hop,
-- so it is the step that matters for cash/card on delivery.
--
-- Enum value only; anything referencing it lives in 053.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'out_for_delivery'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'out_for_delivery';
  END IF;
END
$$;
