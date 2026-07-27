"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import { FREE_DELIVERY_THRESHOLD_USD } from "@/lib/currency";

export function NavbarTopBarPromo() {
  const { formatPrice } = useCurrency();
  const { t } = useI18n();
  return (
    <span className="shrink-0">
      {t("common.freeDeliveryOver", "Free delivery on orders over")} {formatPrice(FREE_DELIVERY_THRESHOLD_USD)}
    </span>
  );
}
