import { Product } from '../types/catalog';
import { ServiceResult } from '../types/service';
import { supabase } from './supabase';
import { mapProduct, ProductRow, PRODUCT_SELECT } from './productService';

async function getOrCreateWishlist(userId: string): Promise<string | null> {
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error || !data) {
    return null;
  }
  return data.id;
}

export async function getWishlistCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) {
    return 0;
  }

  const { count, error } = await supabase
    .from('wishlist_items')
    .select('id', { count: 'exact', head: true })
    .eq('wishlist_id', wishlistId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function getWishlistProductIds(): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) {
    return [];
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('wishlist_id', wishlistId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.product_id);
}

export async function getWishlistProducts(): Promise<Product[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) {
    return [];
  }

  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`product_id, product:products(${PRODUCT_SELECT})`)
    .eq('wishlist_id', wishlistId);

  if (error || !data) {
    return [];
  }

  type Row = { product_id: string; product: ProductRow | null };

  return (data as unknown as Row[])
    .filter((item): item is Row & { product: ProductRow } => item.product !== null)
    .map((item) => mapProduct(item.product));
}

export async function addToWishlist(productId: string): Promise<ServiceResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Sign in to add to wishlist' };
  }

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) {
    return { ok: false, error: 'Could not load wishlist' };
  }

  const { error } = await supabase
    .from('wishlist_items')
    .insert({ wishlist_id: wishlistId, product_id: productId });

  if (error) {
    if (error.code === '23505') {
      return { ok: true, data: undefined };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, data: undefined };
}

export async function removeFromWishlist(productId: string): Promise<ServiceResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Sign in to manage wishlist' };
  }

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) {
    return { ok: true, data: undefined };
  }

  await supabase
    .from('wishlist_items')
    .delete()
    .eq('wishlist_id', wishlistId)
    .eq('product_id', productId);

  return { ok: true, data: undefined };
}

export async function toggleWishlist(
  productId: string,
  currentlyInWishlist: boolean,
): Promise<ServiceResult> {
  if (currentlyInWishlist) {
    return removeFromWishlist(productId);
  }
  return addToWishlist(productId);
}
