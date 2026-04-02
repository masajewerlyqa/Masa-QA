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

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrencyState(readStoredCurrency());
    setMounted(true);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {
      // ignore
    }
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
