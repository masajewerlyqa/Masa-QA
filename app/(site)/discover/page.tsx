import { getMarketplaceFilters, getPublicProductsForMarketplace } from "@/lib/data";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/customer";
import { DiscoverClient } from "@/components/DiscoverClient";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = (params.category as string | undefined) ?? "all";
  const search = (params.q as string | undefined) ?? "";

  const toArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : value.split(",").map((v) => v.trim()).filter(Boolean);
  };

  const brandIds = toArray(params.brand as string | string[] | undefined);
  const metals = toArray(params.metal as string | string[] | undefined);
  const karats = toArray(params.karat as string | string[] | undefined);
  const minPrice = params.priceMin ? Number(params.priceMin) : undefined;
  const maxPrice = params.priceMax ? Number(params.priceMax) : undefined;
  const onSale = params.onSale === "1";
  const sort = (params.sort as string) || "default";
  const validSort =
    sort === "highest_discount" || sort === "lowest_price" || sort === "ending_soon"
      ? sort
      : "default";

  const { user } = await getCurrentUserWithProfile();
  const DISCOVER_PAGE_SIZE = 24;
  const [filters, initialProducts, wishlistIds] = await Promise.all([
    getMarketplaceFilters(),
    getPublicProductsForMarketplace({
      search,
      category: category === "all" ? undefined : category,
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
      category={category}
      wishlistIds={wishlistIds}
      search={search}
      filters={filters}
      selectedFilters={{
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
