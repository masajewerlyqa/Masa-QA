-- Atomic promo code usage increment to prevent race conditions.
CREATE OR REPLACE FUNCTION public.increment_promo_used_count(promo_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.promo_codes
  SET used_count = used_count + 1
  WHERE id = promo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
