import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { notifyBuyerOrderStatusUpdated, createNotification } from "@/lib/notifications";
import { sendOrderStatusEmailWithRetry } from "@/lib/email/transactional";
import { getProfileEmailLanguage } from "@/lib/email/profile-language";
import { t } from "@/lib/i18n";

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Append-only audit row. Returns false if insert failed (caller should avoid buyer comms).
 */
export async function appendOrderStatusEvent(params: {
  orderId: string;
  previousStatus: string | null;
  newStatus: string;
  actorId: string | null;
  source: "seller" | "admin" | "system" | "checkout";
  metadata?: Record<string, unknown> | null;
}): Promise<boolean> {
  const service = createServiceClient();
  const { error } = await service.from("order_status_events").insert({
    order_id: params.orderId,
    from_status: params.previousStatus,
    to_status: params.newStatus,
    actor_id: params.actorId,
    source: params.source,
    metadata: params.metadata ?? null,
  });
  if (error) {
    console.error("[order lifecycle] appendOrderStatusEvent failed:", error);
    return false;
  }
  return true;
}

/**
 * In-app notification + one transactional email per successful transition (after DB commit).
 */
export async function deliverBuyerOrderStatusMessages(params: {
  customerId: string;
  orderId: string;
  orderNumber?: string | null;
  newStatus: string;
  customerEmail: string | null;
  customerName: string | null;
  /** Set when seller cancels — included in email and in-app notification. */
  cancellationReason?: string | null;
}): Promise<void> {
  await notifyBuyerOrderStatusUpdated(
    params.customerId,
    params.orderId,
    params.newStatus,
    params.cancellationReason
  );

  const emailLang = await getProfileEmailLanguage(params.customerId);
  const statusKey = `order.statuses.${params.newStatus}` as const;
  const label = t(emailLang, statusKey, formatStatusLabel(params.newStatus));
  let orderNumber = params.orderNumber ?? null;
  if (orderNumber == null) {
    const service = createServiceClient();
    const { data: row } = await service.from("orders").select("order_number").eq("id", params.orderId).maybeSingle();
    orderNumber = (row as { order_number?: string | null } | null)?.order_number ?? null;
  }
  if (params.customerEmail) {
    const mailResult = await sendOrderStatusEmailWithRetry(
      params.customerEmail,
      params.orderId,
      orderNumber,
      label,
      params.customerName,
      emailLang,
      params.cancellationReason
    );
    if (!mailResult.ok) {
      console.warn("[order lifecycle] status email failed:", mailResult.error, {
        orderId: params.orderId,
        status: params.newStatus,
      });
    }
  }
}

/** Initial event when order is placed at checkout. */
export async function recordOrderPlacedEvent(params: {
  orderId: string;
  customerId: string;
}): Promise<void> {
  const ok = await appendOrderStatusEvent({
    orderId: params.orderId,
    previousStatus: null,
    newStatus: "awaiting_seller",
    actorId: params.customerId,
    source: "checkout",
    metadata: { kind: "order_created" },
  });
  if (!ok) {
    console.error("[order lifecycle] recordOrderPlacedEvent: audit insert failed", params.orderId);
  }

  try {
    await createNotification({
      userId: params.customerId,
      type: "order_placed",
      title: "Order received",
      body: "We’ve received your order and will keep you updated at every step.",
      data: { orderId: params.orderId },
    });
  } catch (e) {
    console.error("[order lifecycle] order_placed notification failed", e);
  }
}
