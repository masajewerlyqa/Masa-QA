"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, Package, Building2, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/useI18n";

const DEBOUNCE_MS = 280;

type SuggestPayload = {
  products: { id: string; name: string; storeName: string }[];
  stores: { id: string; name: string; slug: string }[];
  categories: { label: string }[];
};

function localizeCategoryLabel(label: string, t: (key: string) => string): string {
  const key = label.trim().toLowerCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
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
    other: t("marketplace.other"),
  };
  return map[key] ?? label;
}

type NavbarGlobalSearchProps = {
  variant: "desktop" | "mobile";
  /** Wrapper for desktop: form layout classes */
  formClassName?: string;
  /** Called after navigating from a suggestion (e.g. close mobile sheet) */
  onAfterNavigate?: () => void;
  autoFocus?: boolean;
};

export function NavbarGlobalSearch({
  variant,
  formClassName,
  onAfterNavigate,
  autoFocus,
}: NavbarGlobalSearchProps) {
  const router = useRouter();
  const { isArabic, t } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SuggestPayload | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggest = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as SuggestPayload;
      setData(json);
    } catch {
      setData({ products: [], stores: [], categories: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (!trimmed) {
      setData(null);
      setOpen(false);
      return;
    }
    setOpen(true);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void fetchSuggest(value);
    }, DEBOUNCE_MS);
  }

  function handleNavigate(href: string) {
    setOpen(false);
    onAfterNavigate?.();
    router.push(href);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const trimmed = query.trim();
    setOpen(false);
    onAfterNavigate?.();
    if (!trimmed) {
      router.push("/discover", { scroll: false });
      return;
    }
    router.push(`/discover?${new URLSearchParams({ q: trimmed }).toString()}`, { scroll: false });
  }

  const trimmed = query.trim();
  const hasRows =
    data &&
    (data.products.length > 0 || data.stores.length > 0 || data.categories.length > 0);

  const inputClass =
    variant === "desktop"
      ? `h-9 text-sm bg-white/95 text-masa-dark border-0 shadow-sm rounded-full ${isArabic ? "pr-9 pl-4 text-right" : "pl-9 pr-4"}`
      : `${isArabic ? "pr-9 pl-4 text-right" : "pl-9 pr-4"} bg-masa-light border-0 h-10 text-sm rounded-full`;

  const panelClass =
    "absolute top-full start-0 end-0 mt-1.5 z-[100] rounded-xl border border-primary/15 bg-white shadow-lg max-h-[min(70vh,22rem)] overflow-y-auto text-start";

  return (
    <div ref={rootRef} className={formClassName ?? "relative w-full"} dir={isArabic ? "rtl" : "ltr"}>
      <form
        className="relative"
        role="search"
        aria-label={t("navbar.searchProducts")}
        onSubmit={onSubmit}
      >
        <Search
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-masa-gray pointer-events-none z-[1] ${isArabic ? "right-3" : "left-3"}`}
          aria-hidden
        />
        <Input
          placeholder={
            variant === "desktop"
              ? t("navbar.searchDesktopPlaceholder")
              : t("navbar.searchMobilePlaceholder")
          }
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) {
              setOpen(true);
              if (!data && !loading) void fetchSuggest(query);
            }
          }}
          className={inputClass}
          aria-label={t("navbar.search")}
          aria-expanded={open}
          aria-controls="navbar-global-search-panel"
          autoComplete="off"
          autoFocus={autoFocus}
        />

        {open && trimmed.length > 0 && (
          <div id="navbar-global-search-panel" className={panelClass} role="listbox">
            {loading && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-masa-gray">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
                {t("navbar.searchLoading")}
              </div>
            )}

            {!loading && data && (
              <>
                {!hasRows && (
                  <p className="px-4 py-3 text-sm text-masa-gray">{t("navbar.searchNoMatches")}</p>
                )}

                {data.products.length > 0 && (
                  <div className="py-2 border-b border-primary/10">
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-masa-gray">
                      {t("navbar.searchSectionProducts")}
                    </p>
                    <ul className="space-y-0.5">
                      {data.products.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            className="flex w-full items-start gap-2 px-4 py-2 text-start text-sm text-masa-dark hover:bg-masa-light/90"
                            onClick={() => handleNavigate(`/product/${p.id}`)}
                          >
                            <Package className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden />
                            <span className="min-w-0">
                              <span className="font-medium line-clamp-2">{p.name}</span>
                              {p.storeName ? (
                                <span className="block text-xs text-masa-gray truncate">
                                  {p.storeName}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.stores.length > 0 && (
                  <div className="py-2 border-b border-primary/10">
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-masa-gray">
                      {t("navbar.searchSectionBrands")}
                    </p>
                    <ul className="space-y-0.5">
                      {data.stores.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2 text-start text-sm text-masa-dark hover:bg-masa-light/90"
                            onClick={() =>
                              handleNavigate(`/discover?${new URLSearchParams({ brand: s.id }).toString()}`)
                            }
                          >
                            <Building2 className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                            <span className="truncate">{s.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.categories.length > 0 && (
                  <div className="py-2 border-b border-primary/10">
                    <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-masa-gray">
                      {t("navbar.searchSectionCategories")}
                    </p>
                    <ul className="space-y-0.5">
                      {data.categories.map((c) => (
                        <li key={c.label}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2 text-start text-sm text-masa-dark hover:bg-masa-light/90"
                            onClick={() =>
                              handleNavigate(
                                `/discover?${new URLSearchParams({ category: c.label }).toString()}`
                              )
                            }
                          >
                            <Tag className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                            <span>{localizeCategoryLabel(c.label, t)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-2">
                  <Link
                    href={`/discover?${new URLSearchParams({ q: trimmed }).toString()}`}
                    className="block rounded-lg bg-primary/10 px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-primary/15"
                    onClick={() => {
                      setOpen(false);
                      onAfterNavigate?.();
                    }}
                  >
                    {t("navbar.searchSeeAllMarketplace")}
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
