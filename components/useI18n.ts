"use client";

import { useMemo } from "react";
import { createTranslator, getDictionary } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export function useI18n() {
  const { language, isArabic, setLanguage } = useLanguage();

  const t = useMemo(() => createTranslator(language), [language]);
  const dict = useMemo(() => getDictionary(language), [language]);

  return { language, isArabic, setLanguage, t, dict };
}

export default useI18n;
