import { sitePostJsonAuthed } from '../api/siteApi';

/**
 * Seller mutations and detail reads that need the service role on the server
 * (plan limits, dynamic pricing, engagement stats, buyer notification emails,
 * inventory restore) route through `/api/seller/*`, which calls the exact same
 * "use server" actions the web seller dashboard uses -- see
 * getCurrentUserWithProfileOrActing in lib/auth.ts for how those actions
 * authenticate a Bearer-token caller. Nothing here reimplements that logic.
 *
 * List reads (products, orders) stay on direct RLS-scoped Supabase queries in
 * sellerDashboardService.ts, since the store-owner SELECT policies already
 * cover them.
 */

export type ActionResult = { ok: boolean; error?: string; productId?: string; code?: string };

export type ProductFormValues = {
  title: string;
  description?: string;
  category: 'Ring' | 'Necklace' | 'Bracelet' | 'Earrings' | 'Pendant' | 'Anklet' | 'Other';
  metal_type: string;
  gold_karat?: string;
  weight?: number | null;
  craftsmanship_margin?: number | null;
  stock_quantity: number;
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
};

export type SellerProductDetail = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number;
  metal_type: string | null;
  gold_karat: string | null;
  weight: number | null;
  craftsmanship_margin: number | null;
  stock_quantity: number;
  status: string;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number | null;
  discount_active: boolean;
  product_images: { id: string; url: string; alt: string | null; sort_order: number }[];
};

export type TrackingInfo = {
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
};

export type SellerOrderDetail = {
  id: string;
  order_number: string | null;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  payment_method: string | null;
  payment_status: string | null;
  payment_collected_at: string | null;
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  store_earnings?: number;
  delivery_city_area: string | null;
  delivery_building_type: string | null;
  delivery_zone_no: string | null;
  delivery_street_no: string | null;
  delivery_building_no: string | null;
  delivery_floor_no: string | null;
  delivery_apartment_no: string | null;
  delivery_landmark: string | null;
  delivery_phone: string | null;
  seller_cancellation_reason: string | null;
  seller_response_deadline: string | null;
};

export type StoreSettingsPayload = {
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  location: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  latitude: number | null;
  longitude: number | null;
};

export type StorePolicyFormPayload = {
  returns_enabled: boolean;
  exchanges_enabled: boolean;
  return_period_days: number;
  exchange_period_days: number;
  policy_custom_conditions: string;
  same_day_delivery_enabled: boolean;
  same_day_cutoff_local: string;
};

async function post<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const result = await sitePostJsonAuthed<T & { ok: boolean; error?: string }>(path, body);
  if (!result.ok) return { ok: false, error: result.error };
  if (!result.data?.ok) return { ok: false, error: result.data?.error ?? 'Something went wrong.' };
  return { ok: true, data: result.data };
}

// ---- Products ----

export async function getSellerProductDetail(
  productId: string,
): Promise<{ ok: true; product: SellerProductDetail } | { ok: false; error: string }> {
  const res = await post<{ product: SellerProductDetail }>('/api/seller/products', {
    action: 'detail',
    productId,
  });
  return res.ok ? { ok: true, product: res.data.product } : res;
}

export function createSellerProduct(
  formData: ProductFormValues,
  imageUrls: string[] = [],
): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/products', {
    action: 'create',
    formData,
    imageUrls,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function updateSellerProduct(
  productId: string,
  formData: ProductFormValues,
  imageUrls: string[] = [],
): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/products', {
    action: 'update',
    productId,
    formData,
    imageUrls,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function deleteSellerProduct(productId: string): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/products', {
    action: 'delete',
    productId,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

// ---- Orders ----

export async function getSellerOrderDetail(
  orderId: string,
): Promise<{ ok: true; order: SellerOrderDetail } | { ok: false; error: string }> {
  const res = await post<{ order: SellerOrderDetail }>('/api/seller/orders', {
    action: 'detail',
    orderId,
  });
  return res.ok ? { ok: true, order: res.data.order } : res;
}

export function updateSellerOrderStatus(
  orderId: string,
  newStatus: string,
  cancellationReason?: string | null,
): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/orders', {
    action: 'updateStatus',
    orderId,
    newStatus,
    cancellationReason,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function markSellerOrderPaid(orderId: string): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/orders', {
    action: 'markPaid',
    orderId,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function updateSellerOrderTracking(
  orderId: string,
  trackingInfo: TrackingInfo,
): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/orders', {
    action: 'updateTracking',
    orderId,
    trackingInfo,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

// ---- Settings ----

export function updateSellerStoreSettings(payload: StoreSettingsPayload): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/settings', {
    action: 'update',
    payload,
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

export function requestSellerPlanUpgrade(): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/settings', {
    action: 'requestUpgrade',
  }).then((r) => (r.ok ? (r.data as ActionResult) : { ok: false, error: r.error }));
}

// ---- Availability ----

export function saveSellerAvailability(payload: {
  working_days: number[];
  opening_time: string;
  closing_time: string;
  business_timezone: string;
}): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/availability', payload).then((r) =>
    r.ok ? (r.data as ActionResult) : { ok: false, error: r.error },
  );
}

// ---- Policies ----

export function updateSellerPolicy(payload: StorePolicyFormPayload): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/policies', payload).then((r) =>
    r.ok ? (r.data as ActionResult) : { ok: false, error: r.error },
  );
}

// ---- Reviews ----

export function updateSellerReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected',
): Promise<ActionResult> {
  return sitePostJsonAuthed<ActionResult>('/api/seller/reviews', { reviewId, status }).then((r) =>
    r.ok ? (r.data as ActionResult) : { ok: false, error: r.error },
  );
}
