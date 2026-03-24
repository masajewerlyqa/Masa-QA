/**
 * GoldAPI.io client for real-time gold (XAU) and silver (XAG) prices in USD.
 * Docs: https://www.goldapi.io
 * Header: x-access-token: YOUR_API_KEY
 * Endpoints: GET https://www.goldapi.io/api/XAU/USD, /api/XAG/USD
 */

const GOLDAPI_BASE = "https://www.goldapi.io/api";
const TROY_OZ_TO_GRAM = 31.1035;

export type GoldApiResponse = {
  price: number;
  price_gram_24k?: number;
  price_gram_22k?: number;
  price_gram_21k?: number;
  price_gram_20k?: number;
  price_gram_18k?: number;
  ch?: number;
  chp?: number;
  timestamp?: number;
  [key: string]: unknown;
};

function getApiKey(): string | undefined {
  return process.env.GOLDAPI_KEY ?? process.env.GOLDAPI_API_KEY;
}

/** Fetch gold (XAU) spot price in USD per troy oz. Returns price per oz and change %. */
export async function fetchGoldFromApi(): Promise<
  { pricePerOzUsd: number; changePercent: number; timestamp: string } | null
> {
  const key = getApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${GOLDAPI_BASE}/XAU/USD`, {
      headers: {
        "x-access-token": key,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as GoldApiResponse;
    const pricePerOzUsd = Number(data.price);
    const changePercent = typeof data.chp === "number" ? data.chp : 0;
    const timestamp = data.timestamp
      ? new Date(data.timestamp * 1000).toISOString()
      : new Date().toISOString();

    return { pricePerOzUsd, changePercent, timestamp };
  } catch {
    return null;
  }
}

/** Fetch silver (XAG) spot price in USD per troy oz. */
export async function fetchSilverFromApi(): Promise<
  { pricePerOzUsd: number; changePercent: number; timestamp: string } | null
> {
  const key = getApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${GOLDAPI_BASE}/XAG/USD`, {
      headers: {
        "x-access-token": key,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as GoldApiResponse;
    const pricePerOzUsd = Number(data.price);
    const changePercent = typeof data.chp === "number" ? data.chp : 0;
    const timestamp = data.timestamp
      ? new Date(data.timestamp * 1000).toISOString()
      : new Date().toISOString();

    return { pricePerOzUsd, changePercent, timestamp };
  } catch {
    return null;
  }
}

/** Convert USD per troy oz to QAR per gram. */
export function usdPerOzToQarPerGram(pricePerOzUsd: number, usdToQar: number = 3.64): number {
  const pricePerGramUsd = pricePerOzUsd / TROY_OZ_TO_GRAM;
  return Math.round(pricePerGramUsd * usdToQar * 100) / 100;
}
