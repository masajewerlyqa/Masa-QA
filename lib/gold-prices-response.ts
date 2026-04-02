import type { QatarGoldPricesJson } from "@/lib/gold-scraper/types";
import type { GoldMarketData } from "@/lib/market-prices-types";

const TOLA_GRAMS = 11.6638125;

/** Shape expected by GET /api/gold-prices, from market gold data. */
export function mapGoldMarketDataToQatarJson(g: GoldMarketData): QatarGoldPricesJson {
  const gram = g.price24KPerGramQAR;
  return {
    country: "Qatar",
    currency: "QAR",
    gram,
    ounce: g.pricePerOunceQAR,
    tola: Math.round(gram * TOLA_GRAMS * 100) / 100,
    karats: {
      "24K": gram,
      "22K": g.price22KPerGramQAR,
      "21K": Math.round(gram * (21 / 24) * 100) / 100,
      "18K": g.price18KPerGramQAR,
    },
    source: "GoldAPI.io (XAU/USD spot -> QAR)",
    lastUpdated: g.updatedAt,
  };
}
