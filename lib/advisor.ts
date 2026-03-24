"use server";

/**
 * AI Jewelry Advisor - Recommendation Engine
 * 
 * Current implementation: Rule-based scoring using Supabase product data.
 * Future upgrade path: Replace getRecommendations() internals with LLM API calls.
 */

import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import {
  type AdvisorPreferences,
  type AdvisorResponse,
  type ProductRecommendation,
  type StoreRecommendation,
  BUDGET_RANGES,
  METALS,
  OCCASIONS,
  STYLES,
} from "@/lib/advisor-types";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  metal_type: string | null;
  gold_karat: string | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
  stock_quantity: number;
  status: string;
  stores?: { id: string; name: string; slug: string; status?: string }[] | { id: string; name: string; slug: string; status?: string } | null;
  product_images: { url: string; sort_order: number }[];
  reviews?: { rating: number | null }[];
};

function mapProductRow(row: ProductRow): Product {
  const images = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  const image = images[0] ?? PLACEHOLDER_IMAGE;
  const storeInfo = Array.isArray(row.stores) ? row.stores[0] : row.stores;
  const storeName = storeInfo?.name ?? "Store";
  const specs: Record<string, string> = {};
  if (row.metal_type) specs["Metal Type"] = row.metal_type;
  if (row.gold_karat) specs["Gold Karat"] = row.gold_karat;
  if (row.weight != null) specs["Weight"] = `${row.weight} g`;
  if (row.category) specs["Category"] = row.category;

  const approvedRatings = (row.reviews ?? [])
    .map((r) => (typeof r.rating === "number" ? r.rating : null))
    .filter((r): r is number => r != null);
  const reviewCount = approvedRatings.length;
  const averageRating =
    reviewCount > 0 ? Math.round((approvedRatings.reduce((s, r) => s + r, 0) / reviewCount) * 10) / 10 : undefined;

  return {
    id: row.id,
    slug: row.slug,
    image,
    images: images.length ? images : [image],
    title: row.name,
    brand: storeName,
    storeId: row.store_id,
    storeSlug: storeInfo?.slug,
    storeName,
    price: Number(row.price),
    originalPrice: row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    category: row.category ?? "Jewelry",
    metal: row.metal_type ?? undefined,
    description: row.description ?? undefined,
    specifications: Object.keys(specs).length ? specs : undefined,
    rating: averageRating,
    reviewCount: reviewCount || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stockQuantity: Number(row.stock_quantity) ?? 0,
    status: (row.status as "draft" | "active" | "archived" | "out_of_stock") ?? "active",
  };
}

/**
 * Calculate match score for a product based on user preferences.
 * Returns score 0-100 and list of match reasons.
 */
function scoreProduct(
  product: Product,
  preferences: AdvisorPreferences
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const budgetRange = BUDGET_RANGES.find((b) => b.value === preferences.budget);
  if (budgetRange) {
    const inBudget = product.price >= budgetRange.min && product.price <= budgetRange.max;
    const nearBudget =
      product.price >= budgetRange.min * 0.8 && product.price <= budgetRange.max * 1.2;

    if (inBudget) {
      score += 30;
      reasons.push("Within your budget range");
    } else if (nearBudget) {
      score += 15;
      reasons.push("Close to your budget");
    }
  }

  if (preferences.category !== "any") {
    if (product.category?.toLowerCase() === preferences.category.toLowerCase()) {
      score += 25;
      reasons.push(`Matches your preferred category: ${product.category}`);
    }
  } else {
    score += 10;
  }

  if (preferences.metal !== "any" && product.metal) {
    const metalPref = METALS.find((m) => m.value === preferences.metal);
    if (metalPref) {
      const productMetal = product.metal.toLowerCase();
      const matches = metalPref.keywords.some((kw) => productMetal.includes(kw.toLowerCase()));
      if (matches) {
        score += 20;
        reasons.push(`Made with ${product.metal}`);
      }
    }
  } else if (preferences.metal === "any") {
    score += 8;
  }

  const occasionConfig = getOccasionConfig(preferences.occasion);
  if (occasionConfig) {
    const titleLower = product.title.toLowerCase();
    const descLower = (product.description ?? "").toLowerCase();
    const combined = titleLower + " " + descLower;

    const keywordMatches = occasionConfig.keywords.filter((kw) =>
      combined.includes(kw.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      score += Math.min(keywordMatches.length * 5, 15);
      reasons.push(`Suitable for ${occasionConfig.label}`);
    }

    if (occasionConfig.preferredCategories.includes(product.category?.toLowerCase() ?? "")) {
      score += 5;
    }
  }

  if (product.rating && product.rating >= 4.0 && (product.reviewCount ?? 0) > 0) {
    score += 5;
    reasons.push(`Highly rated (${product.rating}★)`);
  }

  if (product.originalPrice && product.originalPrice > product.price) {
    score += 3;
    reasons.push("Currently on sale");
  }

  return { score: Math.min(score, 100), reasons };
}

type OccasionConfig = {
  label: string;
  keywords: string[];
  preferredCategories: string[];
};

function getOccasionConfig(occasion: string): OccasionConfig | null {
  const configs: Record<string, OccasionConfig> = {
    wedding: {
      label: "Wedding",
      keywords: ["wedding", "bridal", "bride", "ceremony", "eternal", "forever"],
      preferredCategories: ["ring", "necklace", "earrings"],
    },
    engagement: {
      label: "Engagement",
      keywords: ["engagement", "proposal", "solitaire", "diamond", "promise"],
      preferredCategories: ["ring"],
    },
    anniversary: {
      label: "Anniversary",
      keywords: ["anniversary", "eternal", "love", "forever", "couple"],
      preferredCategories: ["ring", "necklace", "bracelet"],
    },
    birthday: {
      label: "Birthday Gift",
      keywords: ["gift", "special", "unique", "beautiful", "elegant"],
      preferredCategories: ["necklace", "bracelet", "earrings", "pendant"],
    },
    gift: {
      label: "Special Gift",
      keywords: ["gift", "luxury", "special", "premium", "exclusive"],
      preferredCategories: ["necklace", "bracelet", "earrings", "pendant"],
    },
    daily: {
      label: "Daily Wear",
      keywords: ["everyday", "casual", "simple", "minimal", "comfortable", "light"],
      preferredCategories: ["bracelet", "earrings", "necklace", "ring"],
    },
    investment: {
      label: "Luxury Investment",
      keywords: ["luxury", "premium", "exclusive", "rare", "collector", "fine", "haute"],
      preferredCategories: ["ring", "necklace"],
    },
    celebration: {
      label: "Celebration",
      keywords: ["celebrate", "party", "special", "occasion", "elegant", "glamour"],
      preferredCategories: ["earrings", "necklace", "bracelet"],
    },
  };
  return configs[occasion] ?? null;
}

function generateSummary(
  preferences: AdvisorPreferences,
  matchCount: number
): string {
  const occasion = OCCASIONS.find((o) => o.value === preferences.occasion)?.label ?? preferences.occasion;
  const budget = BUDGET_RANGES.find((b) => b.value === preferences.budget)?.label ?? preferences.budget;
  const style = STYLES.find((s) => s.value === preferences.style)?.label ?? preferences.style;

  if (matchCount === 0) {
    return `We couldn't find exact matches for your ${occasion.toLowerCase()} jewelry preferences in the ${budget} range. Try adjusting your filters or explore our full collection.`;
  }

  return `Based on your preferences for ${occasion.toLowerCase()} jewelry with a ${style.toLowerCase()} aesthetic in the ${budget} range, we found ${matchCount} recommendation${matchCount > 1 ? "s" : ""} that may be perfect for you.`;
}

/**
 * Main recommendation function.
 * Currently rule-based; can be upgraded to use LLM for smarter matching.
 */
export async function getRecommendations(
  preferences: AdvisorPreferences
): Promise<{ response: AdvisorResponse; products: Product[] }> {
  const supabase = await createClient();

  const budgetRange = BUDGET_RANGES.find((b) => b.value === preferences.budget);
  const minPrice = budgetRange?.min ?? 0;
  const maxPrice = budgetRange?.max === Infinity ? 1000000 : (budgetRange?.max ?? 100000);

  let query = supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, stores!inner(id, name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("stores.status", "approved")
    .gte("price", minPrice * 0.7)
    .lte("price", maxPrice * 1.3)
    .order("created_at", { ascending: false })
    .limit(100);

  if (preferences.category !== "any") {
    query = query.ilike("category", preferences.category);
  }

  const { data, error } = await query;
  if (error) {
    return {
      response: {
        products: [],
        stores: [],
        summary: "An error occurred while fetching recommendations. Please try again.",
      },
      products: [],
    };
  }

  const allProducts = (data ?? []).map(mapProductRow);

  const scoredProducts = allProducts
    .map((product) => {
      const { score, reasons } = scoreProduct(product, preferences);
      return { product, score, reasons };
    })
    .filter((item) => item.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const recommendations: ProductRecommendation[] = scoredProducts.map((item) => ({
    productId: item.product.id,
    matchScore: item.score,
    matchReasons: item.reasons,
  }));

  const storeMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const { product } of scoredProducts) {
    const existing = storeMap.get(product.storeId);
    if (existing) {
      existing.count++;
    } else {
      storeMap.set(product.storeId, {
        name: product.storeName,
        slug: product.storeSlug ?? product.storeId,
        count: 1,
      });
    }
  }

  const storeRecommendations: StoreRecommendation[] = Array.from(storeMap.entries())
    .filter(([, info]) => info.count >= 2)
    .slice(0, 3)
    .map(([storeId, info]) => ({
      storeId,
      storeName: info.name,
      storeSlug: info.slug,
      matchReason: `${info.count} matching products in your preferences`,
    }));

  const summary = generateSummary(preferences, recommendations.length);

  return {
    response: {
      products: recommendations,
      stores: storeRecommendations,
      summary,
    },
    products: scoredProducts.map((item) => item.product),
  };
}

/**
 * Future hook for LLM-based recommendations.
 * Replace this function's implementation to integrate with OpenAI, Claude, etc.
 */
export async function getAIRecommendations(
  preferences: AdvisorPreferences,
  _context?: { productCatalog?: Product[] }
): Promise<AdvisorResponse> {
  const { response } = await getRecommendations(preferences);
  return response;
}
