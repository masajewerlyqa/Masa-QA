import * as ImagePicker from 'expo-image-picker';

import { getSupabase } from '../api/client';

/**
 * Product image picking/upload for the seller product form.
 *
 * Uploads straight to Storage under the anon key, same as
 * `pickLogoImage`/`uploadFromUri` in sellerApplicationService.ts: the
 * `product-images` bucket's RLS (migration 004) only allows a store
 * owner/member to write under `product-images/{store_id}/...`, so this needs
 * no service role and no API route.
 */
const BUCKET = 'product-images';

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 100) || 'image.jpg';
}

export async function pickProductImages(): Promise<{ uri: string; name: string }[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.85,
    selectionLimit: 8,
  });
  if (result.canceled) return [];
  return result.assets.map((asset, i) => ({
    uri: asset.uri,
    name: asset.fileName ?? `product-${Date.now()}-${i}.jpg`,
  }));
}

/**
 * Uploads directly under `{storeId}/...` -- not `{storeId}/{productId}/...` --
 * because for a new product there is no id yet: web's ProductForm uploads
 * images first, then passes the resulting URLs to `createProduct`, which
 * inserts the product row afterwards. Matching that path shape here (not a
 * per-product subfolder) keeps both clients writing to the same layout.
 */
export async function uploadProductImage(
  storeId: string,
  asset: { uri: string; name: string },
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const ext = asset.name.split('.').pop() || 'jpg';
    const path = `${storeId}/${Date.now()}-${sanitizeFileName(asset.name.replace(/\.[^.]+$/, ''))}.${ext}`;

    const { error } = await getSupabase()
      .storage.from(BUCKET)
      .upload(path, arrayBuffer, { contentType: blob.type || 'image/jpeg', upsert: false });

    if (error) return { ok: false, error: error.message };

    const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed.' };
  }
}
