-- =============================================================================
-- Store-licenses bucket and RLS for seller application license uploads
-- =============================================================================
-- Without this, storage upload (step 1) fails with:
-- "new row violates row-level security policy"
-- because storage.objects has no INSERT policy for store-licenses.
-- =============================================================================

-- Create bucket (private; only authenticated users with policies can access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-licenses', 'store-licenses', false)
ON CONFLICT (id) DO NOTHING;

-- INSERT: authenticated users can upload only under their own folder: {auth.uid()}/...
DROP POLICY IF EXISTS "Users can upload own licenses" ON storage.objects;
CREATE POLICY "Users can upload own licenses"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'store-licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: users can read their own files only (same path rule)
DROP POLICY IF EXISTS "Users can read own licenses" ON storage.objects;
CREATE POLICY "Users can read own licenses"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'store-licenses'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
