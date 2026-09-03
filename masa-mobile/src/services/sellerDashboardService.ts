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
