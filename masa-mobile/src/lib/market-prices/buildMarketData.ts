/**
 * Client-side market data builder (mirrors web `lib/market-prices.ts` when site API is unavailable).
 */

import type {
  AllMarketData,
  DiamondMarketData,
  GoldMarketData,
  HistoryByRange,
  PricePoint,
  SilverMarketData,
} from '../../types/marketPrices';

const GOLD_24K_BASE = 272.5;
const SILVER_BASE = 3.88;
const DIAMOND_1CT_BASE = 19200;

function nowISO(): string {
  return new Date().toISOString();
}

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;
const weekMs = 7 * dayMs;

function generateSeriesFromEnd(
  endValue: number,
  count: number,
  trendPercentPerStep: number,
  volatility: number,
  intervalMs: number,
  now: number,
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

function buildHistories(
  currentPrice: number,
  dailyTrendPercent: number,
  volatility: number,
): { historyByRange: HistoryByRange; weeklyChangePercent: number } {
  const now = Date.now();
  const h1D = generateSeriesFromEnd(currentPrice, 24, 0.0001, 0.0022, hourMs, now);
  const h7D = generateSeriesFromEnd(
    currentPrice,
    7,
    dailyTrendPercent * 0.012,
    Math.max(volatility, 0.006),
    dayMs,
    now,
  );
  const first7D = h7D[0]!.value;
  const weeklyChangePercent = ((currentPrice - first7D) / first7D) * 100;
  const h1M = generateSeriesFromEnd(
    currentPrice,
    30,
    dailyTrendPercent * 0.004,
    Math.max(volatility, 0.004),
    dayMs,
    now,
  );
  const h6M = generateSeriesFromEnd(
    currentPrice,
    26,
    dailyTrendPercent * 0.003,
    Math.max(volatility, 0.007),
    weekMs,
    now,
  );
  const h1Y = generateSeriesFromEnd(
    currentPrice,
    52,
    dailyTrendPercent * 0.0015,
    Math.max(volatility, 0.008),
    weekMs,
    now,
  );
  return {
    historyByRange: { '1D': h1D, '7D': h7D, '1M': h1M, '6M': h6M, '1Y': h1Y },
    weeklyChangePercent,
  };
}

function buildGoldFrom24kGram(
  price24K: number,
  changePercent: number,
  updatedAt: string,
): GoldMarketData {
  const { historyByRange, weeklyChangePercent } = buildHistories(price24K, 0.04, 0.008);
  const price22K = Math.round(price24K * 0.9167 * 100) / 100;
  const price18K = Math.round(price24K * 0.75 * 100) / 100;
  const pricePerOz = Math.round(price24K * 31.1035 * 100) / 100;
  const monthlyTrend: 'up' | 'down' | 'stable' =
    weeklyChangePercent > 0.3 ? 'up' : weeklyChangePercent < -0.3 ? 'down' : 'stable';

  return {
    priceQAR: price24K,
    changePercent,
    updatedAt,
    unit: 'per gram',
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

function getSilverPrice(): SilverMarketData {
  const pricePerGram = SILVER_BASE;
  const changePercent = -0.18;
  const { historyByRange } = buildHistories(pricePerGram, -0.02, 0.014);
  const pricePerKg = Math.round(pricePerGram * 1000 * 100) / 100;

  return {
    priceQAR: pricePerGram,
    changePercent,
    updatedAt: nowISO(),
    unit: 'per gram',
    pricePerGramQAR: pricePerGram,
    pricePerKgQAR: pricePerKg,
    industrialDemandTrend: 'rising',
    historyByRange,
  };
}

function getDiamondIndex(): DiamondMarketData {
  const { historyByRange } = buildHistories(DIAMOND_1CT_BASE, 0.03, 0.006);
  const h1D = historyByRange['1D'];
  const avg1Ct = DIAMOND_1CT_BASE;
  const first1D = h1D?.[0]?.value ?? avg1Ct;
  const changePercent = h1D?.length ? ((avg1Ct - first1D) / first1D) * 100 : 0.15;

  return {
    priceQAR: avg1Ct,
    changePercent,
    updatedAt: nowISO(),
    unit: '1ct avg',
    avg1CtPriceQAR: avg1Ct,
    investmentIndex: 68,
    luxuryRetailTrend: changePercent >= 0.1 ? 'up' : changePercent <= -0.1 ? 'down' : 'stable',
    demandIndicator: 'High',
    historyByRange,
  };
}

type QatarGoldJson = {
  gram?: number;
  karats?: Record<string, number>;
  lastUpdated?: string;
};

/** Build full market payload from public `/api/gold-prices` response. */
export function buildMarketDataFromGoldApi(json: QatarGoldJson): AllMarketData {
  const gram24 =
    json.karats?.['24K'] ?? json.gram ?? json.karats?.['24'] ?? GOLD_24K_BASE;
  const updatedAt = json.lastUpdated ?? nowISO();
  const gold = buildGoldFrom24kGram(gram24, 0.42, updatedAt);
  return {
    gold,
    silver: getSilverPrice(),
    diamond: getDiamondIndex(),
  };
}

/** Offline fallback when network and site API both fail. */
export function buildFallbackMarketData(): AllMarketData {
  const gold = buildGoldFrom24kGram(GOLD_24K_BASE, 0.42, nowISO());
  return {
    gold,
    silver: getSilverPrice(),
    diamond: getDiamondIndex(),
  };
}

function isValidMarketPayload(data: unknown): data is AllMarketData {
  if (!data || typeof data !== 'object') return false;
  const d = data as AllMarketData;
  return Boolean(d.gold?.price24KPerGramQAR && d.silver?.pricePerGramQAR && d.diamond?.avg1CtPriceQAR);
}

export { isValidMarketPayload };
