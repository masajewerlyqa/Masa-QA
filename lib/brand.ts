import { t } from "@/lib/i18n";
import type { Language } from "@/lib/language";

/** Localized marketplace name: "MASA" (EN) / "ماسا" (AR). */
export function brandName(language: Language): string {
  return t(language, "common.brand");
}
