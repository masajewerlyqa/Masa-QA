"use server";

import { createClient } from "@/lib/supabase/server";
import type { Product, Store } from "@/lib/types";
import { isDiscountValid, computeDiscountedPrice, type DiscountType } from "@/lib/discount";
import { getServerLanguage } from "@/lib/language-server";
import type { Language } from "@/lib/language";
import { localizeProductCategory, localizeProductMetal, localizeProductText } from "@/lib/i18n/product-localization";

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
  discount_type: string | null;
  discount_value: number | null;
  discount_start_at: string | null;
  discount_end_at: string | null;
  discount_active: boolean | null;
  stores?: { name: string; slug: string; status?: string }[] | { name: string; slug: string; status?: string } | null;
  store?: { name: string; slug: string; status?: string }[] | { name: string; slug: string; status?: string } | null;
  product_images: { url: string; sort_order: number }[];
  reviews?: { rating: number | null }[];
};

type StoreRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export type MarketplaceBrand = {
  id: string;
  name: string;
  slug: string;
  /** Number of products with an active valid discount (for "Special Offers" badge). */
  discountedCount?: number;
};

export type MarketplaceFilters = {
  categories: string[];
  metals: string[];
  karats: string[];
  brands: MarketplaceBrand[];
  minPrice: number;
  maxPrice: number;
};

export type MarketplaceSortOption =
  | "default"
  | "highest_discount"
  | "lowest_price"
  | "ending_soon";

export type MarketplaceFilterInput = {
  search?: string;
  category?: string;
  brands?: string[];
  metals?: string[];
  karats?: string[];
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  /** When true, only return products with an active valid discount. */
  onSale?: boolean;
  sort?: MarketplaceSortOption;
};

function mapProductRow(row: ProductRow, language: Language): Product {
  const images = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => i.url);
  const image = images[0] ?? PLACEHOLDER_IMAGE;
  const storesValue = Array.isArray(row.stores) ? row.stores[0] : row.stores;
  const storeValue = Array.isArray(row.store) ? row.store[0] : row.store;
  const storeInfo = storesValue ?? storeValue;
  const storeName = storeInfo?.name ?? "Store";
  const storeStatus = storeInfo?.status;
  const specs: Record<string, string> = {};
  if (row.metal_type) {
    specs[language === "ar" ? "نوع المعدن" : "Metal Type"] = localizeProductMetal(row.metal_type, language);
  }
  if (row.gold_karat) specs[language === "ar" ? "عيار الذهب" : "Gold Karat"] = row.gold_karat;
  if (row.weight != null) specs[language === "ar" ? "الوزن" : "Weight"] = `${row.weight} g`;
  if (row.category) {
    specs[language === "ar" ? "الفئة" : "Category"] = localizeProductCategory(row.category, language);
  }

  const approvedRatings = (row.reviews ?? [])
    .map((r) => (typeof r.rating === "number" ? r.rating : null))
    .filter((r): r is number => r != null);
  const reviewCount = approvedRatings.length;
  const averageRating =
    reviewCount > 0 ? Math.round((approvedRatings.reduce((s, r) => s + r, 0) / reviewCount) * 10) / 10 : undefined;

  const basePrice = Number(row.price);
  const hasValidDiscount =
    row.discount_active === true &&
    row.discount_type != null &&
    row.discount_value != null &&
    isDiscountValid(
      true,
      row.discount_start_at,
      row.discount_end_at
    );
  let price: number;
  let originalPrice: number | undefined;
  if (hasValidDiscount && row.discount_type && row.discount_value != null) {
    price = computeDiscountedPrice(basePrice, row.discount_type as DiscountType, Number(row.discount_value));
    originalPrice = basePrice;
  } else {
    price = basePrice;
    originalPrice = row.compare_at_price != null ? Number(row.compare_at_price) : undefined;
  }

  return {
    id: row.id,
    slug: row.slug,
    image,
    images: images.length ? images : [image],
    title: localizeProductText(row.name, language),
    brand: storeName,
    storeId: row.store_id,
    storeSlug: storeInfo?.slug,
    storeName,
    price,
    originalPrice,
    discountEndAt: hasValidDiscount && row.discount_end_at ? row.discount_end_at : undefined,
    category: localizeProductCategory(row.category ?? "Jewelry", language),
    metal: row.metal_type ? localizeProductMetal(row.metal_type, language) : undefined,
    isVerifiedStore: storeStatus === "approved",
    description: row.description ? localizeProductText(row.description, language) : undefined,
    specifications: Object.keys(specs).length ? specs : undefined,
    rating: averageRating,
    reviewCount: reviewCount || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stockQuantity: Number(row.stock_quantity) ?? 0,
    status: (row.status as "draft" | "active" | "archived" | "out_of_stock") ?? "active",
  };
}

/** Public products: RLS already restricts to status active/out_of_stock and deleted_at IS NULL. We filter to active stores only. */
export async function getPublicProducts(options?: { category?: string; limit?: number }): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("stores.status", "approved")
    .order("created_at", { ascending: false });

  if (options?.category && options.category !== "all") {
    query = query.ilike("category", options.category);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []).map((row) => mapProductRow(row, language));
}

/** Public products for marketplace with search and structured filters. */
export async function getPublicProductsForMarketplace(
  filters: MarketplaceFilterInput
): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(id, name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("stores.status", "approved");

  if (filters.category && filters.category !== "all") {
    query = query.ilike("category", filters.category);
  }

  if (filters.brands && filters.brands.length > 0) {
    query = query.in("store_id", filters.brands);
  }

  if (filters.metals && filters.metals.length > 0) {
    query = query.in("metal_type", filters.metals);
  }

  if (filters.karats && filters.karats.length > 0) {
    query = query.in("gold_karat", filters.karats);
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("price", filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `name.ilike.${term},description.ilike.${term},stores.name.ilike.${term}`
    );
  }

  if (filters.onSale) {
    query = query.eq("discount_active", true);
  }

  query = query.order("created_at", { ascending: false });
  const limit = Math.min(Math.max(filters.limit ?? 24, 1), 100);
  const offset = filters.offset ?? 0;
  const rangeSize = filters.onSale ? Math.min((offset + limit) * 2, 200) : limit;
  const rangeStart = filters.onSale ? 0 : offset;
  query = query.range(rangeStart, rangeStart + rangeSize - 1);

  const { data, error } = await query;
  if (error) return [];
  let rows = data ?? [];
  if (filters.onSale) {
    rows = rows.filter(
      (row: ProductRow) =>
        row.discount_active === true &&
        row.discount_type != null &&
        row.discount_value != null &&
        isDiscountValid(
          true,
          row.discount_start_at,
          row.discount_end_at
        )
    );
    rows = rows.slice(offset, offset + limit);
  }
  let products = rows.map((r: ProductRow) => mapProductRow(r, language));
  const sortOption = filters.sort ?? "default";
  if (sortOption === "highest_discount") {
    products = products
      .filter((p) => p.originalPrice != null && p.originalPrice > p.price && p.originalPrice > 0)
      .sort(
        (a, b) =>
          (b.originalPrice! - b.price) / b.originalPrice! -
          (a.originalPrice! - a.price) / a.originalPrice!
      );
  } else if (sortOption === "lowest_price") {
    products.sort((a, b) => a.price - b.price);
  } else if (sortOption === "ending_soon") {
    products.sort((a, b) => {
      const aEnd = a.discountEndAt ? new Date(a.discountEndAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bEnd = b.discountEndAt ? new Date(b.discountEndAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aEnd - bEnd;
    });
  }
  return products;
}

/** Single public product by id; null if not found or not visible (draft, deleted, or store inactive). */
export async function getPublicProductById(id: string): Promise<Product | null> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("id", id)
    .eq("stores.status", "approved")
    .single();

  if (error || !data) return null;
  return mapProductRow(data as ProductRow, language);
}

/** Related products: same store or same category, excluding current product. Used on product detail for "You may also like". */
export async function getRelatedProducts(
  productId: string,
  storeId: string,
  category: string,
  limit: number = 4
): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .neq("id", productId)
    .eq("stores.status", "approved")
    .or(`store_id.eq.${storeId},category.ilike.${category}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map((row) => mapProductRow(row, language));
}

/** Public products for a store (same visibility rules). */
export async function getPublicProductsByStore(storeId: string): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("store_id", storeId)
    .eq("stores.status", "approved")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => mapProductRow(row, language));
}

/** Featured section: first N public products. */
export async function getFeaturedPublicProducts(limit: number = 4): Promise<Product[]> {
  return getPublicProducts({ limit });
}

/** Products with an active valid discount (for Exclusive Offers). Max 10, server-side filtered. */
export async function getDiscountedProducts(limit: number = 10): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("discount_active", true)
    .eq("stores.status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (error) return [];
  const valid = (data ?? []).filter((row: ProductRow) => {
    const active = row.discount_active === true;
    return (
      active &&
      row.discount_type != null &&
      row.discount_value != null &&
      isDiscountValid(active, row.discount_start_at, row.discount_end_at)
    );
  });
  return valid.slice(0, limit).map((r) => mapProductRow(r as ProductRow, language));
}

/** Distinct filter values and price range for marketplace filters (only active stores with visible products). */
export async function getMarketplaceFilters(): Promise<MarketplaceFilters> {
  const supabase = await createClient();

  const [categoryRes, metalRes, karatRes, priceRes, storeIdsRes] = await Promise.all([
    supabase
      .from("products")
      .select("category")
      .not("category", "is", null),
    supabase
      .from("products")
      .select("metal_type")
      .not("metal_type", "is", null),
    supabase
      .from("products")
      .select("gold_karat")
      .not("gold_karat", "is", null),
    supabase
      .from("products")
      .select("min_price:min(price), max_price:max(price)")
      .single(),
    supabase
      .from("products")
      .select("store_id"),
  ]);

  const storeIds = [...new Set((storeIdsRes.data ?? []).map((r: { store_id: string }) => r.store_id).filter(Boolean))];
  const brandRes = storeIds.length > 0
    ? await supabase
        .from("stores")
        .select("id, name, slug")
        .in("id", storeIds)
        .eq("status", "approved")
    : { data: [] };

  const categories = Array.from(
    new Set(
      (categoryRes.data ?? [])
        .map((r: any) => r.category as string)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
    )
  ).sort();

  const metals = Array.from(
    new Set(
      (metalRes.data ?? [])
        .map((r: any) => r.metal_type as string)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
    )
  ).sort();

  const karats = Array.from(
    new Set(
      (karatRes.data ?? [])
        .map((r: any) => r.gold_karat as string)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
    )
  ).sort();

  const minPrice = Number((priceRes.data as any)?.min_price ?? 0) || 0;
  const maxPrice = Number((priceRes.data as any)?.max_price ?? 0) || 0;

  const brands = (brandRes.data ?? []).map((row: { id: string; name: string; slug: string }) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const storeIdsForDiscount = brands.map((b) => b.id);
  let discountedByStore: Record<string, number> = {};
  if (storeIdsForDiscount.length > 0) {
    const { data: discountRows } = await supabase
      .from("products")
      .select("store_id, discount_start_at, discount_end_at")
      .eq("discount_active", true)
      .in("store_id", storeIdsForDiscount);
    (discountRows ?? []).forEach((row: { store_id: string; discount_start_at: string | null; discount_end_at: string | null }) => {
      if (!isDiscountValid(true, row.discount_start_at, row.discount_end_at)) return;
      discountedByStore[row.store_id] = (discountedByStore[row.store_id] ?? 0) + 1;
    });
  }
  const brandsWithCount = brands.map((b) => ({
    ...b,
    discountedCount: discountedByStore[b.id] ?? 0,
  }));

  return {
    categories,
    metals,
    karats,
    brands: brandsWithCount,
    minPrice,
    maxPrice,
  };
}

/** Store review aggregate (approved reviews across store products). */
export async function getStoreReviewStats(storeId: string): Promise<{ averageRating: number; reviewCount: number }> {
  const supabase = await createClient();
  const productIdsRes = await supabase.from("products").select("id").eq("store_id", storeId);
  const productIds = (productIdsRes.data ?? []).map((p: { id: string }) => p.id);
  if (productIds.length === 0) return { averageRating: 0, reviewCount: 0 };

  const { data: reviewRows, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("status", "approved")
    .in("product_id", productIds);

  if (error || !reviewRows || reviewRows.length === 0) return { averageRating: 0, reviewCount: 0 };
  const reviewCount = reviewRows.length;
  const sum = reviewRows.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  const averageRating = Math.round((sum / reviewCount) * 10) / 10;
  return { averageRating, reviewCount };
}

/** Public store by slug; only active/approved stores. */
export async function getPublicStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, slug, name, description, logo_url, banner_url, location, contact_email, contact_phone, latitude, longitude")
    .eq("slug", slug)
    .in("status", ["active", "approved"])
    .single();

  if (error || !data) return null;
  const row = data as StoreRow & { status?: string };
  const coverImage = row.banner_url ?? row.logo_url ?? PLACEHOLDER_IMAGE;

  const [{ count }, stats] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", row.id),
    getStoreReviewStats(row.id),
  ]);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    coverImage,
    logo: row.logo_url ?? undefined,
    location: row.location ?? "",
    phone: row.contact_phone ?? "",
    email: row.contact_email ?? "",
    verified: true,
    rating: stats.averageRating,
    reviewCount: stats.reviewCount,
    productCount: count ?? 0,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
  };
}
