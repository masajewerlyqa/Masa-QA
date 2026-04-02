"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import { USD_TO_QAR } from "@/lib/currency";

/** Shown in the user’s selected currency; canonical threshold is 1000 QAR. */
const FREE_DELIVERY_THRESHOLD_USD = 1000 / USD_TO_QAR;

export function NavbarTopBarPromo() {
  const { formatPrice } = useCurrency();
  const { t } = useI18n();
  return (
    <span className="shrink-0">
      {t("common.freeDeliveryOver", "Free delivery on orders over")} {formatPrice(FREE_DELIVERY_THRESHOLD_USD)}
    </span>
  );
}
