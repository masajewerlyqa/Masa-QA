# Storage bucket: product-images

Sellers upload product images to Supabase Storage. Images are stored under `product-images/{store_id}/{filename}`.

## Bucket (created by migration 004)

- **Name:** `product-images`
- **Public:** Yes (product images are visible to customers)
- Migrations create the bucket and RLS policies.

## Upload path

Use path: `{store_id}/{uuid}-{sanitized_filename}` so that:
- Each store's files are namespaced.
- Filenames are unique (uuid prefix).
- RLS allows only store owner/members to upload to their store's folder.

Example: `a1b2c3d4-.../f7e8d9c0-image1.jpg`

## Policies (see migration 004_storage_product_images_bucket.sql)

- **INSERT:** Authenticated store owner or store member can upload to a folder named with their store id.
- **SELECT:** Anyone can read (public bucket).
- **UPDATE/DELETE:** Store owner/members can update or delete objects under their store id folder.
