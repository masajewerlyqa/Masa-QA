export type PricingMarketSnapshot = {
  gold24kPerGramQar?: number | null;
  silverPerGramQar?: number | null;
  diamondAvg1CtQar?: number | null;
};

export type PricingMaterial = "gold" | "silver" | "diamond" | "other";

export type DynamicPricingInput = {
  metalType?: string | null;
  goldKarat?: string | null;
  weight?: number | null;
  craftsmanshipMargin?: number | null;
  storedPrice?: number | null;
};

export type DynamicPricingResult = {
  finalPriceUsd: number;
  baseMarketPriceUsd: number;
  craftsmanshipMarginUsd: number;
  material: PricingMaterial;
  karatPurity: number | null;
  marketLinked: boolean;
  usedFallback: boolean;
  reason:
    | "market_based"
    | "missing_market_data"
    | "missing_required_product_data"
    | "unsupported_material";
};

function roundUsd(value: number): number {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function toFiniteNumber(value: unknown): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeMaterial(metalType?: string | null): PricingMaterial {
  const m = String(metalType ?? "").trim().toLowerCase();
  if (!m) return "other";
  if (["gold", "ذهب"].includes(m)) return "gold";
  if (["silver", "فضة"].includes(m)) return "silver";
  if (["diamond", "diamonds", "الماس", "ألماس"].includes(m)) return "diamond";
  return "other";
}

function parseGoldPurity(karat?: string | null): number | null {
  const raw = String(karat ?? "").trim().toLowerCase();
  if (!raw) return null;
  const match = raw.match(/(\d{1,2}(?:\.\d+)?)/);
  if (!match) return null;
  const k = Number(match[1]);
  if (!Number.isFinite(k) || k <= 0) return null;
  if (k > 24) return null;
  return Math.min(1, Math.max(0, k / 24));
}

function resolveDiamondCarats(weight: number): number {
  if (weight <= 5) return weight;
  return weight * 5;
}

export function computeDynamicMarketPriceUsd(
  input: DynamicPricingInput,
  market: PricingMarketSnapshot,
  qarToUsdRate: number
): DynamicPricingResult {
  const stored = roundUsd(toFiniteNumber(input.storedPrice) ?? 0);
  const craftsmanshipMarginUsd = roundUsd(toFiniteNumber(input.craftsmanshipMargin) ?? 0);
  const weight = toFiniteNumber(input.weight);
  const material = normalizeMaterial(input.metalType);
  const karatPurity = material === "gold" ? parseGoldPurity(input.goldKarat) : null;

  if (material === "other") {
    return {
      finalPriceUsd: stored,
      baseMarketPriceUsd: stored,
      craftsmanshipMarginUsd,
      material,
      karatPurity,
      marketLinked: false,
      usedFallback: true,
      reason: "unsupported_material",
    };
  }

  if (weight == null || weight <= 0 || (material === "gold" && (karatPurity == null || karatPurity <= 0))) {
    return {
      finalPriceUsd: stored,
      baseMarketPriceUsd: stored,
      craftsmanshipMarginUsd,
      material,
      karatPurity,
      marketLinked: false,
      usedFallback: true,
      reason: "missing_required_product_data",
    };
  }

  let baseQar: number | null = null;
  if (material === "gold") {
    const price24k = toFiniteNumber(market.gold24kPerGramQar);
    if (price24k != null) baseQar = price24k * weight * (karatPurity ?? 1);
  } else if (material === "silver") {
    const silver = toFiniteNumber(market.silverPerGramQar);
    if (silver != null) baseQar = silver * weight;
  } else if (material === "diamond") {
    const avg1ct = toFiniteNumber(market.diamondAvg1CtQar);
    if (avg1ct != null) {
      const carats = resolveDiamondCarats(weight);
      baseQar = avg1ct * carats;
    }
  }

  if (baseQar == null || !Number.isFinite(baseQar) || baseQar < 0) {
    return {
      finalPriceUsd: stored,
      baseMarketPriceUsd: stored,
      craftsmanshipMarginUsd,
      material,
      karatPurity,
      marketLinked: false,
      usedFallback: true,
      reason: "missing_market_data",
    };
  }

  const baseMarketPriceUsd = roundUsd(baseQar * qarToUsdRate);
  return {
    finalPriceUsd: roundUsd(baseMarketPriceUsd + craftsmanshipMarginUsd),
    baseMarketPriceUsd,
    craftsmanshipMarginUsd,
    material,
    karatPurity,
    marketLinked: true,
    usedFallback: false,
    reason: "market_based",
  };
}
