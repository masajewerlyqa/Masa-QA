"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_STORAGE_KEY,
  type Language,
  isLanguage,
  languageDirection,
} from "@/lib/language";

type LanguageContextValue = {
  language: Language;
  isArabic: boolean;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // ignore
  }
  return "en";
}

function applyDocumentLanguage(language: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = languageDirection(language);
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored !== language) {
      setLanguageState(stored);
      applyDocumentLanguage(stored);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, stored);
        document.cookie = `${LANGUAGE_COOKIE_KEY}=${stored}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        // ignore
      }
      // Keep server-rendered sections (hero/pages) aligned with stored preference.
      router.refresh();
      return;
    }
    applyDocumentLanguage(language);
  }, [language, router]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    if (nextLanguage === language) return;
    setLanguageState(nextLanguage);
    applyDocumentLanguage(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      document.cookie = `${LANGUAGE_COOKIE_KEY}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }
    // Force server components to re-render in the selected language.
    router.refresh();
  }, [language, router]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isArabic: language === "ar",
      setLanguage,
    }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
