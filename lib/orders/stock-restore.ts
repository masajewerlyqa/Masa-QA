import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

/** Restore product stock when an order is cancelled (seller reject or SLA). */
export async function restoreInventoryForOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const service = createServiceClient();
  if (!service) return { ok: false, error: "Service unavailable" };

  const { data: items, error: fetchErr } = await service
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!items?.length) return { ok: true };

  const payload = items.map((r) => ({ product_id: r.product_id, quantity: r.quantity }));
  const { error } = await service.rpc("restore_order_stock", { items: payload });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
