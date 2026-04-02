/**
 * Map stored product.category values to marketplace.categories.* i18n keys.
 */

export function translateProductCategory(
  raw: string | null | undefined,
  t: (key: string, fallback?: string) => string
): string {
  if (raw == null || !String(raw).trim()) return "—";
  const slug = String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
  const key = `marketplace.categories.${slug}`;
  return t(key, raw);
}
