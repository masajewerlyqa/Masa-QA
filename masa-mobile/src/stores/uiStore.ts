import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ColorSchemePreference = 'system' | 'light' | 'dark';

type UiState = {
  colorSchemePreference: ColorSchemePreference;
  setColorSchemePreference: (value: ColorSchemePreference) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      colorSchemePreference: 'system',
      setColorSchemePreference: (colorSchemePreference) => set({ colorSchemePreference }),
    }),
    {
      name: 'masa-ui',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
