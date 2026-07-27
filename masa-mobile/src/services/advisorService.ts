import type { AdvisorPreferences, AdvisorResponse, ProductRecommendation } from '../lib/advisor-types';
import { BUDGET_RANGES, METALS, OCCASIONS, STYLES } from '../lib/advisor-types';
import { supabase } from './supabase';

type ScoredProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  metal?: string;
  description?: string;
  imageUrl: string;
  storeName: string;
  storeId: string;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
};

function scoreProduct(
  product: ScoredProduct,
  preferences: AdvisorPreferences,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const budgetRange =
    preferences.budget === 'any' ? undefined : BUDGET_RANGES.find((b) => b.value === preferences.budget);
  if (budgetRange) {
    const maxCap = budgetRange.max === Infinity ? Number.MAX_SAFE_INTEGER : budgetRange.max;
    if (product.price >= budgetRange.min && product.price <= maxCap) {
      score += 30;
      reasons.push('Within your budget range');
    } else if (product.price >= budgetRange.min * 0.8 && product.price <= maxCap * 1.2) {
      score += 15;
      reasons.push('Close to your budget');
    }
  } else {
    score += 10;
  }

  const cats = preferences.categories ?? [];
  if (cats.length > 0) {
    if (cats.some((c) => product.category?.toLowerCase() === c.toLowerCase())) {
      score += 25;
      reasons.push(`Matches your preferred type: ${product.category}`);
    }
  } else {
    score += 10;
  }

  if (preferences.metal !== 'any' && product.metal) {
    const metalPref = METALS.find((m) => m.value === preferences.metal);
    if (metalPref?.keywords.some((kw) => product.metal!.toLowerCase().includes(kw.toLowerCase()))) {
      score += 20;
      reasons.push(`Made with ${product.metal}`);
    }
  } else if (preferences.metal === 'any') {
    score += 8;
  }

  if (product.rating && product.rating >= 4 && (product.reviewCount ?? 0) > 0) {
    score += 5;
    reasons.push(`Highly rated (${product.rating}★)`);
  }

  if (product.originalPrice && product.originalPrice > product.price) {
    score += 3;
    reasons.push('Currently on sale');
  }

  return { score: Math.min(score, 100), reasons };
}

export async function getRecommendations(
  preferences: AdvisorPreferences,
): Promise<{ response: AdvisorResponse; products: ScoredProduct[] }> {
  const budgetRange =
    preferences.budget === 'any' ? undefined : BUDGET_RANGES.find((b) => b.value === preferences.budget);
  const minPrice = budgetRange ? budgetRange.min * 0.7 : 0;
  const maxPrice = budgetRange
    ? budgetRange.max === Infinity
      ? 1_000_000
      : budgetRange.max * 1.3
    : 1_000_000;

  let query = supabase
    .from('products')
    .select(
      'id, store_id, name, description, price, compare_at_price, category, metal_type, stores!inner(id, name, status), product_images(url, sort_order)',
    )
    .eq('stores.status', 'approved')
    .gte('price', minPrice)
    .lte('price', maxPrice)
    .order('created_at', { ascending: false })
    .limit(80);

  const { data, error } = await query;
  if (error || !data) {
    return {
      response: { products: [], stores: [], summary: 'Could not load recommendations. Please try again.' },
      products: [],
    };
  }

  const allProducts: ScoredProduct[] = (data as Array<Record<string, unknown>>).map((row) => {
    const images = ((row.product_images as { url: string; sort_order: number }[]) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
    const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
    return {
      id: String(row.id),
      name: String(row.name),
      price: Number(row.price),
      category: String(row.category ?? 'Jewelry'),
      metal: row.metal_type ? String(row.metal_type) : undefined,
      description: row.description ? String(row.description) : undefined,
      imageUrl:
        images[0]?.url ??
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      storeName: (store as { name: string })?.name ?? 'Store',
      storeId: String(row.store_id),
      originalPrice:
        row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    };
  });

  const scored = allProducts
    .map((product) => {
      const { score, reasons } = scoreProduct(product, preferences);
      return { product, score, reasons };
    })
    .filter((item) => item.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const recommendations: ProductRecommendation[] = scored.map((item) => ({
    productId: item.product.id,
    matchScore: item.score,
    matchReasons: item.reasons,
  }));

  const occasion =
    preferences.occasion === 'any'
      ? 'jewelry'
      : (OCCASIONS.find((o) => o.value === preferences.occasion)?.label ?? preferences.occasion);
  const style = STYLES.find((s) => s.value === preferences.style)?.label ?? preferences.style;
  const summary =
    recommendations.length === 0
      ? `We couldn't find close matches for your ${String(occasion).toLowerCase()} preferences. Try adjusting your choices.`
      : `Based on your preferences for ${String(occasion).toLowerCase()} with a ${String(style).toLowerCase()} aesthetic, we found ${recommendations.length} recommendation(s).`;

  return {
    response: { products: recommendations, stores: [], summary },
    products: scored.map((s) => s.product),
  };
}
