-- =============================================================================
-- Seller application: full professional schema (contact name, location, logo, social links)
-- =============================================================================

-- New columns on seller_applications
ALTER TABLE public.seller_applications
  ADD COLUMN IF NOT EXISTS contact_full_name TEXT,
  ADD COLUMN IF NOT EXISTS store_location TEXT,
  ADD COLUMN IF NOT EXISTS logo_path TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB;

COMMENT ON COLUMN public.seller_applications.contact_full_name IS 'Contact person full name for the application.';
COMMENT ON COLUMN public.seller_applications.store_location IS 'Store or business location (address or city/region).';
COMMENT ON COLUMN public.seller_applications.logo_path IS 'Path to logo image in Storage bucket store-logos (e.g. {user_id}/logo.jpg).';
COMMENT ON COLUMN public.seller_applications.social_links IS 'Optional social links: { website?, facebook?, instagram?, linkedin? } (URLs as strings).';

-- Store-logos bucket for seller application logo uploads (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload/read only under their own folder
DROP POLICY IF EXISTS "Users can upload own logos" ON storage.objects;
CREATE POLICY "Users can upload own logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'store-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can read own logos" ON storage.objects;
CREATE POLICY "Users can read own logos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'store-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
