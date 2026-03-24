"use server";

import { createClient } from "@/lib/supabase/server";

export type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  customer_name: string | null;
  /** When set, review is pending moderation (show "Pending" in UI). */
  status?: "pending" | "approved" | "rejected";
};

export type ProductReviewStats = {
  averageRating: number;
  reviewCount: number;
};

/** Get aggregate rating and review count for a product (approved reviews only via RLS). */
export async function getProductReviewStats(productId: string): Promise<ProductReviewStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("status", "approved");

  if (error || !data || data.length === 0) {
    return { averageRating: 0, reviewCount: 0 };
  }

  const reviewCount = data.length;
  if (process.env.NODE_ENV === "development") {
    console.log("[getProductReviewStats]", { productId, reviewCount });
  }
  const sum = data.reduce((s, r) => s + (r.rating ?? 0), 0);
  const averageRating = Math.round((sum / reviewCount) * 10) / 10;

  return { averageRating, reviewCount };
}

/** Get approved reviews for a product with basic customer info. Limited for performance. */
export async function getProductReviews(productId: string, limit: number = 20): Promise<ProductReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, created_at, profiles!inner(full_name)")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (process.env.NODE_ENV === "development" && error) {
      console.log("[getProductReviews] error:", error.message, { productId });
    }
    return [];
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[getProductReviews]", { productId, approvedCount: data.length });
  }

  return data.map((row: any) => ({
    id: row.id,
    rating: row.rating,
    title: row.title ?? null,
    body: row.body ?? null,
    created_at: row.created_at,
    customer_name: row.profiles?.full_name ?? null,
    status: "approved" as const,
  }));
}

/** Check whether the given customer has purchased the product (any non-cancelled order). */
export async function hasCustomerPurchasedProduct(customerId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  // Get customer's non-cancelled order ids, then check if any has this product (RLS: customer sees own orders only).
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_id", customerId)
    .neq("status", "cancelled")
    .limit(500);

  if (ordersError || !orders?.length) return false;

  const orderIds = orders.map((o) => o.id);
  const { data: item, error: itemError } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("product_id", productId)
    .in("order_id", orderIds)
    .limit(1)
    .maybeSingle();

  if (itemError || !item) return false;
  return true;
}

/** Get an existing review for a product by the current customer (any status). */
export async function getCustomerReviewForProduct(
  customerId: string,
  productId: string
): Promise<ProductReview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, created_at, status, profiles(full_name)")
    .eq("product_id", productId)
    .eq("customer_id", customerId)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (process.env.NODE_ENV === "development" && error) {
      console.log("[getCustomerReviewForProduct] error or no data:", error?.message, { customerId, productId });
    }
    return null;
  }
  const row = data as any;

  if (process.env.NODE_ENV === "development") {
    console.log("[getCustomerReviewForProduct] found", { reviewId: row.id, status: row.status });
  }

  return {
    id: row.id,
    rating: row.rating,
    title: row.title ?? null,
    body: row.body ?? null,
    created_at: row.created_at,
    customer_name: row.profiles?.full_name ?? null,
    status: row.status ?? "pending",
  };
}

