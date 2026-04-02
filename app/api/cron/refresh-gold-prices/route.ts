import { NextResponse } from "next/server";
import { runGoldPriceRefreshJob } from "@/lib/gold-scraper/refresh-job";
import { goldScraperLog } from "@/lib/gold-scraper/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Vercel Cron (or manual trigger): refresh scraped gold prices.
 * Secure with CRON_SECRET: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runGoldPriceRefreshJob();
    goldScraperLog.info("Cron refresh-gold-prices finished", {
      ok: result.ok,
      changed: result.changed,
      keptPrevious: result.keptPrevious,
    });
    return NextResponse.json({
      ok: result.ok,
      changed: result.changed ?? false,
      keptPrevious: result.keptPrevious ?? false,
      gram: result.payload?.gram,
      source: result.payload?.source,
      attempts: result.attempts,
      error: result.error,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    goldScraperLog.error("Cron refresh-gold-prices crashed", { message });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
