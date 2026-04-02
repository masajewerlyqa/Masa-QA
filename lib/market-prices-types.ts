/**
 * Client-safe TypeScript types for market prices data.
 * Import from here in `"use client"` components instead of `@/lib/market-prices`.
 */

export type PricePoint = { time: string; value: number };

export type MarketPriceSnapshot = {
  priceQAR: number;
  changePercent: number;
  updatedAt: string;
  unit?: string;
};

export type HistoryByRange = {
  "1D": PricePoint[];
  "7D": PricePoint[];
  "1M": PricePoint[];
  "6M": PricePoint[];
  "1Y": PricePoint[];
};

export type GoldMarketData = MarketPriceSnapshot & {
  price24KPerGramQAR: number;
  price22KPerGramQAR: number;
  price18KPerGramQAR: number;
  pricePerOunceQAR: number;
  weeklyChangePercent: number;
  monthlyTrend: "up" | "down" | "stable";
  qatarPremiumEstimatePercent: number;
  historyByRange: HistoryByRange;
};

export type SilverMarketData = MarketPriceSnapshot & {
  pricePerGramQAR: number;
  pricePerKgQAR: number;
  industrialDemandTrend: "rising" | "stable" | "declining";
  historyByRange: HistoryByRange;
};

export type DiamondMarketData = MarketPriceSnapshot & {
  avg1CtPriceQAR: number;
  investmentIndex: number;
  luxuryRetailTrend: "up" | "stable" | "down";
  demandIndicator: "High" | "Medium" | "Low";
  historyByRange: HistoryByRange;
};
