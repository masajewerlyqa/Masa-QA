import { getSupabase } from '../api/client';
import { sitePostJsonAuthed } from '../api/siteApi';

export type SellerStoreSummary = {
  id: string;
  name: string;
  status: string;
};

export type SellerDashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  productsListed: number;
};

export type SellerStoreResult =
  | { ok: true; store: SellerStoreSummary | null; stats: SellerDashboardStats | null }
  | { ok: false; error: string };

/**
 * Resolves the caller's store through the web API rather than querying `stores`
 * directly.
 *
 * The API applies the same role check as the web dashboard and repairs an
 * approved seller whose store row is missing. That repair needs the service
 * role, which must never ship in the app bundle, so it cannot be done here.
 * Querying the table directly also meant an approved seller with no store row
 * was shown "No store yet" permanently while the web dashboard worked.
 */
export async function getSellerStoreForUser(): Promise<SellerStoreResult> {
  const result = await sitePostJsonAuthed<{
    ok: boolean;
    store: SellerStoreSummary | null;
    stats: SellerDashboardStats | null;
    error?: string;
  }>('/api/seller/store', {});

  if (!result.ok) {
    // Surfaced, not swallowed: a failed lookup must not look like "no store".
    console.error('[sellerDashboard] store lookup failed:', result.error);
    return { ok: false, error: result.error };
  }
  if (!result.data?.ok) {
    const error = result.data?.error ?? 'Could not load your store.';
    console.error('[sellerDashboard] store lookup rejected:', error);
    return { ok: false, error };
  }

  return { ok: true, store: result.data.store, stats: result.data.stats };
}

export type SellerProductRow = {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  status: string;
};

export type SellerOrderRow = {
  id: string;
  orderNumber: string | null;
  status: string;
  total: number;
  createdAt: string;
  customerName: string;
};

/**
 * Products belonging to this store. `orders` has no `store_id` column -- an
 * order can span multiple sellers -- so seller order rows come from
 * `order_items` joined through `products`, matching the RLS policy in
 * migration 009_seller_orders_rls.sql, not a direct `orders.store_id` filter.
 */
export async function getSellerProducts(storeId: string, limit = 20): Promise<SellerProductRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity, status')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[sellerDashboard] products load failed:', error.message);
    return [];
  }

  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    price: Number(p.price),
    stockQuantity: Number(p.stock_quantity),
    status: p.status as string,
  }));
}

export async function getSellerRecentOrders(storeId: string, limit = 10): Promise<SellerOrderRow[]> {
  const supabase = getSupabase();

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('order_id, products!inner(store_id)')
    .eq('products.store_id', storeId);

  if (itemsError || !items?.length) {
    if (itemsError) console.error('[sellerDashboard] order_items load failed:', itemsError.message);
    return [];
  }

  const orderIds = [...new Set(items.map((i) => i.order_id as string))];

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, customer_id')
    .in('id', orderIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (ordersError || !orders?.length) {
    if (ordersError) console.error('[sellerDashboard] orders load failed:', ordersError.message);
    return [];
  }

  const customerIds = [...new Set(orders.map((o) => o.customer_id as string))];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', customerIds);
  const nameMap = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

  return orders.map((o) => ({
    id: o.id as string,
    orderNumber: (o.order_number as string | null) ?? null,
    status: o.status as string,
    total: Number(o.total),
    createdAt: o.created_at as string,
    customerName: nameMap.get(o.customer_id as string) ?? '—',
  }));
}

export type SellerStoreFull = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string> | null;
  latitude: number | null;
  longitude: number | null;
  workingDays: number[];
  openingTimeLocal: string | null;
  closingTimeLocal: string | null;
  businessTimezone: string;
  returnsEnabled: boolean;
  exchangesEnabled: boolean;
  returnPeriodDays: number;
  exchangePeriodDays: number;
  policyCustomConditions: string | null;
  sameDayDeliveryEnabled: boolean;
  sameDayCutoffLocal: string;
  storePolicyUpdatedAt: string | null;
};

/**
 * Full store row for pre-filling the settings/availability/policies forms.
 * `stores` SELECT is public RLS ("Stores are viewable by everyone", migration
 * 001), so this is a direct read -- only the writes need an API route.
 */
export async function getSellerStoreFull(storeId: string): Promise<SellerStoreFull | null> {
  // select('*') rather than an explicit column list: postgrest-js's template-
  // literal select parser stops inferring a real row type somewhere past ~20
  // comma-separated columns and falls back to `GenericStringError`, so a long
  // explicit list here made every field below a type error. `*` sidesteps
  // that; the fields are still picked out and typed explicitly below.
  const { data, error } = await getSupabase()
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[sellerStore] full store load failed:', error.message);
    return null;
  }

  return {
    id: data.id as string,
    name: (data.name as string | null) ?? '',
    slug: (data.slug as string | null) ?? '',
    description: (data.description as string | null) ?? null,
    logoUrl: (data.logo_url as string | null) ?? null,
    bannerUrl: (data.banner_url as string | null) ?? null,
    location: (data.location as string | null) ?? null,
    contactEmail: (data.contact_email as string | null) ?? null,
    contactPhone: (data.contact_phone as string | null) ?? null,
    socialLinks: (data.social_links as Record<string, string> | null) ?? null,
    latitude: data.latitude != null ? Number(data.latitude) : null,
    longitude: data.longitude != null ? Number(data.longitude) : null,
    workingDays: Array.isArray(data.working_days) ? (data.working_days as number[]) : [],
    openingTimeLocal: (data.opening_time_local as string | null) ?? null,
    closingTimeLocal: (data.closing_time_local as string | null) ?? null,
    businessTimezone: (data.business_timezone as string | null) ?? 'Asia/Qatar',
    returnsEnabled: data.returns_enabled !== false,
    exchangesEnabled: data.exchanges_enabled !== false,
    returnPeriodDays: Number(data.return_period_days) || 3,
    exchangePeriodDays: Number(data.exchange_period_days) || 3,
    policyCustomConditions: (data.policy_custom_conditions as string | null) ?? null,
    sameDayDeliveryEnabled: data.same_day_delivery_enabled === true,
    sameDayCutoffLocal: (data.same_day_cutoff_local as string | null) ?? '14:00:00',
    storePolicyUpdatedAt: (data.store_policy_updated_at as string | null) ?? null,
  };
}

export type SellerReviewRow = {
  id: string;
  productId: string;
  productName: string;
  customerName: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  createdAt: string;
};

/**
 * Product reviews for this store, for seller moderation. Mirrors web
 * `getSellerReviews` (lib/seller.ts) query-for-query; the seller-can-view RLS
 * policy on `reviews` (migration 017) covers pending/approved/rejected, not
 * only approved, so this is a direct read like the web function it mirrors.
 */
export async function getSellerReviews(storeId: string, limit = 100): Promise<SellerReviewRow[]> {
  const supabase = getSupabase();
  const { data: products } = await supabase.from('products').select('id, name').eq('store_id', storeId);
  if (!products?.length) return [];

  const productMap = new Map(products.map((p) => [p.id as string, p.name as string]));
  const pids = [...productMap.keys()];

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, product_id, customer_id, rating, title, body, status, created_at')
    .in('product_id', pids)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[sellerReviews] load failed:', error.message);
    return [];
  }
  if (!reviews?.length) return [];

  const customerIds = [...new Set(reviews.map((r) => r.customer_id as string))];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', customerIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

  return reviews.map((r) => ({
    id: r.id as string,
    productId: r.product_id as string,
    productName: productMap.get(r.product_id as string) ?? 'Product',
    customerName: profileMap.get(r.customer_id as string) ?? null,
    rating: Number(r.rating),
    title: (r.title as string | null) ?? null,
    body: (r.body as string | null) ?? null,
    status: r.status as string,
    createdAt: r.created_at as string,
  }));
}

export async function getSellerDashboardStats(storeId: string): Promise<SellerDashboardStats> {
  const supabase = getSupabase();

  const [items, productsRes] = await Promise.all([
    supabase.from('order_items').select('order_id, total_price, products!inner(store_id)').eq('products.store_id', storeId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
  ]);

  const rows = items.data ?? [];
  const totalRevenue = rows.reduce((sum, row) => {
    const amount = Number(row.total_price);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const totalOrders = new Set(rows.map((row) => row.order_id)).size;

  return {
    totalRevenue,
    totalOrders,
    productsListed: productsRes.count ?? 0,
  };
}
