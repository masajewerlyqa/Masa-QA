-- Must run in its own migration file so the enum value is committed before 040 uses it in indexes.
-- (PostgreSQL: new enum labels are not usable until the transaction that added them commits.)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'awaiting_seller'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'awaiting_seller';
  END IF;
END
$$;
