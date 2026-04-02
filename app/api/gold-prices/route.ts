import { NextResponse } from "next/server";
import { getCachedGoldPrices } from "@/lib/gold-scraper/storage";
import { getGoldPrice } from "@/lib/market-prices";
import { mapGoldMarketDataToQatarJson } from "@/lib/gold-prices-response";

export const runtime = "nodejs";

/** HTTP header values must be ByteString (no code points > 255). */
function headerSafeSource(value: string): string {
  const normalized = value.replace(/\u2192/g, "->").replace(/\u2190/g, "<-");
  let out = "";
  for (const ch of normalized) {
    const code = ch.codePointAt(0)!;
    out += code <= 255 ? ch : "?";
  }
  return out;
}

/**
 * Public JSON for Qatar gold (QAR).
 * - If GOLD_PRICE_USE_SCRAPER=true: memory → Supabase → fallback file (cron can refresh).
 * - Otherwise: live snapshot from getGoldPrice() (GoldAPI → QAR).
 */
export async function GET() {
  try {
    const useScraper = process.env.GOLD_PRICE_USE_SCRAPER === "true";

    if (useScraper) {
      const cached = await getCachedGoldPrices();
      if (cached) {
        const { data, stale, source } = cached;
        const headers = new Headers({
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Gold-Prices-Source": headerSafeSource(source),
          "X-Gold-Prices-Stale": stale ? "true" : "false",
        });
        return NextResponse.json(
          {
            country: data.country,
            currency: data.currency,
            gram: data.gram,
            ounce: data.ounce,
            tola: data.tola,
            karats: data.karats,
            source: data.source,
            lastUpdated: data.lastUpdated,
          },
          { headers }
        );
      }
    }

    const gold = await getGoldPrice();
    const data = mapGoldMarketDataToQatarJson(gold);
    const headers = new Headers({
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      "X-Gold-Prices-Source": headerSafeSource(data.source),
      "X-Gold-Prices-Stale": "false",
    });

    return NextResponse.json(
      {
        country: data.country,
        currency: data.currency,
        gram: data.gram,
        ounce: data.ounce,
        tola: data.tola,
        karats: data.karats,
        source: data.source,
        lastUpdated: data.lastUpdated,
      },
      { headers }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
