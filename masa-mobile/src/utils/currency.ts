import type { AppCurrency, AppLanguage } from '../stores/settingsStore';

const QAR_RATE = 3.64;

export function parseUsdPrice(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function convertPrice(priceUSD: number, currency: AppCurrency): number {
  if (currency === 'USD') {
    return priceUSD;
  }
  return Math.round(priceUSD * QAR_RATE * 100) / 100;
}

/** Matches web `formatPrice` (USD "$ 120"; QAR / ر.ق). Rounded to whole units — no cents/fils. */
export function formatPrice(
  priceUSD: number,
  currency: AppCurrency,
  language: AppLanguage = 'en',
): string {
  const amount = convertPrice(priceUSD, currency);
  const formatted = Math.round(amount).toLocaleString('en-US');
  if (currency === 'USD') {
    return `$ ${formatted}`;
  }
  const qarPrefix = language === 'ar' ? 'ر.ق' : 'QAR';
  return `${qarPrefix} ${formatted}`;
}

export function formatCurrencyFromUsd(
  usdAmount: number,
  currency: AppCurrency,
  language: AppLanguage = 'en',
): string {
  return formatPrice(usdAmount, currency, language);
}
