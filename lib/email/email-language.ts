import type { Language } from "@/lib/language";
import { isLanguage } from "@/lib/language";

/** Normalize API / DB / JSON value to a supported email locale. */
export function resolveEmailLanguage(value: unknown): Language {
  if (typeof value === "string" && isLanguage(value)) return value;
  return "en";
}
