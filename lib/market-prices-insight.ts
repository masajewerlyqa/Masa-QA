/**
 * Client-safe market insight + seller copy (i18n only; no GoldAPI / server fetches).
 */

import { createTranslator } from "@/lib/i18n";
import type { Language } from "@/lib/language";
import type { GoldMarketData, SilverMarketData, DiamondMarketData } from "@/lib/market-prices-types";

/** AI insight derived from current gold, silver, diamond data. */
export function getMarketInsight(
  gold: GoldMarketData,
  silver: SilverMarketData,
  diamond: DiamondMarketData,
  language: Language = "en"
): {
  text: string;
  indicators: ("Safe Investment" | "High Volatility" | "Luxury Demand Rising")[];
} {
  const tr = createTranslator(language);
  const insight = (key: string, vars?: Record<string, string>) => {
    let s = tr(`tools.market.insight.${key}`);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.split(`{${k}}`).join(v);
      }
    }
    return s;
  };

  const parts: string[] = [];
  const indicators: ("Safe Investment" | "High Volatility" | "Luxury Demand Rising")[] = [];

  if (gold.weeklyChangePercent > 0.5) {
    parts.push(insight("goldUpGcc", { percent: gold.weeklyChangePercent.toFixed(1) }));
    indicators.push("Safe Investment");
  } else if (gold.weeklyChangePercent < -0.3) {
    parts.push(insight("goldSoftenedWeek", { percent: Math.abs(gold.weeklyChangePercent).toFixed(1) }));
  }

  if (gold.monthlyTrend === "up") {
    parts.push(insight("gold24k22kBullish"));
  }

  if (silver.changePercent > 0.2) {
    parts.push(insight("silverUpToday", { percent: silver.changePercent.toFixed(2) }));
  }
  if (silver.industrialDemandTrend === "rising") {
    parts.push(insight("silverIndustrialStrong"));
  }

  if (diamond.luxuryRetailTrend === "up" && diamond.demandIndicator === "High") {
    parts.push(insight("diamondLuxuryUp"));
    indicators.push("Luxury Demand Rising");
  }

  if (gold.changePercent > 0.5 || silver.changePercent > 0.5) {
    indicators.push("High Volatility");
  }

  const text = parts.length > 0 ? parts.join(" ") : insight("stableRangeFallback");

  return {
    text,
    indicators: indicators.length > 0 ? indicators : ["Safe Investment"],
  };
}

/** Seller opportunity derived from current market. */
export function getSellerOpportunity(
  gold: GoldMarketData,
  silver: SilverMarketData,
  diamond: DiamondMarketData,
  language: Language = "en"
): {
  bestMetalToSell: string;
  marginEstimatePercent: number;
  trendingCategory: string;
} {
  const tr = createTranslator(language);

  const margins = [
    {
      name: "24K Gold",
      margin: 4 + (gold.weeklyChangePercent > 0 ? 1.5 : 0) + (gold.monthlyTrend === "up" ? 1 : 0),
      score: (gold.weeklyChangePercent > 0 ? 2 : 0) + (gold.monthlyTrend === "up" ? 1 : 0),
    },
    {
      name: "22K Gold",
      margin: 6 + (gold.weeklyChangePercent > 0 ? 1 : 0),
      score: (gold.weeklyChangePercent > 0 ? 1 : 0) + 2,
    },
    {
      name: "18K Gold",
      margin: 7 + (gold.monthlyTrend === "up" ? 0.5 : 0),
      score: 1,
    },
    {
      name: "Silver",
      margin: 5 + (silver.industrialDemandTrend === "rising" ? 2 : 0),
      score: silver.industrialDemandTrend === "rising" ? 2 : 0,
    },
  ];

  const best = margins.sort((a, b) => b.score - a.score || b.margin - a.margin)[0]!;

  const metalI18nKey: Record<string, "gold24k" | "gold22k" | "gold18k" | "silver"> = {
    "24K Gold": "gold24k",
    "22K Gold": "gold22k",
    "18K Gold": "gold18k",
    Silver: "silver",
  };
  const metalKey = metalI18nKey[best.name] ?? "gold24k";

  let categoryI18nKey: "diamondRings" | "gold22kBangles" | "silverJewelry" | "classicPieces";
  if (diamond.demandIndicator === "High" && diamond.luxuryRetailTrend === "up") {
    categoryI18nKey = "diamondRings";
  } else if (gold.monthlyTrend === "up") {
    categoryI18nKey = "gold22kBangles";
  } else if (silver.industrialDemandTrend === "rising") {
    categoryI18nKey = "silverJewelry";
  } else {
    categoryI18nKey = "classicPieces";
  }

  return {
    bestMetalToSell: tr(`tools.market.sellerMetal.${metalKey}`),
    marginEstimatePercent: Math.round(best.margin * 10) / 10,
    trendingCategory: tr(`tools.market.sellerCategory.${categoryI18nKey}`),
  };
}
