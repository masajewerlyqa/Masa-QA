"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";

export function NavbarTopBarPromo() {
  const { formatPrice } = useCurrency();
  const { t, isArabic } = useI18n();
  return (
    <>
      <span>{t("common.freeDeliveryOver", "Free delivery on orders over")} {formatPrice(500)}</span>
      <span className="text-secondary hidden sm:inline" aria-hidden>|</span>
      <span className="hidden sm:inline">{t("common.goldPrice", "Gold Price")}: {formatPrice(1945)}{isArabic ? "/أونصة" : "/oz"}</span>
    </>
  );
}
