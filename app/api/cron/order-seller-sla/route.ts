import { NextResponse } from "next/server";
import { processOrdersPastSellerSla } from "@/lib/orders/auto-cancel-sla";

/**
 * Call on a schedule (e.g. every 5–15 minutes) with header:
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await processOrdersPastSellerSla();
  return NextResponse.json({ ok: true, ...result });
}
