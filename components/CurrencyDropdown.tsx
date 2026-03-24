"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import type { Currency } from "@/lib/currency";

const LABELS: Record<Currency, string> = {
  USD: "USD $",
  QAR: "QAR ر.ق",
};

type CurrencyDropdownProps = {
  triggerClassName?: string;
  contentClassName?: string;
};

export function CurrencyDropdown({ triggerClassName, contentClassName }: CurrencyDropdownProps) {
  const { currency, setCurrency } = useCurrency();
  const { isArabic } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-1 text-masa-dark hover:text-primary transition-colors focus:outline-none font-sans text-sm ${triggerClassName ?? ""}`}
        aria-label={isArabic ? "اختيار العملة" : "Select currency"}
      >
        <span>{LABELS[currency]}</span>
        <ChevronDown className="w-4 h-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`min-w-[120px] font-sans ${contentClassName ?? ""}`}>
        <DropdownMenuItem
          onClick={() => setCurrency("USD")}
          className="cursor-pointer"
        >
          USD $
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setCurrency("QAR")}
          className="cursor-pointer"
        >
          QAR ر.ق
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
