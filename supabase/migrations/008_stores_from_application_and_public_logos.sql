-- =============================================================================
-- Stores: add columns for data copied from seller application on approval
-- =============================================================================
-- When an admin approves an application, we create a store with these fields.
-- Also make store-logos bucket public so store logo_url can be a public URL.
-- =============================================================================

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB;

COMMENT ON COLUMN public.stores.location IS 'Store location (from seller application on approval).';
COMMENT ON COLUMN public.stores.contact_email IS 'Store contact email (from seller application).';
COMMENT ON COLUMN public.stores.contact_phone IS 'Store contact phone (from seller application).';
COMMENT ON COLUMN public.stores.social_links IS 'Optional social links JSON, e.g. { website, instagram, facebook, linkedin } (from seller application).';

-- Make store-logos public so store.logo_url can be a permanent public URL
UPDATE storage.buckets SET public = true WHERE id = 'store-logos';
