"use server";

import { createClient } from "@/lib/supabase/server";
import { sortMarketplaceCategoriesForFilter } from "@/lib/marketplace-category";
import { normalizeMarketplaceSearchInput } from "@/lib/marketplace-search";
import { resolveMarketplaceSearchOrClause } from "@/lib/marketplace-search-resolve";
import type { Product, Store } from "@/lib/types";
import { isDiscountValid, computeDiscountedPrice, type DiscountType } from "@/lib/discount";
import { getServerLanguage } from "@/lib/language-server";
import type { Language } from "@/lib/language";
import { localizeProductCategory, localizeProductMetal, localizeProductText } from "@/lib/i18n/product-localization";
import { getPricingMarketSnapshot } from "@/lib/pricing";
import { computeDynamicMarketPriceUsd, type PricingMarketSnapshot } from "@/lib/pricing-engine";
import { QAR_TO_USD } from "@/lib/market-prices";

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
  craftsmanship_margin: number | null;
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

type AggregatePriceValue = number | { price?: number | null }[] | null | undefined;
type AggregatePriceRow = {
  min_price?: AggregatePriceValue;
  max_price?: AggregatePriceValue;
};

function extractAggregatePrice(value: AggregatePriceValue): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (Array.isArray(value)) {
    const nested = value[0]?.price;
    const num = Number(nested ?? NaN);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

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
  /** Canonical DB labels; OR semantics (product in any selected category). */
  categories?: string[];
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

const MARKETPLACE_PAGE = 280;
const MARKETPLACE_MAX_ROWS_SCAN = 12000;

const MARKETPLACE_PRODUCT_SELECT =
  "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, craftsmanship_margin, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(id, name, slug, status), product_images(url, sort_order), reviews(rating)";

export type MarketplacePriceBoundsInput = Pick<
  MarketplaceFilterInput,
  "categories" | "brands" | "metals" | "karats" | "search" | "onSale"
>;

/** Min/max list price (USD) for products matching non-price filters — drives slider bounds on Discover. */
export async function getMarketplacePriceBoundsForFilters(
  input: MarketplacePriceBoundsInput
): Promise<{ minPrice: number; maxPrice: number } | null> {
  const supabase = await createClient();
  const { data: approvedRows } = await supabase.from("stores").select("id").eq("status", "approved");
  const approvedIds = (approvedRows ?? []).map((r: { id: string }) => r.id).filter(Boolean);
  if (approvedIds.length === 0) return null;

  let q = supabase.from("products").select("min_price:min(price), max_price:max(price)");

  if (input.brands && input.brands.length > 0) {
    q = q.in("store_id", input.brands);
  } else {
    q = q.in("store_id", approvedIds);
  }

  if (input.categories && input.categories.length > 0) {
    q = q.in("category", input.categories);
  }
  if (input.metals && input.metals.length > 0) {
    q = q.in("metal_type", input.metals);
  }
  if (input.karats && input.karats.length > 0) {
    q = q.in("gold_karat", input.karats);
  }
  {
    const orClause = await resolveMarketplaceSearchOrClause(supabase, input.search);
    if (orClause) q = q.or(orClause);
  }
  if (input.onSale) {
    q = q.eq("discount_active", true);
  }

  const { data, error } = await q.single();
  if (error || !data) return null;
  const row = data as AggregatePriceRow;
  let minPrice = extractAggregatePrice(row.min_price);
  let maxPrice = extractAggregatePrice(row.max_price);
  if (!Number.isFinite(minPrice)) minPrice = 0;
  if (!Number.isFinite(maxPrice)) maxPrice = 0;

  if (maxPrice <= minPrice) {
    let minQ = supabase.from("products").select("price").limit(1).order("price", { ascending: true });
    let maxQ = supabase.from("products").select("price").limit(1).order("price", { ascending: false });

    if (input.brands && input.brands.length > 0) {
      minQ = minQ.in("store_id", input.brands);
      maxQ = maxQ.in("store_id", input.brands);
    } else {
      minQ = minQ.in("store_id", approvedIds);
      maxQ = maxQ.in("store_id", approvedIds);
    }

    if (input.categories && input.categories.length > 0) {
      minQ = minQ.in("category", input.categories);
      maxQ = maxQ.in("category", input.categories);
    }
    if (input.metals && input.metals.length > 0) {
      minQ = minQ.in("metal_type", input.metals);
      maxQ = maxQ.in("metal_type", input.metals);
    }
    if (input.karats && input.karats.length > 0) {
      minQ = minQ.in("gold_karat", input.karats);
      maxQ = maxQ.in("gold_karat", input.karats);
    }
    {
      const orClause = await resolveMarketplaceSearchOrClause(supabase, input.search);
      if (orClause) {
        minQ = minQ.or(orClause);
        maxQ = maxQ.or(orClause);
      }
    }
    if (input.onSale) {
      minQ = minQ.eq("discount_active", true);
      maxQ = maxQ.eq("discount_active", true);
    }

    const [minRowRes, maxRowRes] = await Promise.all([minQ.maybeSingle(), maxQ.maybeSingle()]);
    const minFromRows = Number((minRowRes.data as { price?: number } | null)?.price ?? NaN);
    const maxFromRows = Number((maxRowRes.data as { price?: number } | null)?.price ?? NaN);
    if (Number.isFinite(minFromRows)) minPrice = minFromRows;
    if (Number.isFinite(maxFromRows)) maxPrice = maxFromRows;
  }

  if (maxPrice <= minPrice) {
    maxPrice = minPrice + 1;
  }
  return { minPrice, maxPrice };
}

function hasActivePriceFilter(minPrice?: number, maxPrice?: number): boolean {
  return (
    (typeof minPrice === "number" && Number.isFinite(minPrice)) ||
    (typeof maxPrice === "number" && Number.isFinite(maxPrice))
  );
}

/** Filter by price shown to customers (after discounts), not raw DB `price` only. */
function productMeetsPriceFilter(price: number, minPrice?: number, maxPrice?: number): boolean {
  if (typeof minPrice === "number" && Number.isFinite(minPrice) && price < minPrice) return false;
  if (typeof maxPrice === "number" && Number.isFinite(maxPrice) && price > maxPrice) return false;
  return true;
}

function mapProductRow(row: ProductRow, language: Language, marketSnapshot: PricingMarketSnapshot | null): Product {
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

  const dynamic = computeDynamicMarketPriceUsd(
    {
      metalType: row.metal_type,
      goldKarat: row.gold_karat,
      weight: row.weight,
      craftsmanshipMargin: row.craftsmanship_margin,
      storedPrice: row.price,
    },
    marketSnapshot ?? {},
    QAR_TO_USD
  );
  const basePrice = Number(dynamic.finalPriceUsd);
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
  const marketSnapshot = await getPricingMarketSnapshot();
  let query = supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, craftsmanship_margin, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
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
  return (data ?? []).map((row) => mapProductRow(row, language, marketSnapshot));
}

async function fetchMarketplaceProductRowsPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: MarketplaceFilterInput,
  rangeFrom: number,
  rangeTo: number
): Promise<ProductRow[]> {
  let query = supabase
    .from("products")
    .select(MARKETPLACE_PRODUCT_SELECT)
    .eq("stores.status", "approved");

  if (filters.categories && filters.categories.length > 0) {
    query = query.in("category", filters.categories);
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
  {
    const orClause = await resolveMarketplaceSearchOrClause(supabase, filters.search);
    if (orClause) query = query.or(orClause);
  }
  if (filters.onSale) {
    query = query.eq("discount_active", true);
  }

  query = query.order("created_at", { ascending: false }).range(rangeFrom, rangeTo);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as ProductRow[];
}

function filterRowsValidOnSale(rows: ProductRow[]): ProductRow[] {
  return rows.filter(
    (row: ProductRow) =>
      row.discount_active === true &&
      row.discount_type != null &&
      row.discount_value != null &&
      isDiscountValid(true, row.discount_start_at, row.discount_end_at)
  );
}

function applyMarketplaceSort(products: Product[], sortOption: MarketplaceSortOption): Product[] {
  if (sortOption === "highest_discount") {
    return products
      .filter((p) => p.originalPrice != null && p.originalPrice > p.price && p.originalPrice > 0)
      .sort(
        (a, b) =>
          (b.originalPrice! - b.price) / b.originalPrice! -
          (a.originalPrice! - a.price) / a.originalPrice!
      );
  }
  if (sortOption === "lowest_price") {
    return [...products].sort((a, b) => a.price - b.price);
  }
  if (sortOption === "ending_soon") {
    return [...products].sort((a, b) => {
      const aEnd = a.discountEndAt ? new Date(a.discountEndAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bEnd = b.discountEndAt ? new Date(b.discountEndAt).getTime() : Number.MAX_SAFE_INTEGER;
      return aEnd - bEnd;
    });
  }
  return products;
}

/** Public products for marketplace with search and structured filters. */
export async function getPublicProductsForMarketplace(
  filters: MarketplaceFilterInput
): Promise<Product[]> {
  const searchNormalized = filters.search ? normalizeMarketplaceSearchInput(filters.search) : "";
  const filtersEffective: MarketplaceFilterInput = {
    ...filters,
    search: searchNormalized || undefined,
  };

  const language = getServerLanguage();
  const supabase = await createClient();
  const marketSnapshot = await getPricingMarketSnapshot();
  const limit = Math.min(Math.max(filtersEffective.limit ?? 24, 1), 100);
  const offset = filtersEffective.offset ?? 0;
  const priceFilter = hasActivePriceFilter(filtersEffective.minPrice, filtersEffective.maxPrice);
  const sortOption = filtersEffective.sort ?? "default";
  const needFullCatalogSort =
    priceFilter &&
    (sortOption === "lowest_price" || sortOption === "highest_discount" || sortOption === "ending_soon");

  if (priceFilter) {
    const collected: Product[] = [];
    for (let start = 0; start < MARKETPLACE_MAX_ROWS_SCAN; start += MARKETPLACE_PAGE) {
      const end = start + MARKETPLACE_PAGE - 1;
      let rows = await fetchMarketplaceProductRowsPage(supabase, filtersEffective, start, end);
      if (rows.length === 0) break;
      if (filtersEffective.onSale) {
        rows = filterRowsValidOnSale(rows);
      }
      for (const r of rows) {
        const p = mapProductRow(r, language, marketSnapshot);
        if (productMeetsPriceFilter(p.price, filtersEffective.minPrice, filtersEffective.maxPrice)) {
          collected.push(p);
        }
      }
      if (!needFullCatalogSort && collected.length >= limit + offset) {
        break;
      }
      if (rows.length < MARKETPLACE_PAGE) {
        break;
      }
    }
    let products = applyMarketplaceSort(collected, sortOption);
    products = products.slice(offset, offset + limit);
    return products;
  }

  let rows = await fetchMarketplaceProductRowsPage(
    supabase,
    filtersEffective,
    filtersEffective.onSale ? 0 : offset,
    filtersEffective.onSale ? Math.min((offset + limit) * 2, 200) - 1 : offset + limit - 1
  );
  if (filtersEffective.onSale) {
    rows = filterRowsValidOnSale(rows);
    rows = rows.slice(offset, offset + limit);
  }
  let products = rows.map((r: ProductRow) => mapProductRow(r, language, marketSnapshot));
  products = applyMarketplaceSort(products, sortOption);
  return products;
}

/** Single public product by id; null if not found or not visible (draft, deleted, or store inactive). */
export async function getPublicProductById(id: string): Promise<Product | null> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const marketSnapshot = await getPricingMarketSnapshot();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, craftsmanship_margin, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("id", id)
    .eq("stores.status", "approved")
    .single();

  if (error || !data) return null;
  return mapProductRow(data as ProductRow, language, marketSnapshot);
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
  const marketSnapshot = await getPricingMarketSnapshot();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, craftsmanship_margin, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .neq("id", productId)
    .eq("stores.status", "approved")
    .or(`store_id.eq.${storeId},category.ilike.${category}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []).map((row) => mapProductRow(row, language, marketSnapshot));
}

/** Public products for a store (same visibility rules). */
export async function getPublicProductsByStore(storeId: string): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const marketSnapshot = await getPricingMarketSnapshot();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, craftsmanship_margin, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
    )
    .eq("store_id", storeId)
    .eq("stores.status", "approved")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((row) => mapProductRow(row, language, marketSnapshot));
}

/** Featured section: first N public products. */
export async function getFeaturedPublicProducts(limit: number = 4): Promise<Product[]> {
  return getPublicProducts({ limit });
}

/** Products with an active valid discount (for Exclusive Offers). Max 10, server-side filtered. */
export async function getDiscountedProducts(limit: number = 10): Promise<Product[]> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const marketSnapshot = await getPricingMarketSnapshot();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, store_id, name, slug, description, price, compare_at_price, category, metal_type, gold_karat, weight, craftsmanship_margin, created_at, updated_at, stock_quantity, status, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, stores!inner(name, slug, status), product_images(url, sort_order), reviews(rating)"
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
  return valid.slice(0, limit).map((r) => mapProductRow(r as ProductRow, language, marketSnapshot));
}

/** Distinct filter values and price range for marketplace filters (only active stores with visible products). */
export async function getMarketplaceFilters(): Promise<MarketplaceFilters> {
  const supabase = await createClient();

  const { data: approvedStores } = await supabase.from("stores").select("id").eq("status", "approved");
  const approvedStoreIds = (approvedStores ?? []).map((r: { id: string }) => r.id).filter(Boolean);

  const pricePromise =
    approvedStoreIds.length > 0
      ? supabase
          .from("products")
          .select("min_price:min(price), max_price:max(price)")
          .in("store_id", approvedStoreIds)
          .single()
      : Promise.resolve({ data: { min_price: 0, max_price: 0 }, error: null as null });

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
    pricePromise,
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

  const categories = sortMarketplaceCategoriesForFilter(
    Array.from(
      new Set(
        (categoryRes.data ?? [])
          .map((r: any) => r.category as string)
          .filter((v) => typeof v === "string" && v.trim().length > 0)
      )
    )
  );

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

  const aggregate = (priceRes.data ?? null) as AggregatePriceRow | null;
  let minPrice = extractAggregatePrice(aggregate?.min_price);
  let maxPrice = extractAggregatePrice(aggregate?.max_price);
  if (!Number.isFinite(minPrice)) minPrice = 0;
  if (!Number.isFinite(maxPrice)) maxPrice = 0;

  if (maxPrice <= minPrice && approvedStoreIds.length > 0) {
    const [minRowRes, maxRowRes] = await Promise.all([
      supabase
        .from("products")
        .select("price")
        .in("store_id", approvedStoreIds)
        .order("price", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("products")
        .select("price")
        .in("store_id", approvedStoreIds)
        .order("price", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    const minFromRows = Number((minRowRes.data as { price?: number } | null)?.price ?? NaN);
    const maxFromRows = Number((maxRowRes.data as { price?: number } | null)?.price ?? NaN);
    if (Number.isFinite(minFromRows)) minPrice = minFromRows;
    if (Number.isFinite(maxFromRows)) maxPrice = maxFromRows;
  }

  if (maxPrice <= minPrice) {
    maxPrice = minPrice + 1;
  }

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
