export const LANGUAGE_STORAGE_KEY = "masa-language";
export const LANGUAGE_COOKIE_KEY = "masa-language";

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export function isLanguage(value: string | null | undefined): value is Language {
  return value === "en" || value === "ar";
}

export function languageDirection(language: Language): "ltr" | "rtl" {
  return language === "ar" ? "rtl" : "ltr";
}

