import { siteFetchJson } from '../api/siteApi';
import {
  buildFallbackMarketData,
  buildMarketDataFromGoldApi,
  isValidMarketPayload,
} from '../lib/market-prices/buildMarketData';
import type { AllMarketData } from '../types/marketPrices';

export type MarketPricesLoadResult =
  | { ok: true; data: AllMarketData; source: 'api' | 'gold-prices' | 'fallback' }
  | { ok: false; error: string };

type GoldPricesJson = {
  gram?: number;
  karats?: Record<string, number>;
  lastUpdated?: string;
  ok?: boolean;
  error?: string;
};

/**
 * Loads market prices using the same backend as web:
 * 1. GET /api/market-prices (full gold/silver/diamond)
 * 2. GET /api/gold-prices (build client-side)
 * 3. Static fallback (last resort, still shows UI)
 */
export async function fetchMarketPrices(options?: {
  allowFallback?: boolean;
}): Promise<MarketPricesLoadResult> {
  const allowFallback = options?.allowFallback ?? true;
  const errors: string[] = [];

  const full = await siteFetchJson<AllMarketData>('/api/market-prices', {
    timeoutMs: 20_000,
  });

  if (full.ok && isValidMarketPayload(full.data)) {
    return { ok: true, data: full.data, source: 'api' };
  }
  if (!full.ok) errors.push(full.error);

  const goldRes = await siteFetchJson<GoldPricesJson>('/api/gold-prices', {
    timeoutMs: 20_000,
  });

  if (goldRes.ok && goldRes.data && goldRes.data.ok !== false) {
    return {
      ok: true,
      data: buildMarketDataFromGoldApi(goldRes.data),
      source: 'gold-prices',
    };
  }
  if (!goldRes.ok) errors.push(goldRes.error);

  if (allowFallback) {
    return { ok: true, data: buildFallbackMarketData(), source: 'fallback' };
  }

  return {
    ok: false,
    error: errors.join(' ') || 'Could not load market prices.',
  };
}
