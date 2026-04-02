/**
 * Display helpers for QAR gold amounts (client or server safe).
 */

export function formatGoldPriceQAR(
  amount: number,
  options?: { locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const locale = options?.locale ?? "en-QA";
  const min = options?.minimumFractionDigits ?? 2;
  const max = options?.maximumFractionDigits ?? 2;
  if (!Number.isFinite(amount)) return "—";
  return `${amount.toLocaleString(locale, { minimumFractionDigits: min, maximumFractionDigits: max })} QAR`;
}

export function formatGoldPriceCompact(amount: number, locale = "en-US"): string {
  if (!Number.isFinite(amount)) return "—";
  return amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
