import { CATEGORIES } from "@/lib/validations/product";

/** Map common URL/footer slugs to exact `products.category` values (see `CATEGORIES`). */
const SLUG_TO_CANONICAL: Record<string, string> = {
  ring: "Ring",
  rings: "Ring",
  necklace: "Necklace",
  necklaces: "Necklace",
  bracelet: "Bracelet",
  bracelets: "Bracelet",
  earring: "Earrings",
  earrings: "Earrings",
  pendant: "Pendant",
  pendants: "Pendant",
  anklet: "Anklet",
  anklets: "Anklet",
  other: "Other",
};

/** Normalize discover `category` query to the canonical DB label, or return trimmed raw if unknown. */
export function canonicalizeMarketplaceCategoryParam(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  const lower = t.toLowerCase();
  if (SLUG_TO_CANONICAL[lower]) return SLUG_TO_CANONICAL[lower];
  const fromEnum = CATEGORIES.find((c) => c.toLowerCase() === lower);
  if (fromEnum) return fromEnum;
  return t;
}

export function isMarketplaceCategoryAll(raw: string | null | undefined): boolean {
  if (raw == null || raw === "") return true;
  return /^all$/i.test(raw.trim());
}

/** Filter UI order: A–Z, then "Other" last (under all named categories). */
export function sortMarketplaceCategoriesForFilter(categories: string[]): string[] {
  const OTHER = "Other";
  const unique = [...new Set(categories)];
  const rest = unique.filter((c) => c !== OTHER).sort((a, b) => a.localeCompare(b));
  if (unique.includes(OTHER)) rest.push(OTHER);
  return rest;
}
