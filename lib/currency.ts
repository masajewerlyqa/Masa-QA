/**
 * Currency constants and pure helpers.
 * Conversion only in UI; all DB and calculations remain in USD.
 */

export const CURRENCIES = ["USD", "QAR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Official display conversion for the whole app (UI, emails, seller tools). DB stores USD. */
export const USD_TO_QAR = 3.64;

export function convertPrice(priceUSD: number, toCurrency: Currency): number {
  if (toCurrency === "USD") return priceUSD;
  return Math.round(priceUSD * USD_TO_QAR * 100) / 100;
}

/** Convert a displayed amount (USD or QAR) back to USD for filters / API. */
export function displayAmountToUsd(amount: number, fromCurrency: Currency): number {
  if (!Number.isFinite(amount)) return 0;
  if (fromCurrency === "USD") return amount;
  return Math.round((amount / USD_TO_QAR) * 1e6) / 1e6;
}

export type FormatPriceOptions = {
  /** UI/email language: English uses "QAR", Arabic uses "ر.ق" for the same amount. */
  language?: "en" | "ar";
};

/** Format: USD "$ 120.00"; QAR uses "QAR" in English and "ر.ق" in Arabic. */
export function formatPrice(priceUSD: number, currency: Currency, options?: FormatPriceOptions): string {
  const amount = currency === "USD" ? priceUSD : convertPrice(priceUSD, "QAR");
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (currency === "USD") return `$ ${formatted}`;
  const lang = options?.language ?? "en";
  const qarPrefix = lang === "ar" ? "ر.ق" : "QAR";
  return `${qarPrefix} ${formatted}`;
}

export const CURRENCY_STORAGE_KEY = "masa-currency";
