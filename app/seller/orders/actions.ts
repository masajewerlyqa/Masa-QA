"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore, getSellerOrderById } from "@/lib/seller";
import { appendOrderStatusEvent, deliverBuyerOrderStatusMessages } from "@/lib/orders/lifecycle";
import { isAllowedSellerStatusTransition } from "@/lib/orders/order-transitions";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { OrderActionResult, TrackingInfo } from "@/app/seller/orders/constants";

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<OrderActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  const order = await getSellerOrderById(orderId, store.id);
  if (!order) return { ok: false, error: "Order not found or not for your store" };

  const previousStatus = order.status;
  if (previousStatus === newStatus) {
    return { ok: true };
  }

  if (!isAllowedSellerStatusTransition(previousStatus, newStatus)) {
    return { ok: false, error: "That status change is not allowed from the current step." };
  }

  const supabase = await createClient();
  const { data: updated } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", previousStatus)
    .select("id")
    .maybeSingle();

  if (!updated) {
    const fresh = await getSellerOrderById(orderId, store.id);
    if (fresh?.status === newStatus) return { ok: true };
    return { ok: false, error: "Order was updated elsewhere — refresh the page." };
  }

  const eventOk = await appendOrderStatusEvent({
    orderId,
    previousStatus,
    newStatus,
    actorId: user.id,
    source: "seller",
  });

  if (!eventOk) {
    const service = createServiceClient();
    await service
      .from("orders")
      .update({ status: previousStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    return { ok: false, error: "Could not record status change. Please try again." };
  }

  await deliverBuyerOrderStatusMessages({
    customerId: order.customer_id,
    orderId,
    newStatus,
    customerEmail: order.customer_email,
    customerName: order.customer_name,
  });

  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath("/seller");
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return { ok: true };
}

export async function updateOrderTracking(
  orderId: string,
  trackingInfo: TrackingInfo
): Promise<OrderActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  const order = await getSellerOrderById(orderId, store.id);
  if (!order) return { ok: false, error: "Order not found or not for your store" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingInfo.tracking_number || null,
      shipping_company: trackingInfo.shipping_company || null,
      estimated_delivery: trackingInfo.estimated_delivery || null,
    })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return { ok: true };
}
