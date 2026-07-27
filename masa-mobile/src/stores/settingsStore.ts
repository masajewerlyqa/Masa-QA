import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppLanguage = 'en' | 'ar';
export type AppCurrency = 'USD' | 'QAR';

type SettingsState = {
  language: AppLanguage;
  currency: AppCurrency;
  searchQuery: string;
  hydrated: boolean;
  setLanguage: (language: AppLanguage) => void;
  setCurrency: (currency: AppCurrency) => void;
  setSearchQuery: (query: string) => void;
  setHydrated: (hydrated: boolean) => void;
};

function applyRtl(language: AppLanguage): void {
  const rtl = language === 'ar';
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      currency: 'USD',
      searchQuery: '',
      hydrated: false,
      setLanguage: (language) => {
        applyRtl(language);
        set({ language });
      },
      setCurrency: (currency) => set({ currency }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'masa-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyRtl(state.language);
          state.setHydrated(true);
        }
      },
    },
  ),
);
