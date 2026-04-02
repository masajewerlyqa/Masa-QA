"use server";

import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

/** Get notifications for the current user (RLS applies). Newest first; supports pagination. */
export async function getNotifications(
  userId: string,
  limit = 50,
  offset = 0
): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, data, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + Math.max(limit, 1) - 1);

  if (error) return [];
  return (data ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body ?? null,
    data: r.data as Record<string, unknown> | null,
    read_at: r.read_at,
    created_at: r.created_at,
  }));
}

/** Get unread count for navbar. Never throws — layouts depend on this. */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) return 0;
    return count ?? 0;
  } catch (e) {
    console.error("[notifications] getUnreadNotificationCount failed:", e);
    return 0;
  }
}

/** Mark one notification as read. */
export async function markNotificationRead(notificationId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  return !error;
}

/** Mark all notifications as read for user. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}

/** Create a single notification (service role; use from server actions only). */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, unknown> | null;
}): Promise<void> {
  const service = requireServiceClient();
  await service.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    data: params.data ?? null,
  });
}

/** Notify all admins of a new seller application. */
export async function notifyAdminsNewSellerApplication(): Promise<void> {
  const service = requireServiceClient();
  const { data: admins } = await service.from("profiles").select("id").eq("role", "admin");
  if (!admins?.length) return;
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "new_seller_application",
      title: "New seller application",
      body: "A new seller application has been submitted for review.",
    });
  }
}

/** Notify applicant that their seller application was approved. */
export async function notifyApplicantApplicationApproved(applicantUserId: string): Promise<void> {
  await createNotification({
    userId: applicantUserId,
    type: "seller_application_approved",
    title: "Application approved",
    body: "Your seller application has been approved. You can now create your store and add products.",
  });
}

/** Notify applicant that their seller application was rejected. */
export async function notifyApplicantApplicationRejected(
  applicantUserId: string,
  reviewNotes?: string | null
): Promise<void> {
  const body = reviewNotes?.trim()
    ? `Your seller application was not approved. Notes: ${reviewNotes}`
    : "Your seller application was not approved.";
  await createNotification({
    userId: applicantUserId,
    type: "seller_application_rejected",
    title: "Application rejected",
    body,
  });
}

/** Notify store owners that they have a new order (one notification per store owner). */
export async function notifySellersNewOrder(orderId: string, storeIds: string[]): Promise<void> {
  if (storeIds.length === 0) return;
  const service = requireServiceClient();
  const { data: stores } = await service.from("stores").select("id, owner_id").in("id", storeIds);
  if (!stores?.length) return;
  const seen = new Set<string>();
  for (const store of stores) {
    if (seen.has(store.owner_id)) continue;
    seen.add(store.owner_id);
    await createNotification({
      userId: store.owner_id,
      type: "new_order",
      title: "New order",
      body: "You have received a new order.",
      data: { orderId },
    });
  }
}

/** Notify seller that a new review was submitted for their product. */
export async function notifySellerNewReview(productId: string, productName: string): Promise<void> {
  const service = requireServiceClient();
  const { data: product } = await service.from("products").select("store_id").eq("id", productId).single();
  if (!product) return;
  const { data: store } = await service.from("stores").select("owner_id").eq("id", product.store_id).single();
  if (!store) return;
  await createNotification({
    userId: store.owner_id,
    type: "new_review",
    title: "New review received",
    body: `A customer has left a review for "${productName}".`,
    data: { productId },
  });
}

/** Notify all admins that a new product review is pending moderation. */
export async function notifyAdminsNewReviewPending(productId: string, productName: string): Promise<void> {
  const service = requireServiceClient();
  const { data: admins } = await service.from("profiles").select("id").eq("role", "admin");
  if (!admins?.length) return;
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "new_review_pending",
      title: "New product review pending",
      body: `A new review for "${productName}" is awaiting moderation.`,
      data: { productId },
    });
  }
}

/** Notify buyer that their order status was updated. */
export async function notifyBuyerOrderStatusUpdated(
  customerId: string,
  orderId: string,
  newStatus: string,
  cancellationReason?: string | null
): Promise<void> {
  const statusLabel = newStatus.replace(/_/g, " ");
  let body = `Your order status is now: ${statusLabel}.`;
  if (newStatus === "cancelled" && cancellationReason?.trim()) {
    body = `Your order was cancelled. Reason: ${cancellationReason.trim()}`;
  }
  await createNotification({
    userId: customerId,
    type: "order_status_updated",
    title: "Order update",
    body,
    data: { orderId, status: newStatus, cancellationReason: cancellationReason ?? undefined },
  });
}
