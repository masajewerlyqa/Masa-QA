"use client";

import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/components/useI18n";
import type { Language } from "@/lib/language";

type LanguageDropdownProps = {
  triggerClassName?: string;
  contentClassName?: string;
  onLanguageSelected?: () => void;
};

export function LanguageDropdown({
  triggerClassName,
  contentClassName,
  onLanguageSelected,
}: LanguageDropdownProps) {
  const { language, setLanguage, t, isArabic } = useI18n();

  function pick(next: Language) {
    setLanguage(next);
    onLanguageSelected?.();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center justify-center rounded-sm p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${triggerClassName ?? "text-masa-dark hover:text-primary"}`}
        aria-label={isArabic ? "اختيار اللغة" : "Select language"}
      >
        <Globe className="w-5 h-5 shrink-0" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`min-w-[160px] font-sans ${contentClassName ?? ""}`}
      >
        <DropdownMenuItem
          onClick={() => pick("ar")}
          className="cursor-pointer justify-between gap-3"
        >
          <span className={language === "ar" ? "font-arabic font-medium" : "font-arabic"}>
            {t("common.arabic")}
          </span>
          {language === "ar" ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => pick("en")}
          className="cursor-pointer justify-between gap-3"
        >
          <span className={language === "en" ? "font-medium" : undefined}>{t("common.english")}</span>
          {language === "en" ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
