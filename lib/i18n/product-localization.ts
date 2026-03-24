import type { Language } from "@/lib/language";

const CATEGORY_MAP: Record<string, string> = {
  ring: "خاتم",
  rings: "خواتم",
  necklace: "قلادة",
  necklaces: "قلائد",
  bracelet: "سوار",
  bracelets: "أساور",
  earring: "قرط",
  earrings: "أقراط",
  pendant: "تعليقة",
  pendants: "تعليقات",
  anklet: "خلخال",
  anklets: "خلاخيل",
  jewelry: "مجوهرات",
  jewellery: "مجوهرات",
};

const METAL_MAP: Record<string, string> = {
  gold: "ذهب",
  "white gold": "ذهب أبيض",
  "rose gold": "ذهب وردي",
  silver: "فضة",
  platinum: "بلاتين",
  diamond: "ألماس",
};

const PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bGold Ring\b/gi, "خاتم ذهب"],
  [/\bGold Necklace\b/gi, "قلادة ذهب"],
  [/\bGold Bracelet\b/gi, "سوار ذهب"],
  [/\bDiamond Ring\b/gi, "خاتم ألماس"],
  [/\bDiamond Necklace\b/gi, "قلادة ألماس"],
  [/\bEngagement Ring\b/gi, "خاتم خطوبة"],
  [/\bWedding Ring\b/gi, "خاتم زفاف"],
  [/\bLuxury Jewelry\b/gi, "مجوهرات فاخرة"],
];

const WORD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bring\b/gi, "خاتم"],
  [/\bracelet\b/gi, "سوار"],
  [/\bnecklace\b/gi, "قلادة"],
  [/\bearring\b/gi, "قرط"],
  [/\bpendant\b/gi, "تعليقة"],
  [/\bgold\b/gi, "ذهب"],
  [/\bsilver\b/gi, "فضة"],
  [/\bdiamond\b/gi, "ألماس"],
  [/\bplatinum\b/gi, "بلاتين"],
  [/\bluxury\b/gi, "فاخر"],
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function localizeProductCategory(value: string, language: Language): string {
  if (language !== "ar") return value;
  return CATEGORY_MAP[normalize(value)] ?? value;
}

export function localizeProductMetal(value: string, language: Language): string {
  if (language !== "ar") return value;
  return METAL_MAP[normalize(value)] ?? value;
}

export function localizeProductText(value: string, language: Language): string {
  if (language !== "ar") return value;
  let output = value;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of WORD_REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

