"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/FilterSidebar";
import { useI18n } from "@/components/useI18n";
import type { MarketplaceFilters } from "@/lib/data";

type MobileFilterDrawerProps = {
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

export function MobileFilterDrawer({ filters, selected }: MobileFilterDrawerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const activeCount = [
    selected.brands.length > 0,
    selected.metals.length > 0,
    selected.karats.length > 0,
    selected.minPrice != null,
    selected.maxPrice != null,
    selected.onSale === true,
  ].filter(Boolean).length;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 border-primary/20"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {t("marketplace.filters")}
        {activeCount > 0 && (
          <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-primary text-white text-[10px]">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={t("marketplace.filters")}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 z-10 bg-white border-b border-primary/10 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-luxury text-primary">{t("marketplace.filters")}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-masa-dark"
                aria-label={t("marketplace.closeFilters")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar filters={filters} selected={selected} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-primary/10 p-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90 h-12"
                onClick={() => setOpen(false)}
              >
                {t("marketplace.showResults")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
