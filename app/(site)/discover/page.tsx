import { redirect } from "next/navigation";
import {
  getMarketplaceFilters,
  getMarketplacePriceBoundsForFilters,
  getPublicProductsForMarketplace,
} from "@/lib/data";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/customer";
import { DiscoverClient } from "@/components/DiscoverClient";
import {
  canonicalizeMarketplaceCategoryParam,
  isMarketplaceCategoryAll,
} from "@/lib/marketplace-category";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Search and filters depend on query string — always run on the server per request. */
export const dynamic = "force-dynamic";

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const toArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : value.split(",").map((v) => v.trim()).filter(Boolean);
  };

  const brandIds = toArray(params.brand as string | string[] | undefined);
  const metals = toArray(params.metal as string | string[] | undefined);
  const karats = toArray(params.karat as string | string[] | undefined);

  const rawCategoryList = toArray(params.category as string | string[] | undefined)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !isMarketplaceCategoryAll(s));

  const canonicalList = [
    ...new Set(rawCategoryList.map((r) => canonicalizeMarketplaceCategoryParam(r))),
  ];

  const needsCategoryRedirect =
    rawCategoryList.some((r) => canonicalizeMarketplaceCategoryParam(r) !== r) ||
    rawCategoryList.length !== canonicalList.length;

  if (needsCategoryRedirect) {
    const sp = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined || key === "category") continue;
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item != null && String(item) !== "") sp.append(key, String(item));
        }
      } else {
        sp.set(key, String(val));
      }
    }
    for (const c of canonicalList) {
      sp.append("category", c);
    }
    redirect(`/discover?${sp.toString()}`);
  }

  const categoriesForQuery = canonicalList.length > 0 ? canonicalList : undefined;

  const searchRaw = (params.q as string | undefined) ?? "";
  const search = searchRaw.trim();
  const firstParam = (value: string | string[] | undefined): string | undefined => {
    if (value == null) return undefined;
    return Array.isArray(value) ? value[0] : value;
  };
  const parseFinitePrice = (value: string | string[] | undefined): number | undefined => {
    const raw = firstParam(value);
    if (raw == null || raw === "") return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };
  const minPrice = parseFinitePrice(params.priceMin);
  const maxPrice = parseFinitePrice(params.priceMax);
  const onSale = params.onSale === "1";
  const sort = (params.sort as string) || "default";
  const validSort =
    sort === "highest_discount" || sort === "lowest_price" || sort === "ending_soon"
      ? sort
      : "default";

  const { user } = await getCurrentUserWithProfile();
  const DISCOVER_PAGE_SIZE = 24;
  const priceBoundsInput = {
    categories: categoriesForQuery,
    brands: brandIds.length > 0 ? brandIds : undefined,
    metals: metals.length > 0 ? metals : undefined,
    karats: karats.length > 0 ? karats : undefined,
    search: search ? search : undefined,
    onSale: onSale || undefined,
  };

  const [filters, priceExtent, initialProducts, wishlistIds] = await Promise.all([
    getMarketplaceFilters(),
    getMarketplacePriceBoundsForFilters(priceBoundsInput),
    getPublicProductsForMarketplace({
      search,
      categories: categoriesForQuery,
      brands: brandIds,
      metals,
      karats,
      minPrice,
      maxPrice,
      limit: DISCOVER_PAGE_SIZE,
      onSale: onSale || undefined,
      sort: validSort !== "default" ? validSort : undefined,
    }),
    user ? getWishlistProductIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <DiscoverClient
      initialProducts={initialProducts}
      wishlistIds={wishlistIds}
      search={search}
      filters={filters}
      priceExtent={priceExtent ?? undefined}
      selectedFilters={{
        categories: canonicalList,
        brands: brandIds,
        metals,
        karats,
        minPrice: minPrice ?? null,
        maxPrice: maxPrice ?? null,
        onSale,
        sort: validSort,
      }}
    />
  );
}
