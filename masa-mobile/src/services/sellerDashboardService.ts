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

export async function getSellerDashboardStats(storeId: string): Promise<SellerDashboardStats> {
  const supabase = getSupabase();

  const [ordersRes, productsRes] = await Promise.all([
    supabase.from('orders').select('total_amount').eq('store_id', storeId),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = orders.reduce((sum, row) => {
    const amount = Number(row.total_amount);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return {
    totalRevenue,
    totalOrders: orders.length,
    productsListed: productsRes.count ?? 0,
  };
}
