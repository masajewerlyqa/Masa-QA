import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildMarketplaceSearchOrFilter, normalizeMarketplaceSearchInput } from "@/lib/marketplace-search";

/**
 * Text search on `products` columns only (name, description, category, metal, karat, slug).
 *
 * Do **not** put `stores.name` / `stores.slug` in the same `.or()` as product fields when the
 * select uses `stores!inner` — PostgREST often returns no rows or errors for that shape.
 *
 * Matching by brand name is handled elsewhere (e.g. navbar suggest queries `stores` separately).
 * Appending `store_id.in.(…)` into the same comma‑separated `or=` string is also unsafe (comma
 * parsing), so we keep a single coherent product `or` clause.
 */
export async function resolveMarketplaceSearchOrClause(
  _supabase: SupabaseClient,
  rawSearch: string | undefined
): Promise<string | null> {
  const s = rawSearch ? normalizeMarketplaceSearchInput(rawSearch) : "";
  if (!s) return null;
  return buildMarketplaceSearchOrFilter(s);
}
