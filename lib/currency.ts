/**
 * Currency constants and pure helpers.
 * Conversion only in UI; all DB and calculations remain in USD.
 */

export const CURRENCIES = ["USD", "QAR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const USD_TO_QAR = 3.64;

export function convertPrice(priceUSD: number, toCurrency: Currency): number {
  if (toCurrency === "USD") return priceUSD;
  return Math.round(priceUSD * USD_TO_QAR * 100) / 100;
}

/** Format as per spec: USD "$ 120.00", QAR "ر.ق 436.80" */
export function formatPrice(priceUSD: number, currency: Currency): string {
  const amount = currency === "USD" ? priceUSD : convertPrice(priceUSD, "QAR");
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === "USD") return `$ ${formatted}`;
  return `ر.ق ${formatted}`;
}

export const CURRENCY_STORAGE_KEY = "masa-currency";
