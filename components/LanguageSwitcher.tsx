"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/useI18n";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className={className}>
      <Button
        type="button"
        variant={language === "ar" ? "default" : "outline"}
        size="sm"
        className="h-8"
        onClick={() => setLanguage("ar")}
        aria-label={t("navbar.switchToArabic")}
      >
        {t("common.arabic")}
      </Button>
      <Button
        type="button"
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        className="h-8"
        onClick={() => setLanguage("en")}
        aria-label={t("navbar.switchToEnglish")}
      >
        {t("common.english")}
      </Button>
    </div>
  );
}
