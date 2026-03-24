"use client";

import { useCurrency } from "@/components/CurrencyProvider";

type Props = { usd: number; className?: string };

/** Renders a USD amount in the current currency (for use in server or client trees). */
export function FormattedPrice({ usd, className }: Props) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(usd)}</span>;
}
