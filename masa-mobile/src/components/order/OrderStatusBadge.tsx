import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

/** Mirrors web `components/order/OrderStatusBadge.tsx` variant -> color mapping. */
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'warning' | 'success'> = {
  pending: 'outline',
  awaiting_seller: 'warning',
  accepted: 'secondary',
  processing: 'secondary',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'warning',
  refunded: 'outline',
  confirmed: 'secondary',
};

const VARIANT_STYLES: Record<string, { bg: string; text: string; border?: string }> = {
  default: { bg: theme.colors.primary, text: theme.colors.white },
  secondary: { bg: theme.colors.secondary, text: theme.colors.masaDark },
  outline: { bg: 'transparent', text: theme.colors.foreground, border: 'rgba(83,28,36,0.3)' },
  success: { bg: '#16A34A', text: theme.colors.white },
  warning: { bg: '#D97706', text: theme.colors.white },
};

function formatLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderStatusBadge({ status }: { status: string }): React.JSX.Element {
  const { t } = useSettings();
  const normalized = status.toLowerCase();
  const variant = STATUS_VARIANT[normalized] ?? 'outline';
  const colors = VARIANT_STYLES[variant];
  const label = t(`order.statuses.${normalized}`) || formatLabel(status);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        colors.border ? { borderColor: colors.border, borderWidth: 1 } : null,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
