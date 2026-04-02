import type { Language } from "@/lib/language";

/** BCP 47 locale for date/time formatting (Qatar). */
export function localeForLanguage(language: Language): string {
  return language === "ar" ? "ar-QA" : "en-QA";
}

export function formatShortDate(iso: string, language: Language): string {
  try {
    return new Date(iso).toLocaleDateString(localeForLanguage(language), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string, language: Language): string {
  try {
    return new Date(iso).toLocaleDateString(localeForLanguage(language), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatLongDateTime(iso: string, language: Language): string {
  try {
    return new Date(iso).toLocaleDateString(localeForLanguage(language), {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Admin analytics uses English month keys: Jan, Feb, … Dec */
const EN_MONTH_ABBREVS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function localizeEnglishMonthAbbrev(abbrev: string, language: Language): string {
  const i = EN_MONTH_ABBREVS.indexOf(abbrev as (typeof EN_MONTH_ABBREVS)[number]);
  if (i < 0) return abbrev;
  return new Date(2000, i, 15).toLocaleDateString(localeForLanguage(language), { month: "short" });
}
