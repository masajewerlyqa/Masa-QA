/**
 * GoldAPI.io client for gold (XAU) and silver (XAG) in USD per troy oz → QAR/gram via usdPerOzToQarPerGram.
 * Docs: https://www.goldapi.io — header x-access-token
 */

import { USD_TO_QAR } from "@/lib/currency";

const GOLDAPI_BASE = "https://www.goldapi.io/api";
/** Keyless spot source used when GOLDAPI_KEY is absent or the keyed call fails. */
const FREE_METAL_API_BASE = "https://api.gold-api.com/price";
const TROY_OZ_TO_GRAM = 31.1035;

export type MetalSpot = {
  pricePerOzUsd: number;
  /** null when the source does not report a daily change (the keyless fallback does not). */
  changePercent: number | null;
  timestamp: string;
};

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

function getGoldApiKey(): string | undefined {
  return process.env.GOLDAPI_KEY ?? process.env.GOLDAPI_API_KEY;
}

/** GoldAPI.io — needs a key, reports daily change. */
async function fetchFromGoldApi(metal: "XAU" | "XAG"): Promise<MetalSpot | null> {
  const key = getGoldApiKey();
  if (!key) return null;

  try {
    const res = await fetch(`${GOLDAPI_BASE}/${metal}/USD`, {
      headers: {
        "x-access-token": key,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as GoldApiResponse;
    const pricePerOzUsd = Number(data.price);
    if (!Number.isFinite(pricePerOzUsd) || pricePerOzUsd <= 0) return null;

    return {
      pricePerOzUsd,
      changePercent: typeof data.chp === "number" ? data.chp : null,
      timestamp: data.timestamp
        ? new Date(data.timestamp * 1000).toISOString()
        : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Keyless spot fallback. Gives a live price but no daily change. */
async function fetchFromFreeMetalApi(metal: "XAU" | "XAG"): Promise<MetalSpot | null> {
  try {
    const res = await fetch(`${FREE_METAL_API_BASE}/${metal}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { price?: unknown; updatedAt?: unknown };
    const pricePerOzUsd = Number(data.price);
    if (!Number.isFinite(pricePerOzUsd) || pricePerOzUsd <= 0) return null;

    return {
      pricePerOzUsd,
      changePercent: null,
      timestamp:
        typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Live spot for a metal: keyed GoldAPI first, then the keyless source. */
async function fetchMetalSpot(metal: "XAU" | "XAG"): Promise<MetalSpot | null> {
  return (await fetchFromGoldApi(metal)) ?? (await fetchFromFreeMetalApi(metal));
}

/** Fetch gold (XAU) spot in USD per troy oz. */
export async function fetchGoldFromApi(): Promise<MetalSpot | null> {
  return fetchMetalSpot("XAU");
}

/** Fetch silver (XAG) spot price in USD per troy oz. */
export async function fetchSilverFromApi(): Promise<MetalSpot | null> {
  return fetchMetalSpot("XAG");
}

/** Convert USD per troy oz to QAR per gram. */
export function usdPerOzToQarPerGram(pricePerOzUsd: number, usdToQar: number = USD_TO_QAR): number {
  const pricePerGramUsd = pricePerOzUsd / TROY_OZ_TO_GRAM;
  return Math.round(pricePerGramUsd * usdToQar * 100) / 100;
}
