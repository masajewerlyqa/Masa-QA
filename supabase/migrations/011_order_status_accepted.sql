-- Align order lifecycle with professional statuses: add 'accepted' (replacing 'confirmed' in usage).
-- Existing data: migrate 'confirmed' -> 'accepted'. Enum keeps 'confirmed' for backward compatibility.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'accepted'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'accepted';
  END IF;
END
$$;

UPDATE public.orders
SET status = 'accepted'
WHERE status = 'confirmed';
