import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { getSellerOrderById, getSellerStore } from "@/lib/seller";
import {
  markOrderPaymentCollected,
  updateOrderStatus,
  updateOrderTracking,
} from "@/app/seller/orders/actions";
import type { TrackingInfo } from "@/app/seller/orders/constants";

/**
 * Seller order reads and writes for the mobile app: order detail, status
 * transitions, payment collection, and tracking info. Every branch calls the
 * same function the web seller orders pages use -- `getSellerOrderById` for
 * "detail" (customer join, per-store item filtering, store earnings share),
 * and the same actions for writes (status-transition validation,
 * SLA/cancellation rules, inventory restore, buyer notification emails) --
 * so nothing here is reimplemented.
 */
export const dynamic = "force-dynamic";

type Body =
  | { action: "detail"; orderId: string }
  | { action: "updateStatus"; orderId: string; newStatus: string; cancellationReason?: string | null }
  | { action: "markPaid"; orderId: string }
  | { action: "updateTracking"; orderId: string; trackingInfo: TrackingInfo };

export async function POST(request: Request) {
  const auth = await requireRole(request, ["seller"]);
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const options = { actingUserId: auth.user.id };

  try {
    switch (body.action) {
      case "detail": {
        const store = await getSellerStore({ actingUser: { id: auth.user.id } });
        if (!store) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });
        const order = await getSellerOrderById(body.orderId, store.id);
        if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
        return NextResponse.json({ ok: true, order });
      }
      case "updateStatus":
        return NextResponse.json(
          await updateOrderStatus(body.orderId, body.newStatus, body.cancellationReason, options)
        );
      case "markPaid":
        return NextResponse.json(await markOrderPaymentCollected(body.orderId, options));
      case "updateTracking":
        return NextResponse.json(
          await updateOrderTracking(body.orderId, body.trackingInfo, options)
        );
      default:
        return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    console.error("[api/seller/orders] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
