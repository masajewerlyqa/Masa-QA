import { getSupabase } from '../api/client';

/**
 * Admin dashboard reads, mirroring web `lib/admin.ts`.
 *
 * These run as the signed-in user, exactly like the web dashboard does
 * (`getAdminMetrics` uses the user-scoped server client, not the service role).
 * Admin visibility comes entirely from RLS:
 *   orders / order_items / products  → migration 013
 *   profiles / seller_applications   → migration 001
 *   stores                           → public SELECT
 * A non-admin calling these simply sees their own rows, so there is no
 * client-side role check to bypass -- the database is the boundary.
 *
 * Writes are deliberately NOT here. Admin mutations (approving an application,
 * changing order state) have service-role side effects -- creating the store,
 * promoting the profile, sending email -- that live in the web app's server
 * actions. Mobile calls API routes for those so both clients run one
 * implementation.
 */

export type AdminMetrics = {
  totalUsers: number;
  totalSellers: number;
  pendingSellerApplications: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  totalSellerEarnings: number;
};

export type AdminRecentOrder = {
  id: string;
  orderNumber: string | null;
  status: string;
  total: number;
  createdAt: string;
};

export type AdminRecentApplication = {
  id: string;
  businessName: string;
  status: string;
  createdAt: string;
};

export type AdminMetricsResult =
  | { ok: true; metrics: AdminMetrics }
  | { ok: false; error: string };

function sumColumn(rows: unknown[] | null, column: string): number {
  if (!rows) return 0;
  const total = (rows as Record<string, unknown>[]).reduce(
    (sum, row) => sum + Number(row[column] ?? 0),
    0,
  );
  return Math.round(total * 100) / 100;
}

export async function getAdminMetrics(): Promise<AdminMetricsResult> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in to continue.' };

  const [
    usersRes,
    sellersRes,
    pendingAppsRes,
    storesRes,
    productsRes,
    ordersRes,
    revenueRes,
    commissionRes,
    sellerEarningsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seller'),
    supabase
      .from('seller_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('stores').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total').neq('status', 'cancelled'),
    supabase.from('orders').select('commission_amount').neq('status', 'cancelled'),
    supabase.from('orders').select('seller_earnings').neq('status', 'cancelled'),
  ]);

  // Surfaced rather than swallowed: a failed load must not render as a
  // dashboard full of zeroes, which reads as "the platform has no data".
  const failed = [usersRes, sellersRes, pendingAppsRes, storesRes, productsRes, ordersRes].find(
    (r) => r.error,
  );
  if (failed?.error) {
    console.error('[admin] metrics load failed:', failed.error.message);
    return { ok: false, error: 'Could not load dashboard metrics. Please try again.' };
  }

  return {
    ok: true,
    metrics: {
      totalUsers: usersRes.count ?? 0,
      totalSellers: sellersRes.count ?? 0,
      pendingSellerApplications: pendingAppsRes.count ?? 0,
      totalStores: storesRes.count ?? 0,
      totalProducts: productsRes.count ?? 0,
      totalOrders: ordersRes.count ?? 0,
      totalRevenue: sumColumn(revenueRes.data, 'total'),
      totalCommissions: sumColumn(commissionRes.data, 'commission_amount'),
      totalSellerEarnings: sumColumn(sellerEarningsRes.data, 'seller_earnings'),
    },
  };
}

/** Mirrors web `getRecentOrders`. */
export async function getAdminRecentOrders(limit = 10): Promise<AdminRecentOrder[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[admin] recent orders failed:', error.message);
    return [];
  }

  return (data ?? []).map((o) => ({
    id: o.id as string,
    orderNumber: (o.order_number as string | null) ?? null,
    status: o.status as string,
    total: Number(o.total),
    createdAt: o.created_at as string,
  }));
}

/** Mirrors web `getRecentSellerApplications`. */
export async function getAdminRecentApplications(limit = 10): Promise<AdminRecentApplication[]> {
  const { data, error } = await getSupabase()
    .from('seller_applications')
    .select('id, business_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[admin] recent applications failed:', error.message);
    return [];
  }

  return (data ?? []).map((a) => ({
    id: a.id as string,
    businessName: (a.business_name as string | null) ?? '—',
    status: a.status as string,
    createdAt: a.created_at as string,
  }));
}
