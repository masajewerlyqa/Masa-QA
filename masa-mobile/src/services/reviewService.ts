import { supabase } from './supabase';

export type ProductReviewStats = {
  averageRating: number;
  reviewCount: number;
};

export type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  customerName: string | null;
  status?: 'pending' | 'approved' | 'rejected';
};

export async function getProductReviewStats(productId: string): Promise<ProductReviewStats> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  if (error || !data || data.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const reviewCount = data.length;
  const sum = data.reduce((s, r) => s + (r.rating ?? 0), 0);
  const averageRating = Math.round((sum / reviewCount) * 10) / 10;

  return { averageRating, reviewCount };
}

/** Approved reviews for a product, with customer display name resolved via `profiles_public` (RLS-safe). */
export async function getProductReviews(productId: string, limit = 20): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, title, body, created_at, customer_id')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const customerIds = Array.from(
    new Set(data.map((row) => row.customer_id).filter((id): id is string => Boolean(id))),
  );

  const namesById = new Map<string, string>();
  if (customerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles_public')
      .select('id, full_name')
      .in('id', customerIds);
    for (const profile of profiles ?? []) {
      if (profile.full_name) namesById.set(profile.id, profile.full_name);
    }
  }

  return data.map((row) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    customerName: namesById.get(row.customer_id) ?? null,
  }));
}

/** Whether the customer has a non-cancelled order containing this product (review eligibility). */
export async function hasCustomerPurchasedProduct(
  customerId: string,
  productId: string,
): Promise<boolean> {
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .eq('customer_id', customerId)
    .neq('status', 'cancelled')
    .limit(500);

  if (ordersError || !orders?.length) return false;

  const orderIds = orders.map((o) => o.id);
  const { data: item, error: itemError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('product_id', productId)
    .in('order_id', orderIds)
    .limit(1)
    .maybeSingle();

  if (itemError || !item) return false;
  return true;
}

/** The current customer's own review for a product (any status), so it can be shown/edited. */
export async function getCustomerReviewForProduct(
  customerId: string,
  productId: string,
): Promise<ProductReview | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, title, body, created_at, status')
    .eq('product_id', productId)
    .eq('customer_id', customerId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    rating: data.rating,
    title: data.title,
    body: data.body,
    createdAt: data.created_at,
    customerName: null,
    status: (data.status as ProductReview['status']) ?? 'pending',
  };
}

export type SubmitReviewResult = { ok: boolean; error?: string };

/** Insert a new review, or update the customer's existing one (re-queues it for moderation). */
export async function submitReview(params: {
  productId: string;
  customerId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
}): Promise<SubmitReviewResult> {
  const { productId, customerId, rating } = params;
  const title = params.title?.trim() || null;
  const body = params.body?.trim() || null;

  if (!rating || rating < 1 || rating > 5) {
    return { ok: false, error: 'invalid_rating' };
  }

  const { data: existingRow, error: selectError } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('customer_id', customerId)
    .maybeSingle();

  if (selectError) {
    return { ok: false, error: selectError.message };
  }

  if (existingRow) {
    const { error } = await supabase
      .from('reviews')
      .update({ rating, title, body, status: 'pending' })
      .eq('id', existingRow.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    customer_id: customerId,
    rating,
    title,
    body,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
