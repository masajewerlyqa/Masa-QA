/**
 * Supabase/PostgREST `.or()` filter on **products** columns only.
 * Do not add `stores.*` here — use `resolveMarketplaceSearchOrClause` (+ store_id.in) with `stores!inner`.
 * Matches substrings (e.g. one letter) on name, description, category, metal, karat, slug.
 */

/** Remove ILIKE wildcards so user input cannot broaden/trick the pattern; PG has no default escape. */
export function sanitizeForIlikeSubstring(s: string): string {
  return s.replace(/[%_\\]/g, "").trim();
}

/** Trim; commas → space (commas break PostgREST `or` argument parsing). */
export function normalizeMarketplaceSearchInput(raw: string): string {
  return raw
    .trim()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** `%safe%` for ILIKE substring match, or null if nothing to search. */
export function buildIlikeContainsPattern(raw: string): string | null {
  const normalized = normalizeMarketplaceSearchInput(raw);
  if (!normalized) return null;
  const safe = sanitizeForIlikeSubstring(normalized);
  if (!safe) return null;
  return `%${safe}%`;
}

/**
 * Returns PostgREST `or` filter string, or null if nothing to search.
 * Uses substring match (`%term%`) so single-character queries work.
 */
export function buildMarketplaceSearchOrFilter(raw: string): string | null {
  const term = buildIlikeContainsPattern(raw);
  if (!term) return null;
  return [
    `name.ilike.${term}`,
    `description.ilike.${term}`,
    `category.ilike.${term}`,
    `metal_type.ilike.${term}`,
    `gold_karat.ilike.${term}`,
    `slug.ilike.${term}`,
  ].join(",");
}
