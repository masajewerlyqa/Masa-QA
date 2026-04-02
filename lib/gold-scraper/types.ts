/**
 * Shared types for the server-side gold scraper pipeline (Qatar / QAR).
 */

export type GoldKaratKey = "24K" | "22K" | "21K" | "18K";

/** Normalized API / cache payload */
export type QatarGoldPricesJson = {
  country: "Qatar";
  currency: "QAR";
  /** 24K gold, QAR per gram */
  gram: number;
  /** 24K gold, QAR per troy ounce */
  ounce: number;
  /** 24K gold, QAR per tola (11.66g); null if unknown */
  tola: number | null;
  karats: Record<GoldKaratKey, number>;
  source: string;
  lastUpdated: string;
};

/** Internal parse result before karat math */
export type ParsedSpotQAR = {
  gram24: number;
  ounce24: number;
  tola24: number | null;
  sourceLabel: string;
};

export type ScrapeAttempt = {
  ok: boolean;
  parsed: ParsedSpotQAR | null;
  error?: string;
};
