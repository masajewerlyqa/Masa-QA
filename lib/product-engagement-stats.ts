import type { SupabaseClient } from "@supabase/supabase-js";

export type ProductEngagementStats = {
  unitsSold: Record<string, number>;
  revenueUsd: Record<string, number>;
  wishlistCount: Record<string, number>;
  /** Units on orders with status cancelled (line quantities). */
  unitsCancelled: Record<string, number>;
};

const EXCLUDED_ORDER_STATUSES = new Set(["cancelled", "refunded"]);

/** Zeros when service role is unavailable (e.g. missing env). */
export function zeroEngagementStats(productIds: string[]): ProductEngagementStats {
  const unitsSold: Record<string, number> = {};
  const revenueUsd: Record<string, number> = {};
  const wishlistCount: Record<string, number> = {};
  const unitsCancelled: Record<string, number> = {};
  for (const id of productIds) {
    unitsSold[id] = 0;
    revenueUsd[id] = 0;
    wishlistCount[id] = 0;
    unitsCancelled[id] = 0;
  }
  return { unitsSold, revenueUsd, wishlistCount, unitsCancelled };
}

/**
 * Aggregates units sold, revenue (USD line totals), and wishlist saves per product.
 * Use service role client when RLS would block (e.g. wishlist counts for sellers).
 */
export async function loadProductEngagementStats(
  supabase: SupabaseClient,
  productIds: string[]
): Promise<ProductEngagementStats> {
  const empty: ProductEngagementStats = {
    unitsSold: {},
    revenueUsd: {},
    wishlistCount: {},
    unitsCancelled: {},
  };
  if (productIds.length === 0) return empty;

  const unitsSold: Record<string, number> = {};
  const revenueUsd: Record<string, number> = {};
  const wishlistCount: Record<string, number> = {};
  const unitsCancelled: Record<string, number> = {};

  for (const id of productIds) {
    unitsSold[id] = 0;
    revenueUsd[id] = 0;
    wishlistCount[id] = 0;
    unitsCancelled[id] = 0;
  }

  const { data: orderRows, error: orderErr } = await supabase
    .from("order_items")
    .select("product_id, quantity, total_price, order_id")
    .in("product_id", productIds);

  if (!orderErr && orderRows?.length) {
    const orderIds = [...new Set((orderRows as { order_id: string }[]).map((r) => r.order_id))];
    const statusByOrderId = new Map<string, string>();
    const chunk = 200;
    for (let i = 0; i < orderIds.length; i += chunk) {
      const slice = orderIds.slice(i, i + chunk);
      const { data: ord } = await supabase.from("orders").select("id, status").in("id", slice);
      for (const o of ord ?? []) {
        statusByOrderId.set((o as { id: string }).id, (o as { status: string }).status);
      }
    }
    for (const row of orderRows as {
      product_id: string;
      quantity: number;
      total_price: number;
      order_id: string;
    }[]) {
      const status = statusByOrderId.get(row.order_id);
      if (!status) continue;
      const pid = row.product_id;
      const qty = Number(row.quantity);
      if (status === "cancelled") {
        unitsCancelled[pid] = (unitsCancelled[pid] ?? 0) + qty;
        continue;
      }
      if (EXCLUDED_ORDER_STATUSES.has(status)) continue;
      unitsSold[pid] = (unitsSold[pid] ?? 0) + qty;
      revenueUsd[pid] = (revenueUsd[pid] ?? 0) + Number(row.total_price);
    }
  }

  const { data: wishRows, error: wishErr } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .in("product_id", productIds);

  if (!wishErr && wishRows?.length) {
    for (const row of wishRows as { product_id: string }[]) {
      const pid = row.product_id;
      wishlistCount[pid] = (wishlistCount[pid] ?? 0) + 1;
    }
  }

  return { unitsSold, revenueUsd, wishlistCount, unitsCancelled };
}
