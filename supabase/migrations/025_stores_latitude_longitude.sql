-- Store location on map (Qatar). Seller selects a point; we store coordinates.
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

COMMENT ON COLUMN public.stores.latitude IS 'Store location latitude (Qatar map selection).';
COMMENT ON COLUMN public.stores.longitude IS 'Store location longitude (Qatar map selection).';
