"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import type { MarketplaceFilters } from "@/lib/data";

type FilterSidebarProps = {
  filters: MarketplaceFilters;
  selected: {
    brands: string[];
    metals: string[];
    karats: string[];
    minPrice: number | null;
    maxPrice: number | null;
    onSale?: boolean;
  };
};

export function FilterSidebar({ filters, selected }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const { t } = useI18n();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    selected.minPrice ?? filters.minPrice ?? 0,
    selected.maxPrice ?? filters.maxPrice ?? filters.minPrice ?? 0,
  ]);

  useEffect(() => {
    setPriceRange([
      selected.minPrice ?? filters.minPrice ?? 0,
      selected.maxPrice ?? filters.maxPrice ?? filters.maxPrice ?? filters.minPrice ?? 0,
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.minPrice, selected.maxPrice, filters.minPrice, filters.maxPrice]);

  function updateParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function toggleMulti(name: string, value: string) {
    updateParams((params) => {
      const existing = params.getAll(name);
      if (existing.includes(value)) {
        // remove
        params.delete(name);
        for (const v of existing.filter((v) => v !== value)) {
          params.append(name, v);
        }
      } else {
        params.append(name, value);
      }
    });
  }

  function clearAll() {
    updateParams((params) => {
      ["brand", "metal", "karat", "priceMin", "priceMax", "category", "onSale", "sort"].forEach((k) =>
        params.delete(k)
      );
    });
  }

  function applyPriceRange(range: [number, number]) {
    updateParams((params) => {
      params.set("priceMin", String(range[0]));
      params.set("priceMax", String(range[1]));
    });
  }

  function localizeOption(value: string): string {
    const key = value.trim().toLowerCase().replace(/\s+/g, "_");
    const optionMap: Record<string, string> = {
      ring: t("marketplace.rings"),
      rings: t("marketplace.rings"),
      necklace: t("marketplace.necklaces"),
      necklaces: t("marketplace.necklaces"),
      bracelet: t("marketplace.bracelets"),
      bracelets: t("marketplace.bracelets"),
      earring: t("marketplace.earrings"),
      earrings: t("marketplace.earrings"),
      pendant: t("marketplace.pendants"),
      pendants: t("marketplace.pendants"),
      anklet: t("marketplace.anklets"),
      anklets: t("marketplace.anklets"),
      gold: t("marketplace.gold"),
      white_gold: t("marketplace.whiteGold"),
      rose_gold: t("marketplace.roseGold"),
      silver: t("marketplace.silver"),
      platinum: t("marketplace.platinum"),
      diamond: t("marketplace.diamond"),
    };
    return optionMap[key] ?? value;
  }

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-24 bg-white lg:rounded-lg lg:border lg:border-primary/10 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-luxury text-primary hidden lg:block">{t("marketplace.filters")}</h3>
          <Button variant="ghost" size="sm" className="text-primary ml-auto" onClick={clearAll}>
            {t("marketplace.clearAll")}
          </Button>
        </div>

        <div className="space-y-6 font-sans">
          <div>
            <h4 className="mb-3 text-sm font-medium text-masa-dark">{t("marketplace.offers")}</h4>
            <div className="flex items-center gap-2">
              <Checkbox
                id="filter-onSale"
                checked={selected.onSale === true}
                onCheckedChange={(checked) =>
                  updateParams((p) => {
                    if (checked) p.set("onSale", "1");
                    else p.delete("onSale");
                  })
                }
              />
              <Label htmlFor="filter-onSale" className="text-sm cursor-pointer text-masa-dark">
                {t("marketplace.onSale")}
              </Label>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-masa-dark">{t("marketplace.category")}</h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  updateParams((p) => {
                    p.delete("category");
                  })
                }
                className={`block text-sm ${
                  !searchParams.get("category") ? "text-primary font-medium" : "text-masa-dark"
                }`}
              >
                {t("marketplace.all")}
              </button>
              {filters.categories.map((cat) => {
                const active = searchParams.get("category") === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      updateParams((p) => {
                        p.set("category", cat);
                      })
                    }
                    className={`block text-sm ${
                      active ? "text-primary font-medium" : "text-masa-dark"
                    }`}
                  >
                    {localizeOption(cat)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-masa-dark">{t("marketplace.priceRange")}</h4>
            <Slider
              min={filters.minPrice}
              max={filters.maxPrice || filters.minPrice + 1}
              step={Math.max(1, Math.round((filters.maxPrice - filters.minPrice) / 20) || 1)}
              value={priceRange}
              onValueChange={(val) => setPriceRange([val[0], val[1]])}
              onValueCommit={(val) => applyPriceRange([val[0], val[1]])}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-masa-gray">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-masa-dark">{t("marketplace.metalType")}</h4>
            <div className="space-y-2">
              {filters.metals.map((metal) => {
                const checked = selected.metals.includes(metal);
                return (
                  <div key={metal} className="flex items-center gap-2">
                    <Checkbox
                      id={`metal-${metal}`}
                      checked={checked}
                      onCheckedChange={() => toggleMulti("metal", metal)}
                    />
                    <Label htmlFor={`metal-${metal}`} className="text-sm cursor-pointer text-masa-dark">
                      {localizeOption(metal)}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-masa-dark">{t("marketplace.goldKarat")}</h4>
            <div className="space-y-2">
              {filters.karats.map((karat) => {
                const checked = selected.karats.includes(karat);
                return (
                  <div key={karat} className="flex items-center gap-2">
                    <Checkbox
                      id={`karat-${karat}`}
                      checked={checked}
                      onCheckedChange={() => toggleMulti("karat", karat)}
                    />
                    <Label htmlFor={`karat-${karat}`} className="text-sm cursor-pointer text-masa-dark">
                      {karat}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-masa-dark">{t("marketplace.brand")}</h4>
            <div className="space-y-2">
              {filters.brands.map((brand) => {
                const checked = selected.brands.includes(brand.id);
                return (
                  <div key={brand.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleMulti("brand", brand.id)}
                    />
                    <Label htmlFor={`brand-${brand.id}`} className="text-sm cursor-pointer text-masa-dark">
                      {brand.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
