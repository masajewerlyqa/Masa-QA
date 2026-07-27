import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { theme } from '../constants/theme';

type MasaBadgeVariant = 'primary' | 'gold' | 'muted' | 'success';
type VariantStyle = { container: ViewStyle; text: TextStyle };

type MasaBadgeProps = {
  label: string;
  variant?: MasaBadgeVariant;
};

export function MasaBadge({
  label,
  variant = 'primary',
}: MasaBadgeProps): React.JSX.Element {
  return (
    <View style={[styles.badge, variantStyles[variant].container]}>
      <Text style={[styles.text, variantStyles[variant].text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  text: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: '700',
  },
});

const variantStyles: Record<MasaBadgeVariant, VariantStyle> = {
  primary: {
    container: { backgroundColor: theme.colors.primary },
    text: { color: theme.colors.white },
  },
  gold: {
    container: { backgroundColor: theme.colors.masaGold },
    text: { color: theme.colors.white },
  },
  muted: {
    container: { backgroundColor: theme.colors.masaLight },
    text: { color: theme.colors.primary },
  },
  success: {
    container: { backgroundColor: '#1E7A45' },
    text: { color: theme.colors.white },
  },
};
