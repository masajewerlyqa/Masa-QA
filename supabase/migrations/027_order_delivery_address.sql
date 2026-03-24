-- Precise delivery address fields for orders (Qatar-focused).
-- Structured fields are the source of truth; shipping_address JSON kept for backward compat.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_country TEXT DEFAULT 'Qatar',
  ADD COLUMN IF NOT EXISTS delivery_city_area TEXT,
  ADD COLUMN IF NOT EXISTS delivery_building_type TEXT,
  ADD COLUMN IF NOT EXISTS delivery_zone_no TEXT,
  ADD COLUMN IF NOT EXISTS delivery_street_no TEXT,
  ADD COLUMN IF NOT EXISTS delivery_building_no TEXT,
  ADD COLUMN IF NOT EXISTS delivery_floor_no TEXT,
  ADD COLUMN IF NOT EXISTS delivery_apartment_no TEXT,
  ADD COLUMN IF NOT EXISTS delivery_landmark TEXT,
  ADD COLUMN IF NOT EXISTS delivery_phone TEXT,
  ADD COLUMN IF NOT EXISTS delivery_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS delivery_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS delivery_map_url TEXT;

COMMENT ON COLUMN public.orders.delivery_country IS 'Delivery country (default Qatar).';
COMMENT ON COLUMN public.orders.delivery_city_area IS 'City or area within Qatar (e.g. Al Sadd, The Pearl).';
COMMENT ON COLUMN public.orders.delivery_building_type IS 'Building type: house_villa, apartment, office, shop, public_place, other.';
COMMENT ON COLUMN public.orders.delivery_zone_no IS 'Qatar zone number.';
COMMENT ON COLUMN public.orders.delivery_street_no IS 'Street number.';
COMMENT ON COLUMN public.orders.delivery_building_no IS 'Building number.';
COMMENT ON COLUMN public.orders.delivery_floor_no IS 'Floor number (apartments/offices).';
COMMENT ON COLUMN public.orders.delivery_apartment_no IS 'Apartment/unit number.';
COMMENT ON COLUMN public.orders.delivery_landmark IS 'Landmark or additional delivery instructions.';
COMMENT ON COLUMN public.orders.delivery_phone IS 'Delivery contact phone number.';
COMMENT ON COLUMN public.orders.delivery_lat IS 'Exact delivery latitude from map picker.';
COMMENT ON COLUMN public.orders.delivery_lng IS 'Exact delivery longitude from map picker.';
COMMENT ON COLUMN public.orders.delivery_map_url IS 'Google Maps URL for the delivery location.';
