-- Reserve stock for an order: decrement product stock and set out_of_stock when 0.
-- Called by checkout with service role; avoids race-condition overselling.

CREATE OR REPLACE FUNCTION public.decrement_order_stock(items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  pid uuid;
  qty int;
  new_stock int;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(items)
  LOOP
    pid := (item->>'product_id')::uuid;
    qty := (item->>'quantity')::int;
    IF qty IS NULL OR qty < 1 THEN
      RAISE EXCEPTION 'invalid_quantity';
    END IF;

    UPDATE public.products
    SET
      stock_quantity = stock_quantity - qty,
      status = CASE WHEN (stock_quantity - qty) <= 0 THEN 'out_of_stock'::product_status ELSE status END
    WHERE id = pid AND stock_quantity >= qty;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_stock' USING ERRCODE = 'P0001';
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.decrement_order_stock(jsonb) IS 'Decrements product stock for each cart item; sets status to out_of_stock when stock reaches 0. Fails if any product has insufficient stock.';
