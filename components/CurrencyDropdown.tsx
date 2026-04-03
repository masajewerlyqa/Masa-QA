"use client";

import { CircleDollarSign, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import type { Currency } from "@/lib/currency";

function currencyLabels(isArabic: boolean): Record<Currency, string> {
  return {
    USD: "USD $",
    QAR: isArabic ? "ر.ق" : "QAR",
  };
}

type CurrencyDropdownProps = {
  triggerClassName?: string;
  contentClassName?: string;
  /** e.g. close mobile drawer after picking a currency */
  onCurrencySelected?: () => void;
};

export function CurrencyDropdown({
  triggerClassName,
  contentClassName,
  onCurrencySelected,
}: CurrencyDropdownProps) {
  const { currency, setCurrency } = useCurrency();
  const { isArabic } = useI18n();
  const labels = currencyLabels(isArabic);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={`flex items-center justify-center rounded-sm p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${triggerClassName ?? "text-masa-dark hover:text-primary"}`}
        aria-label={isArabic ? "اختيار العملة" : "Select currency"}
      >
        <CircleDollarSign className="h-5 w-5 shrink-0" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`min-w-[160px] font-sans ${contentClassName ?? ""}`}>
        <DropdownMenuItem
          onSelect={() => {
            setCurrency("USD");
            onCurrencySelected?.();
          }}
          className="cursor-pointer justify-between gap-3"
        >
          <span className={currency === "USD" ? "font-medium" : undefined}>{labels.USD}</span>
          {currency === "USD" ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            setCurrency("QAR");
            onCurrencySelected?.();
          }}
          className="cursor-pointer justify-between gap-3"
        >
          <span className={currency === "QAR" ? "font-medium" : undefined}>{labels.QAR}</span>
          {currency === "QAR" ? <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
