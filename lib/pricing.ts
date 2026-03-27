import { QAR_TO_USD, getAllMarketData } from "@/lib/market-prices";
import {
  computeDynamicMarketPriceUsd,
  type DynamicPricingInput,
  type DynamicPricingResult,
  type PricingMarketSnapshot,
} from "@/lib/pricing-engine";

export async function getPricingMarketSnapshot(): Promise<PricingMarketSnapshot | null> {
  try {
    const market = await getAllMarketData();
    return {
      gold24kPerGramQar: market.gold.price24KPerGramQAR,
      silverPerGramQar: market.silver.pricePerGramQAR,
      diamondAvg1CtQar: market.diamond.avg1CtPriceQAR,
    };
  } catch {
    return null;
  }
}

export async function computeDynamicProductPrice(
  input: DynamicPricingInput,
  marketSnapshot?: PricingMarketSnapshot | null
): Promise<DynamicPricingResult> {
  const snapshot = marketSnapshot ?? (await getPricingMarketSnapshot()) ?? {};
  return computeDynamicMarketPriceUsd(input, snapshot, QAR_TO_USD);
}
