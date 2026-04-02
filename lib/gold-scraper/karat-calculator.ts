import type { GoldKaratKey, QatarGoldPricesJson } from "./types";

/** Fine-gold ratios (industry standard). User-specified multipliers. */
const KARAT_RATIOS: Record<GoldKaratKey, number> = {
  "24K": 1,
  "22K": 0.916,
  "21K": 0.875,
  "18K": 0.75,
};

/**
 * Build karat gram prices from 24K spot (QAR/gram).
 */
export function buildKaratPrices(gram24: number): Record<GoldKaratKey, number> {
  const out = {} as Record<GoldKaratKey, number>;
  (Object.keys(KARAT_RATIOS) as GoldKaratKey[]).forEach((k) => {
    const v = gram24 * KARAT_RATIOS[k];
    out[k] = Math.round(v * 100) / 100;
  });
  return out;
}

export function buildQatarPayload(
  gram24: number,
  ounce24: number,
  tola24: number | null,
  source: string
): QatarGoldPricesJson {
  const now = new Date().toISOString();
  return {
    country: "Qatar",
    currency: "QAR",
    gram: Math.round(gram24 * 100) / 100,
    ounce: Math.round(ounce24 * 100) / 100,
    tola: tola24 != null ? Math.round(tola24 * 100) / 100 : null,
    karats: buildKaratPrices(gram24),
    source,
    lastUpdated: now,
  };
}
