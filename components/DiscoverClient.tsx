"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Grid3x3, List, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer } from "@/components/PageContainer";
import type { Product } from "@/lib/types";
import type { MarketplaceFilters } from "@/lib/data";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useI18n } from "@/components/useI18n";

type SortKey =
  | "featured"
  | "price-low"
  | "price-high"
  | "newest"
  | "popular"
  | "highest_discount"
  | "lowest_price"
  | "ending_soon";

export function DiscoverClient({
  initialProducts,
  wishlistIds = [],
  search = "",
  filters,
  priceExtent,
  selectedFilters,
}: {
  initialProducts: Product[];
  wishlistIds?: string[];
  search?: string;
  filters: MarketplaceFilters;
  /** Slider bounds for current filters (USD); falls back to global catalog range */
  priceExtent?: { minPrice: number; maxPrice: number };
  selectedFilters: {
    categories: string[];
    brands: string[];
    metals: string[];
    karats: string[];
    minPrice: number | null;
    maxPrice: number | null;
    onSale?: boolean;
    sort?: string;
  };
}) {
  const { isArabic, t } = useI18n();
  const wishlistSet = new Set(wishlistIds);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const serverSort = selectedFilters.sort ?? "default";
  const [sort, setSort] = useState<SortKey>(
    serverSort !== "default" ? (serverSort as SortKey) : "featured"
  );
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(search);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const pushQueryToUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = q.trim();
      if (trimmed === "") params.delete("q");
      else params.set("q", trimmed);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function clearMarketplaceSearch() {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSearchInputChange(value: string) {
    setQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      searchDebounceRef.current = null;
      pushQueryToUrl(value);
    }, 320);
  }

  const products = useMemo(() => {
    const list = [...initialProducts];
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    else if (sort === "newest")
      list.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    else if (sort === "popular")
      list.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    else if (sort === "highest_discount")
      list.sort((a, b) => {
        const aP = a.originalPrice != null && a.originalPrice > 0 ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const bP = b.originalPrice != null && b.originalPrice > 0 ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return bP - aP;
      });
    else if (sort === "lowest_price") list.sort((a, b) => a.price - b.price);
    else if (sort === "ending_soon")
      list.sort((a, b) => {
        const aEnd = a.discountEndAt ? new Date(a.discountEndAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bEnd = b.discountEndAt ? new Date(b.discountEndAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aEnd - bEnd;
      });
    return list;
  }, [initialProducts, sort]);

  const hasMarketSearch = Boolean(search?.trim());
  const hasStructuredFilters =
    selectedFilters.categories.length > 0 ||
    selectedFilters.brands.length > 0 ||
    selectedFilters.metals.length > 0 ||
    selectedFilters.karats.length > 0 ||
    selectedFilters.onSale === true;

  function updateSearchParam(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value == null || value.trim() === "") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSortChange(value: string) {
    const v = value as SortKey;
    setSort(v);
    if (v === "highest_discount" || v === "lowest_price" || v === "ending_soon") {
      updateSearchParam("sort", v);
    } else {
      updateSearchParam("sort", null);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    pushQueryToUrl(query);
  }

  return (
    <PageContainer className="py-6 md:py-12">
      <div className="mb-6 md:mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl mb-1 md:mb-2 text-primary font-luxury">
            {t("marketplace.discover")}
          </h1>
          <p className="text-base md:text-xl text-masa-gray font-sans">
            {t("marketplace.discoverSubtitle")}
          </p>
        </div>
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-80 lg:w-96 relative"
          role="search"
          aria-label={t("marketplace.searchProductsBrands")}
        >
          <Search className={`w-4 h-4 text-masa-gray absolute top-1/2 -translate-y-1/2 ${isArabic ? "right-3" : "left-3"}`} />
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder={t("marketplace.searchByProductOrBrand")}
            className={`w-full rounded-full border border-primary/20 bg-masa-light px-9 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary ${isArabic ? "text-right" : ""}`}
          />
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Desktop filter sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} priceExtent={priceExtent} selected={selectedFilters} />
        </div>

        <div className="flex-1 min-w-0 min-h-0 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 md:pb-6 border-b border-primary/10">
            <div className="flex items-center gap-2">
              {/* Mobile filter button */}
              <MobileFilterDrawer filters={filters} priceExtent={priceExtent} selected={selectedFilters} />
              <p className="text-sm text-masa-gray font-sans hidden sm:block">
                {products.length === 0 ? (
                  <span className="text-masa-dark">0 {t("marketplace.products")}</span>
                ) : (
                  <>
                    {t("marketplace.showing")} <span className="text-masa-dark">1-{products.length}</span>{" "}
                    {t("marketplace.of")} <span className="text-masa-dark">{products.length}</span>{" "}
                    {t("marketplace.products")}
                  </>
                )}
              </p>
              <p className="text-xs text-masa-gray font-sans sm:hidden">
                {isArabic
                  ? `${products.length} ${t("marketplace.product")}`
                  : `${products.length} product${products.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-32 md:w-48 h-9 text-xs md:text-sm">
                  <ArrowUpDown className={`w-3.5 h-3.5 md:hidden shrink-0 ${isArabic ? "ml-1" : "mr-1"}`} />
                  <SelectValue placeholder={t("marketplace.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("marketplace.featured")}</SelectItem>
                  <SelectItem value="price-low">{t("marketplace.priceLowToHigh")}</SelectItem>
                  <SelectItem value="price-high">{t("marketplace.priceHighToLow")}</SelectItem>
                  <SelectItem value="newest">{t("marketplace.newestFirst")}</SelectItem>
                  <SelectItem value="popular">{t("marketplace.mostPopular")}</SelectItem>
                  {selectedFilters.onSale && (
                    <>
                      <SelectItem value="highest_discount">{t("marketplace.highestDiscount")}</SelectItem>
                      <SelectItem value="lowest_price">{t("marketplace.lowestAfterDiscount")}</SelectItem>
                      <SelectItem value="ending_soon">{t("marketplace.endingSoon")}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <div className="hidden sm:flex border border-primary/10 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === "grid" ? "bg-masa-light" : ""}
                  onClick={() => setViewMode("grid")}
                  aria-label={t("marketplace.gridView")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === "list" ? "bg-masa-light" : ""}
                  onClick={() => setViewMode("list")}
                  aria-label={t("marketplace.listView")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-primary/10 bg-masa-light/40 px-6 py-14 text-center">
              {hasMarketSearch ? (
                <>
                  <p className="font-luxury text-lg text-primary mb-2">{t("marketplace.searchNoResults")}</p>
                  <p className="text-sm text-masa-gray mb-6 max-w-md mx-auto">
                    {t("marketplace.searchNoResultsHint")}
                  </p>
                  <Button type="button" variant="outline" className="border-primary text-primary" onClick={clearMarketplaceSearch}>
                    {t("marketplace.clearSearch")}
                  </Button>
                </>
              ) : hasStructuredFilters ? (
                <>
                  <p className="font-luxury text-lg text-primary mb-2">{t("marketplace.noMatchesFilters")}</p>
                  <p className="text-sm text-masa-gray max-w-md mx-auto">{t("marketplace.noMatchesFiltersHint")}</p>
                </>
              ) : (
                <p className="text-masa-gray font-sans">{t("marketplace.catalogEmpty")}</p>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
                  : "flex flex-col gap-2 sm:gap-3"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isInWishlist={wishlistSet.has(product.id)}
                  layout={viewMode === "grid" ? "compact" : "list"}
                />
              ))}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-8 md:mt-12 flex justify-center gap-2">
              <Button variant="outline" size="sm">
                {t("marketplace.previous")}
              </Button>
              <Button size="sm" className="bg-primary">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                {t("marketplace.next")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
