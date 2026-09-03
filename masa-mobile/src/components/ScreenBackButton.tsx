import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

/** Explicit back affordance for root-stack screens (headerShown is false app-wide). */
export function ScreenBackButton({ label }: { label: string }): React.JSX.Element | null {
  const navigation = useNavigation();
  const { isArabic } = useSettings();

  if (!navigation.canGoBack()) return null;

  const Icon = isArabic ? ChevronRight : ChevronLeft;

  return (
    <Pressable hitSlop={8} onPress={() => navigation.goBack()} style={styles.row}>
      <Icon color={theme.colors.primary} size={18} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
});
