/**
 * Types and constants for the AI Jewelry Advisor feature.
 * Modular design allows easy upgrade to real AI/LLM recommendations later.
 */

export const OCCASIONS = [
  { value: "wedding", label: "Wedding", labelFr: "Mariage" },
  { value: "engagement", label: "Engagement", labelFr: "Fiançailles" },
  { value: "anniversary", label: "Anniversary", labelFr: "Anniversaire" },
  { value: "birthday", label: "Birthday Gift", labelFr: "Cadeau d'anniversaire" },
  { value: "gift", label: "Special Gift", labelFr: "Cadeau spécial" },
  { value: "daily", label: "Daily Wear", labelFr: "Usage quotidien" },
  { value: "investment", label: "Luxury Investment", labelFr: "Investissement de luxe" },
  { value: "celebration", label: "Celebration", labelFr: "Célébration" },
] as const;

export const BUDGET_RANGES = [
  { value: "under500", label: "Under $500", min: 0, max: 500 },
  { value: "500to1000", label: "$500 - $1,000", min: 500, max: 1000 },
  { value: "1000to2500", label: "$1,000 - $2,500", min: 1000, max: 2500 },
  { value: "2500to5000", label: "$2,500 - $5,000", min: 2500, max: 5000 },
  { value: "5000to10000", label: "$5,000 - $10,000", min: 5000, max: 10000 },
  { value: "over10000", label: "Over $10,000", min: 10000, max: Infinity },
] as const;

export const METALS = [
  { value: "gold", label: "Gold", keywords: ["gold", "18k", "14k", "22k", "24k"] },
  { value: "white_gold", label: "White Gold", keywords: ["white gold"] },
  { value: "rose_gold", label: "Rose Gold", keywords: ["rose gold", "pink gold"] },
  { value: "platinum", label: "Platinum", keywords: ["platinum"] },
  { value: "silver", label: "Silver", keywords: ["silver", "sterling"] },
  { value: "diamond", label: "Diamond", keywords: ["diamond"] },
  { value: "any", label: "Any / No Preference", keywords: [] },
] as const;

export const CATEGORIES = [
  { value: "Ring", label: "Ring" },
  { value: "Necklace", label: "Necklace" },
  { value: "Bracelet", label: "Bracelet" },
  { value: "Earrings", label: "Earrings" },
  { value: "Pendant", label: "Pendant" },
  { value: "Anklet", label: "Anklet" },
  { value: "any", label: "Any / No Preference" },
] as const;

export const STYLES = [
  { value: "minimal", label: "Minimal", description: "Clean, simple, understated elegance" },
  { value: "classic", label: "Classic", description: "Timeless, traditional designs" },
  { value: "modern", label: "Modern", description: "Contemporary, trendy pieces" },
  { value: "luxury", label: "Luxury", description: "High-end, statement pieces" },
  { value: "bold", label: "Bold", description: "Eye-catching, unique designs" },
  { value: "any", label: "Any Style", description: "Open to all styles" },
] as const;

export const RECIPIENTS = [
  { value: "self", label: "For Myself" },
  { value: "woman", label: "For a Woman" },
  { value: "man", label: "For a Man" },
  { value: "any", label: "Not Specified" },
] as const;

export type AdvisorPreferences = {
  occasion: (typeof OCCASIONS)[number]["value"];
  budget: (typeof BUDGET_RANGES)[number]["value"];
  metal: (typeof METALS)[number]["value"];
  category: (typeof CATEGORIES)[number]["value"];
  style: (typeof STYLES)[number]["value"];
  recipient: (typeof RECIPIENTS)[number]["value"];
};

export type ProductRecommendation = {
  productId: string;
  matchScore: number;
  matchReasons: string[];
};

export type StoreRecommendation = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  matchReason: string;
};

export type AdvisorResponse = {
  products: ProductRecommendation[];
  stores: StoreRecommendation[];
  summary: string;
};
