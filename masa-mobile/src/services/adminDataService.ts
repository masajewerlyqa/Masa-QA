import { sitePostJsonAuthed } from '../api/siteApi';

/**
 * Admin list/detail data.
 *
 * These come from `/api/admin/*` rather than Supabase directly because the web
 * readers they wrap (`lib/admin.ts`) run with the service role: they aggregate
 * across every seller and join tables that admin RLS does not expose. The
 * service role must never ship in the app bundle, so the API route is the only
 * correct path -- and it re-checks the admin role server-side from the verified
 * token.
 *
 * Row shapes mirror the web types exactly (snake_case preserved) so both
 * clients read one definition.
 */

export type AdminOrderRow = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  total: number;
  status: string;
  created_at: string;
};

export type AdminProductRow = {
  id: string;
  name: string;
  store_name: string;
  price: number;
  category: string | null;
  status: string;
  created_at: string;
  units_sold: number;
  revenue_usd: number;
};

export type AdminStoreRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  location: string | null;
  product_count: number;
  created_at: string;
};

export type AdminSellerRow = {
  id: string;
  name: string;
  email: string;
  stores: number;
  products: number;
  status: 'Active' | 'Pending';
};

export type AdminReviewRow = {
  id: string;
  product_id: string;
  product_name: string;
  store_name: string | null;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type AdminPromoRow = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  store_name: string | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

export type AdminListResult<T> = { ok: true; rows: T[] } | { ok: false; error: string };

async function fetchSection<T>(
  section: 'orders' | 'products' | 'stores' | 'sellers' | 'reviews' | 'promo',
  limit?: number,
): Promise<AdminListResult<T>> {
  const result = await sitePostJsonAuthed<{ ok: boolean; rows?: T[]; error?: string }>(
    '/api/admin/overview',
    { section, ...(limit ? { limit } : {}) },
  );

  if (!result.ok) {
    console.error(`[admin] ${section} request failed:`, result.error);
    return { ok: false, error: result.error };
  }
  if (!result.data?.ok) {
    const error = result.data?.error ?? 'Could not load this data.';
    return { ok: false, error };
  }
  return { ok: true, rows: result.data.rows ?? [] };
}

export function getAdminOrders(limit = 100): Promise<AdminListResult<AdminOrderRow>> {
  return fetchSection<AdminOrderRow>('orders', limit);
}

export function getAdminProducts(limit = 100): Promise<AdminListResult<AdminProductRow>> {
  return fetchSection<AdminProductRow>('products', limit);
}

export function getAdminStores(): Promise<AdminListResult<AdminStoreRow>> {
  return fetchSection<AdminStoreRow>('stores');
}

export function getAdminSellers(): Promise<AdminListResult<AdminSellerRow>> {
  return fetchSection<AdminSellerRow>('sellers');
}

export function getAdminReviews(limit = 200): Promise<AdminListResult<AdminReviewRow>> {
  return fetchSection<AdminReviewRow>('reviews', limit);
}

export function getAdminPromoCodes(limit = 200): Promise<AdminListResult<AdminPromoRow>> {
  return fetchSection<AdminPromoRow>('promo', limit);
}
