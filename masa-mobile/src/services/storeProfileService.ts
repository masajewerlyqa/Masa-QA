import { getSupabase } from '../api/client';

/**
 * Public store profile, mirroring web `getPublicStoreBySlug` and
 * `getStoreReviewStats` (lib/data/public.ts) query-for-query, filtered by id
 * instead of slug since that is what a product row already carries (mobile's
 * `Product` type has no `storeSlug`).
 *
 * Both web functions already run on the plain RLS-scoped client, not the
 * service role -- "Stores are viewable by everyone" and "Active products
 * viewable by everyone" (migration 001) are public SELECT policies -- so this
 * is a direct read, same as web, no API route needed.
 */

export type PublicStorePolicy = {
  returnsEnabled: boolean;
  exchangesEnabled: boolean;
  returnPeriodDays: number;
  exchangePeriodDays: number;
  customConditions: string | null;
  sameDayDeliveryEnabled: boolean;
  sameDayCutoffLocal: string | null;
};

export type PublicStore = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImage: string | null;
  logo: string | null;
  location: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  latitude: number | null;
  longitude: number | null;
  policy: PublicStorePolicy | null;
};

async function getStoreReviewStats(
  storeId: string,
): Promise<{ averageRating: number; reviewCount: number }> {
  const supabase = getSupabase();
  const { data: productRows } = await supabase.from('products').select('id').eq('store_id', storeId);
  const productIds = (productRows ?? []).map((p) => p.id as string);
  if (productIds.length === 0) return { averageRating: 0, reviewCount: 0 };

  const { data: reviewRows, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('status', 'approved')
    .in('product_id', productIds);

  if (error || !reviewRows || reviewRows.length === 0) return { averageRating: 0, reviewCount: 0 };
  const reviewCount = reviewRows.length;
  const sum = reviewRows.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  const averageRating = Math.round((sum / reviewCount) * 10) / 10;
  return { averageRating, reviewCount };
}

export async function getPublicStoreById(storeId: string): Promise<PublicStore | null> {
  const supabase = getSupabase();
  // select('*'): an explicit long column list hits a known postgrest-js
  // type-inference limit past ~20 columns (see sellerDashboardService.ts).
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .in('status', ['active', 'approved'])
    .maybeSingle();

  if (error || !data) return null;

  const [{ count }, stats] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
    getStoreReviewStats(storeId),
  ]);

  const logoUrl = (data.logo_url as string | null) ?? null;
  const bannerUrl = (data.banner_url as string | null) ?? null;

  return {
    id: data.id as string,
    slug: (data.slug as string | null) ?? '',
    name: (data.name as string | null) ?? '',
    description: (data.description as string | null) ?? '',
    coverImage: bannerUrl ?? logoUrl,
    logo: logoUrl,
    location: (data.location as string | null) ?? '',
    phone: (data.contact_phone as string | null) ?? '',
    email: (data.contact_email as string | null) ?? '',
    rating: stats.averageRating,
    reviewCount: stats.reviewCount,
    productCount: count ?? 0,
    latitude: data.latitude != null ? Number(data.latitude) : null,
    longitude: data.longitude != null ? Number(data.longitude) : null,
    policy: {
      returnsEnabled: data.returns_enabled !== false,
      exchangesEnabled: data.exchanges_enabled !== false,
      returnPeriodDays: Number(data.return_period_days) || 3,
      exchangePeriodDays: Number(data.exchange_period_days) || 3,
      customConditions: (data.policy_custom_conditions as string | null) ?? null,
      sameDayDeliveryEnabled: data.same_day_delivery_enabled === true,
      sameDayCutoffLocal: (data.same_day_cutoff_local as string | null) ?? null,
    },
  };
}
