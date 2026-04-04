"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buyerReturnExchangeEligibility, parsePolicySnapshots } from "@/lib/store-policy";
import { notifyStoreOwnerReturnExchangeRequest } from "@/lib/notifications";

export type SubmitOrderExperienceResult = { ok: true } | { ok: false; error: string };

const MAX_COMMENT = 2000;

export async function submitOrderExperienceRating(
  orderId: string,
  rating: number,
  comment: string | null
): Promise<SubmitOrderExperienceResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    return { ok: false, error: "account.experienceRating.signInRequired" as const };
  }

  const r = Math.round(Number(rating));
  if (!Number.isFinite(r) || r < 1 || r > 5) {
    return { ok: false, error: "account.experienceRating.invalidRating" as const };
  }

  const trimmed = comment?.trim() ?? "";
  if (trimmed.length > MAX_COMMENT) {
    return { ok: false, error: "account.experienceRating.commentTooLong" as const };
  }

  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, customer_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return { ok: false, error: "account.experienceRating.orderNotFound" as const };
  }
  if (order.customer_id !== user.id) {
    return { ok: false, error: "account.experienceRating.unauthorized" as const };
  }
  if (order.status !== "delivered") {
    return { ok: false, error: "account.experienceRating.onlyDelivered" as const };
  }

  const { error } = await supabase.from("order_experience_ratings").upsert(
    {
      order_id: orderId,
      customer_id: user.id,
      rating: r,
      comment: trimmed.length > 0 ? trimmed : null,
    },
    { onConflict: "order_id" }
  );

  if (error) {
    console.error("[submitOrderExperienceRating]", error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  return { ok: true };
}

export type SubmitReturnExchangeResult = { ok: true } | { ok: false; error: string };

const MAX_RETURN_MSG = 2000;

export async function submitReturnExchangeRequest(
  orderId: string,
  storeId: string,
  kind: "return" | "exchange",
  message: string
): Promise<SubmitReturnExchangeResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    return { ok: false, error: "account.returnExchange.signInRequired" };
  }

  const trimmed = message.trim();
  if (trimmed.length > MAX_RETURN_MSG) {
    return { ok: false, error: "account.returnExchange.messageTooLong" };
  }

  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, customer_id, status, delivered_at, policy_snapshots, order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return { ok: false, error: "account.returnExchange.orderNotFound" };
  }
  if (order.customer_id !== user.id) {
    return { ok: false, error: "account.returnExchange.unauthorized" };
  }

  const { data: lines } = await supabase
    .from("order_items")
    .select("product_id, products(store_id)")
    .eq("order_id", orderId);

  const hasStore = (lines ?? []).some((row) => {
    const rel = row.products as { store_id: string } | { store_id: string }[] | null;
    const sid = Array.isArray(rel) ? rel[0]?.store_id : rel?.store_id;
    return sid === storeId;
  });
  if (!hasStore) {
    return { ok: false, error: "account.returnExchange.storeNotInOrder" };
  }

  const snapshots = parsePolicySnapshots(order.policy_snapshots);
  const snapshot = snapshots[storeId] ?? null;
  const deliveredAt =
    typeof order.delivered_at === "string" ? order.delivered_at : order.delivered_at == null ? null : String(order.delivered_at);

  const elig = buyerReturnExchangeEligibility({
    orderStatus: String(order.status),
    deliveredAt,
    snapshot,
    kind,
  });
  if (!elig.eligible) {
    return { ok: false, error: "account.returnExchange.notEligible" };
  }

  const { error: insErr } = await supabase.from("order_return_exchange_requests").insert({
    order_id: orderId,
    store_id: storeId,
    customer_id: user.id,
    kind,
    message: trimmed.length ? trimmed : null,
  });

  if (insErr) {
    console.error("[submitReturnExchangeRequest]", insErr);
    return { ok: false, error: insErr.message };
  }

  await notifyStoreOwnerReturnExchangeRequest({
    storeId,
    orderId,
    kind,
    orderNumber: (order as { order_number?: string | null }).order_number ?? null,
  });

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  return { ok: true };
}
