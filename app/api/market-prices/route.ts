import { NextResponse } from "next/server";
import { getAllMarketData } from "@/lib/market-prices";

export const runtime = "nodejs";

/** Public JSON for mobile app — same payload as market-prices page server props. */
export async function GET() {
  try {
    const data = await getAllMarketData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
