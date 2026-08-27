-- Private bank-transfer proofs: seller-payment-proofs/{user_id}/{filename}
--
-- Deliberately NOT public: a payment proof is a bank document. Reads go through
-- a signed URL minted server-side, so a leaked path is not enough to view one.
-- Sellers are scoped to their own folder; only admins can read across sellers.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'seller-payment-proofs',
  'seller-payment-proofs',
  false,
  5242880, -- 5 MB; proofs are a photo or a one-page PDF
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Sellers can upload own payment proof" ON storage.objects;
CREATE POLICY "Sellers can upload own payment proof"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'seller-payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- A seller may re-upload after a rejection, so UPDATE is allowed on own folder.
DROP POLICY IF EXISTS "Sellers can replace own payment proof" ON storage.objects;
CREATE POLICY "Sellers can replace own payment proof"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'seller-payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'seller-payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Sellers can read own payment proof" ON storage.objects;
CREATE POLICY "Sellers can read own payment proof"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'seller-payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Admins can read all payment proofs" ON storage.objects;
CREATE POLICY "Admins can read all payment proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'seller-payment-proofs'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- No DELETE policy: proofs are financial evidence for an approval decision and
-- must survive the seller changing their mind. Removal is an admin/service-role
-- operation, which bypasses RLS by design.
