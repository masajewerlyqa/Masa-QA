import "server-only";

import { createClient } from "@/lib/supabase/server";
import { buildIlikeContainsPattern, normalizeMarketplaceSearchInput } from "@/lib/marketplace-search";
import { resolveMarketplaceSearchOrClause } from "@/lib/marketplace-search-resolve";
import { CATEGORIES } from "@/lib/validations/product";

export type GlobalSearchSuggestProduct = {
  id: string;
  name: string;
  storeName: string;
};

export type GlobalSearchSuggestStore = {
  id: string;
  name: string;
  slug: string;
};

type GlobalSearchSuggestCategory = {
  label: string;
};

export type GlobalSearchSuggestResult = {
  products: GlobalSearchSuggestProduct[];
  stores: GlobalSearchSuggestStore[];
  categories: GlobalSearchSuggestCategory[];
};

const PRODUCT_SUGGEST_SELECT = "id, name, stores!inner(name, status)";

/** Navbar / global search: products, brands (stores), and category labels matching the query. */
export async function getGlobalSearchSuggestions(rawQ: string): Promise<GlobalSearchSuggestResult> {
  const needle = normalizeMarketplaceSearchInput(rawQ).toLowerCase();
  const categories: GlobalSearchSuggestCategory[] = needle.length
    ? CATEGORIES.filter((c) => c.toLowerCase().includes(needle)).map((label) => ({ label }))
    : [];

  const term = buildIlikeContainsPattern(rawQ);
  if (!term) {
    return { products: [], stores: [], categories };
  }

  const supabase = await createClient();
  const searchOr = await resolveMarketplaceSearchOrClause(supabase, rawQ);
  if (!searchOr) {
    return { products: [], stores: [], categories };
  }

  const [prodRes, storeRes] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_SUGGEST_SELECT)
      .eq("stores.status", "approved")
      .or(searchOr)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("stores")
      .select("id, name, slug")
      .eq("status", "approved")
      .or(`name.ilike.${term},slug.ilike.${term}`)
      .order("name", { ascending: true })
      .limit(6),
  ]);

  const products: GlobalSearchSuggestProduct[] = (prodRes.data ?? [])
    .map((row: { id: string; name: string; stores: { name: string } | { name: string }[] }) => {
      const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
      return {
        id: row.id,
        name: row.name,
        storeName: store?.name ?? "",
      };
    })
    .filter((p) => p.name);

  const stores: GlobalSearchSuggestStore[] = (storeRes.data ?? []).map(
    (row: { id: string; name: string; slug: string }) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    })
  );

  return { products, stores, categories };
}
