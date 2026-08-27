/**
 * Market prices service for gold, silver, and diamond (Qatar / GCC).
 * Gold & silver: GoldAPI.io when GOLDAPI_KEY is set; else mock. Optional scraper if GOLD_PRICE_USE_SCRAPER=true.
 * Diamond remains mock (Rapaport etc. later). All prices in QAR.
 * 24K = pure gold; 22K = 91.67% gold; 18K = 75% gold.
 */

import { fetchGoldFromApi, fetchSilverFromApi, usdPerOzToQarPerGram } from "@/lib/goldapi";
import { USD_TO_QAR } from "@/lib/currency";
import type {
  GoldMarketData,
  SilverMarketData,
  DiamondMarketData,
  HistoryByRange,
  PricePoint,
} from "./market-prices-types";

export { QAR_TO_USD } from "./market-prices-constants";
export type {
  PricePoint,
  MarketPriceSnapshot,
  HistoryByRange,
  GoldMarketData,
  SilverMarketData,
  DiamondMarketData,
} from "./market-prices-types";

function nowISO(): string {
  return new Date().toISOString();
}

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;
const weekMs = 7 * dayMs;

/** Build series backwards from current price so all ranges end at the same value. */
function generateSeriesFromEnd(
  endValue: number,
  count: number,
  trendPercentPerStep: number,
  volatility: number,
  intervalMs: number,
  now: number
): PricePoint[] {
  const result: PricePoint[] = [];
  let v = endValue;
  const seed = Math.floor(endValue) % 100;
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - (count - 1 - i) * intervalMs);
    result.push({ time: t.toISOString(), value: Math.round(v * 100) / 100 });
    const random = ((seed + i * 7) % 100) / 100 - 0.5;
    v = v / (1 + trendPercentPerStep + random * volatility);
  }
  return result.reverse();
}

/** Build all ranges for one asset. All series end at the same current price. */
function buildHistories(
  currentPrice: number,
  dailyTrendPercent: number,
  volatility: number
): { historyByRange: HistoryByRange; weeklyChangePercent: number } {
  const now = Date.now();

  const h1D = generateSeriesFromEnd(currentPrice, 24, 0.0001, 0.0022, hourMs, now);
  const h7D = generateSeriesFromEnd(currentPrice, 7, dailyTrendPercent * 0.012, Math.max(volatility, 0.006), dayMs, now);
  const first7D = h7D[0]!.value;
  const weeklyChangePercent = ((currentPrice - first7D) / first7D) * 100;

  const h1M = generateSeriesFromEnd(currentPrice, 30, dailyTrendPercent * 0.004, Math.max(volatility, 0.004), dayMs, now);
  const h6M = generateSeriesFromEnd(currentPrice, 26, dailyTrendPercent * 0.003, Math.max(volatility, 0.007), weekMs, now);
  const h1Y = generateSeriesFromEnd(currentPrice, 52, dailyTrendPercent * 0.0015, Math.max(volatility, 0.008), weekMs, now);

  return {
    historyByRange: { "1D": h1D, "7D": h7D, "1M": h1M, "6M": h6M, "1Y": h1Y },
    weeklyChangePercent,
  };
}

// Last-resort baselines (QAR) used only if BOTH the keyed GoldAPI call and the keyless
// fallback fail. These are NOT live and drift from the real market, so they are a
// degraded mode, not a normal one. (Last refreshed 2026-08-27: ~$4,586/oz gold,
// ~$68/oz silver.)
const GOLD_24K_BASE = 536.75;
const SILVER_BASE = 7.97;

// Diamonds have no public spot feed (Rapaport is licensed), so this is an editorial
// index, not a market quote. Override without a redeploy via DIAMOND_1CT_QAR.
const DIAMOND_1CT_FALLBACK_QAR = 19200;

/** Gold: 24K per gram. GoldAPI.io when GOLDAPI_KEY set; else mock. Scraper only if GOLD_PRICE_USE_SCRAPER=true. */
export async function getGoldPrice(): Promise<GoldMarketData> {
  if (process.env.GOLD_PRICE_USE_SCRAPER === "true") {
    try {
      const { getLatestGram24kQAR } = await import("@/lib/gold-scraper/storage");
      const scrapedGram = await getLatestGram24kQAR();
      if (scrapedGram != null && scrapedGram > 0) {
        return buildGoldMarketDataFrom24kGram(scrapedGram, 0, nowISO());
      }
    } catch {
      /* fall through to API / mock */
    }
  }

  const api = await fetchGoldFromApi();
  if (api == null) {
    console.warn("[getGoldPrice] all live gold sources failed — using stale fallback price.");
  }
  const price24K =
    api != null
      ? usdPerOzToQarPerGram(api.pricePerOzUsd, USD_TO_QAR)
      : GOLD_24K_BASE;
  const changePercent = api?.changePercent ?? 0;

  const { historyByRange, weeklyChangePercent } = buildHistories(price24K, 0.04, 0.008);
  const price22K = Math.round(price24K * 0.9167 * 100) / 100;
  const price18K = Math.round(price24K * 0.75 * 100) / 100;
  const pricePerOz = Math.round(price24K * 31.1035 * 100) / 100;
  const monthlyTrend: "up" | "down" | "stable" =
    weeklyChangePercent > 0.3 ? "up" : weeklyChangePercent < -0.3 ? "down" : "stable";

  return {
    priceQAR: price24K,
    changePercent,
    updatedAt: api?.timestamp ?? nowISO(),
    unit: "per gram",
    price24KPerGramQAR: price24K,
    price22KPerGramQAR: price22K,
    price18KPerGramQAR: price18K,
    pricePerOunceQAR: pricePerOz,
    weeklyChangePercent,
    monthlyTrend,
    qatarPremiumEstimatePercent: 2.8,
    historyByRange,
  };
}

/** Build gold snapshot from scraped 24K QAR/gram (histories still synthetic). */
function buildGoldMarketDataFrom24kGram(
  price24K: number,
  changePercent: number,
  updatedAt: string
): GoldMarketData {
  const { historyByRange, weeklyChangePercent } = buildHistories(price24K, 0.04, 0.008);
  const price22K = Math.round(price24K * 0.9167 * 100) / 100;
  const price18K = Math.round(price24K * 0.75 * 100) / 100;
  const pricePerOz = Math.round(price24K * 31.1035 * 100) / 100;
  const monthlyTrend: "up" | "down" | "stable" =
    weeklyChangePercent > 0.3 ? "up" : weeklyChangePercent < -0.3 ? "down" : "stable";

  return {
    priceQAR: price24K,
    changePercent,
    updatedAt,
    unit: "per gram",
    price24KPerGramQAR: price24K,
    price22KPerGramQAR: price22K,
    price18KPerGramQAR: price18K,
    pricePerOunceQAR: pricePerOz,
    weeklyChangePercent,
    monthlyTrend,
    qatarPremiumEstimatePercent: 2.8,
    historyByRange,
  };
}

/** Silver per gram. Uses GoldAPI.io when GOLDAPI_KEY is set. */
export async function getSilverPrice(): Promise<SilverMarketData> {
  const api = await fetchSilverFromApi();
  if (api == null) {
    console.warn("[getSilverPrice] all live silver sources failed — using stale fallback price.");
  }
  const pricePerGram =
    api != null
      ? usdPerOzToQarPerGram(api.pricePerOzUsd, USD_TO_QAR)
      : SILVER_BASE;
  const changePercent = api?.changePercent ?? 0;

  const { historyByRange } = buildHistories(pricePerGram, -0.02, 0.014);
  const pricePerKg = Math.round(pricePerGram * 1000 * 100) / 100;

  return {
    priceQAR: pricePerGram,
    changePercent,
    updatedAt: api?.timestamp ?? nowISO(),
    unit: "per gram",
    pricePerGramQAR: pricePerGram,
    pricePerKgQAR: pricePerKg,
    industrialDemandTrend: "rising",
    historyByRange,
  };
}

/**
 * Diamond: average 1ct in QAR. Editorial index, not a live quote — there is no public
 * diamond spot feed. Set DIAMOND_1CT_QAR to update it without a redeploy.
 */
export function getDiamondIndex(): DiamondMarketData {
  const configured = Number(process.env.DIAMOND_1CT_QAR);
  const avg1Ct =
    Number.isFinite(configured) && configured > 0 ? configured : DIAMOND_1CT_FALLBACK_QAR;
  const { historyByRange } = buildHistories(avg1Ct, 0.03, 0.006);
  const h1D = historyByRange["1D"];
  const first1D = h1D?.[0]?.value ?? avg1Ct;
  const changePercent = h1D?.length ? ((avg1Ct - first1D) / first1D) * 100 : 0.15;
  const investmentIndex = 68;
  const luxuryRetailTrend: "up" | "stable" | "down" = changePercent >= 0.1 ? "up" : changePercent <= -0.1 ? "down" : "stable";
  const demandIndicator: "High" | "Medium" | "Low" = "High";

  return {
    priceQAR: avg1Ct,
    changePercent,
    updatedAt: nowISO(),
    unit: "1ct avg",
    avg1CtPriceQAR: avg1Ct,
    investmentIndex,
    luxuryRetailTrend,
    demandIndicator,
    historyByRange,
  };
}

/** All market data in one call. See getGoldPrice / getSilverPrice for live vs mock rules. */
export async function getAllMarketData() {
  const [gold, silver, diamond] = await Promise.all([
    getGoldPrice(),
    getSilverPrice(),
    getDiamondIndex(),
  ]);
  return { gold, silver, diamond };
}

export { getMarketInsight, getSellerOpportunity } from "./market-prices-insight";
