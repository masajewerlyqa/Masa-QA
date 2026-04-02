import "server-only";

import { revalidatePath } from "next/cache";
import { requireServiceClient } from "@/lib/supabase/service";
import { appendOrderStatusEvent, deliverBuyerOrderStatusMessages } from "@/lib/orders/lifecycle";
import { restoreInventoryForOrder } from "@/lib/orders/stock-restore";
import { getProfileEmailLanguage } from "@/lib/email/profile-language";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/language";

const BATCH = 50;

/** i18n keys — resolved per buyer language at runtime. */
export function autoCancelReasonMessage(lang: Language): string {
  return t(lang, "seller.orders.autoCancelReason");
}

/**
 * Cancels orders past seller_response_deadline still in awaiting_seller.
 * Idempotent per order. Call from cron or manual trigger.
 */
export async function processOrdersPastSellerSla(): Promise<{ processed: number; errors: string[] }> {
  const service = requireServiceClient();

  const now = new Date().toISOString();
  const errors: string[] = [];
  let processed = 0;

  const { data: stale, error: qErr } = await service
    .from("orders")
    .select("id, customer_id, order_number, status, seller_response_deadline")
    .eq("status", "awaiting_seller")
    .not("seller_response_deadline", "is", null)
    .lt("seller_response_deadline", now)
    .limit(BATCH);

  if (qErr) {
    return { processed: 0, errors: [qErr.message] };
  }

  for (const row of stale ?? []) {
    const orderId = row.id as string;
    const customerId = row.customer_id as string;

    const restore = await restoreInventoryForOrder(orderId);
    if (!restore.ok) {
      errors.push(`${orderId}: ${restore.error}`);
      continue;
    }

    const lang = await getProfileEmailLanguage(customerId);
    const reason = autoCancelReasonMessage(lang);

    const { data: updated, error: upErr } = await service
      .from("orders")
      .update({
        status: "cancelled",
        platform_cancellation_reason: reason,
        cancellation_source: "system",
        auto_cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "awaiting_seller")
      .select("id, customer_id, order_number")
      .maybeSingle();

    if (upErr || !updated) {
      errors.push(`${orderId}: update failed ${upErr?.message ?? "no row"}`);
      continue;
    }

    const okEvent = await appendOrderStatusEvent({
      orderId,
      previousStatus: "awaiting_seller",
      newStatus: "cancelled",
      actorId: null,
      source: "system",
      metadata: { kind: "seller_sla_timeout" },
    });
    if (!okEvent) errors.push(`${orderId}: audit event failed`);

    const { data: cust } = await service.from("profiles").select("email, full_name").eq("id", customerId).maybeSingle();

    await deliverBuyerOrderStatusMessages({
      customerId,
      orderId,
      orderNumber: (updated as { order_number?: string | null }).order_number ?? null,
      newStatus: "cancelled",
      customerEmail: cust?.email ?? null,
      customerName: cust?.full_name ?? null,
      cancellationReason: reason,
    });

    processed += 1;
  }

  if (processed > 0) {
    revalidatePath("/seller/orders");
    revalidatePath("/account/orders");
    revalidatePath("/seller");
  }

  return { processed, errors };
}
