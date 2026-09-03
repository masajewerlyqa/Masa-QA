import { PropsWithChildren, createContext, useContext, useMemo } from 'react';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';

import { t as translateKey, translateList } from '../i18n';
import {
  useSettingsStore,
  type AppCurrency,
  type AppLanguage,
} from '../stores/settingsStore';

export type { AppLanguage, AppCurrency };

type SettingsContextValue = {
  language: AppLanguage;
  currency: AppCurrency;
  searchQuery: string;
  isArabic: boolean;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: AppCurrency) => void;
  setSearchQuery: (query: string) => void;
  t: (key: string) => string;
  tList: (key: string) => string[];
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const language = useSettingsStore((s) => s.language);
  const currency = useSettingsStore((s) => s.currency);
  const searchQuery = useSettingsStore((s) => s.searchQuery);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setSearchQuery = useSettingsStore((s) => s.setSearchQuery);

  useEffect(() => {
    I18nManager.allowRTL(true);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      language,
      currency,
      searchQuery,
      isArabic: language === 'ar',
      setLanguage,
      setCurrency,
      setSearchQuery,
      t: (key: string) => translateKey(language, key),
      tList: (key: string) => translateList(language, key),
    }),
    [language, currency, searchQuery, setLanguage, setCurrency, setSearchQuery],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider.');
  }
  return context;
}
