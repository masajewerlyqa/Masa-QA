"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  type Currency,
  formatPrice as formatPriceUtil,
  convertPrice as convertPriceUtil,
  CURRENCY_STORAGE_KEY,
} from "@/lib/currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convertPrice: (priceUSD: number) => number;
  formatPrice: (priceUSD: number, forceCurrency?: Currency) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): Currency {
  if (typeof window === "undefined") return "USD";
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored === "USD" || stored === "QAR") return stored;
  } catch {
    // ignore
  }
  return "USD";
}

function persistCurrency(c: Currency) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    document.cookie = `${CURRENCY_STORAGE_KEY}=${c}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // ignore
  }
}

export function CurrencyProvider({
  children,
  initialCurrency,
}: {
  children: ReactNode;
  /** Read server-side from the currency cookie so first paint already matches the stored
   * preference — avoids both a flash back to USD and a hydration mismatch. */
  initialCurrency: Currency;
}) {
  const { language } = useLanguage();
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  useEffect(() => {
    // Cookie may be missing/stale (e.g. cleared) while localStorage still has a preference —
    // reconcile once after mount. No page-content depends on currency server-side, so no
    // router.refresh() is needed here (unlike language).
    const stored = readStoredCurrency();
    if (stored !== currency) {
      setCurrencyState(stored);
      persistCurrency(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    persistCurrency(c);
  }, []);

  const convertPrice = useCallback(
    (priceUSD: number) => convertPriceUtil(priceUSD, currency),
    [currency]
  );

  const formatPrice = useCallback(
    (priceUSD: number, forceCurrency?: Currency) =>
      formatPriceUtil(priceUSD, forceCurrency ?? currency, { language }),
    [currency, language]
  );

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
