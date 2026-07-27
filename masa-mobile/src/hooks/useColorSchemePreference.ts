import type { ColorSchemePreference } from '../stores/uiStore';
import { useUiStore } from '../stores/uiStore';

export function useColorSchemePreference(): {
  colorSchemePreference: ColorSchemePreference;
  setColorSchemePreference: (value: ColorSchemePreference) => void;
} {
  const colorSchemePreference = useUiStore((s) => s.colorSchemePreference);
  const setColorSchemePreference = useUiStore((s) => s.setColorSchemePreference);
  return { colorSchemePreference, setColorSchemePreference };
}
