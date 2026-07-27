import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/request-user";
import { verifyCheckoutSessionForClient } from "@/lib/stripe/session-verification";

export const runtime = "nodejs";

/**
 * GET /api/stripe/verify-session?session_id=cs_...
 * Read-only: confirms webhook created the order. Never creates orders (prevents fake success pages).
 */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session_id." }, { status: 400 });
  }

  const user = await getUserFromRequest(req);
  const result = await verifyCheckoutSessionForClient(sessionId, user?.id ?? null);

  return NextResponse.json({
    ok: true,
    status: result.status,
    orderId: result.orderId,
    orderNumber: result.orderNumber,
  });
}
