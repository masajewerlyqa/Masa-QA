-- Add store license file path to seller_applications (file stored in Supabase Storage bucket: store-licenses)
ALTER TABLE public.seller_applications
ADD COLUMN IF NOT EXISTS license_path TEXT;

COMMENT ON COLUMN public.seller_applications.license_path IS 'Path to store license file in Storage bucket store-licenses (e.g. {user_id}/{filename})';
