-- Human-readable order references: MASA-YYYY-NNNNNN (yearly sequence, platform-wide).
-- UUID id remains the canonical key for URLs and FKs.

CREATE TABLE public.order_year_counters (
  year INT PRIMARY KEY,
  last_seq BIGINT NOT NULL DEFAULT 0
);

COMMENT ON TABLE public.order_year_counters IS 'Per-calendar-year sequence for orders.order_number; updated only by assign_order_number trigger.';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON public.orders (order_number)
  WHERE order_number IS NOT NULL;

COMMENT ON COLUMN public.orders.order_number IS 'Display reference e.g. MASA-2026-000001; assigned by trigger on insert.';

-- Backfill existing orders (chronological per year), then seed counters.
UPDATE public.orders o
SET order_number = sub.ref
FROM (
  SELECT
    id,
    'MASA-' || y::TEXT || '-' || LPAD(seq::TEXT, 6, '0') AS ref
  FROM (
    SELECT
      id,
      EXTRACT(YEAR FROM created_at)::INT AS y,
      ROW_NUMBER() OVER (
        PARTITION BY EXTRACT(YEAR FROM created_at)
        ORDER BY created_at ASC, id ASC
      ) AS seq
    FROM public.orders
    WHERE order_number IS NULL
  ) t
) sub
WHERE o.id = sub.id;

INSERT INTO public.order_year_counters (year, last_seq)
SELECT EXTRACT(YEAR FROM created_at)::INT AS y, COUNT(*)::BIGINT
FROM public.orders
GROUP BY EXTRACT(YEAR FROM created_at)
ON CONFLICT (year) DO UPDATE
SET last_seq = GREATEST(public.order_year_counters.last_seq, EXCLUDED.last_seq);

CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  y INT := EXTRACT(YEAR FROM COALESCE(NEW.created_at, NOW()))::INT;
  next_seq BIGINT;
BEGIN
  IF NEW.order_number IS NOT NULL AND length(trim(NEW.order_number)) > 0 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.order_year_counters (year, last_seq)
  VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE
  SET last_seq = public.order_year_counters.last_seq + 1
  RETURNING last_seq INTO next_seq;

  NEW.order_number := 'MASA-' || y::TEXT || '-' || LPAD(next_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_assign_order_number ON public.orders;
CREATE TRIGGER trg_orders_assign_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_order_number();

REVOKE ALL ON public.order_year_counters FROM PUBLIC;

ALTER TABLE public.orders
  ALTER COLUMN order_number SET NOT NULL;
