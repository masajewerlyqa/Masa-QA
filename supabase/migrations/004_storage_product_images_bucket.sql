-- Create product-images bucket (public so product images are viewable by everyone).
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Sellers upload to product-images/{store_id}/{filename}. Only store owner/members can upload.
DROP POLICY IF EXISTS "Store members can upload product images" ON storage.objects;
CREATE POLICY "Store members can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.stores s
      WHERE s.owner_id = auth.uid()
      UNION
      SELECT sm.store_id::text FROM public.store_members sm
      WHERE sm.user_id = auth.uid()
    )
  );

-- Public read (bucket is public; this allows anon/authenticated to read).
DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;
CREATE POLICY "Product images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Store members can update/delete their store's product images (path starts with their store_id).
DROP POLICY IF EXISTS "Store members can update own product images" ON storage.objects;
CREATE POLICY "Store members can update own product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.stores s
      WHERE s.owner_id = auth.uid()
      UNION
      SELECT sm.store_id::text FROM public.store_members sm
      WHERE sm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store members can delete own product images" ON storage.objects;
CREATE POLICY "Store members can delete own product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.stores s
      WHERE s.owner_id = auth.uid()
      UNION
      SELECT sm.store_id::text FROM public.store_members sm
      WHERE sm.user_id = auth.uid()
    )
  );
