import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-role";
import { getAdminOrderById } from "@/lib/admin";

/**
 * Single admin order detail for the mobile app.
 *
 * Wraps `getAdminOrderById`, which uses the service role to join customer and
 * store rows that admin RLS does not expose. Kept separate from the list route
 * so the detail payload is only fetched when a specific order is opened.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: { orderId?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, error: "orderId is required." }, { status: 400 });
  }

  try {
    const order = await getAdminOrderById(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    console.error("[api/admin/order] lookup failed", e);
    return NextResponse.json(
      { ok: false, error: "Could not load this order. Please try again." },
      { status: 500 }
    );
  }
}
