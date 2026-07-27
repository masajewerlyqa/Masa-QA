import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';

type AlertBannerVariant = 'info' | 'success' | 'warning';

type AlertBannerProps = {
  title: string;
  message: string;
  variant?: AlertBannerVariant;
};

export function AlertBanner({
  title,
  message,
  variant = 'info',
}: AlertBannerProps): React.JSX.Element {
  return (
    <View style={[styles.container, variantStyles[variant].container]}>
      <Ionicons
        color={variantStyles[variant].iconColor}
        name={variantStyles[variant].icon}
        size={18}
      />
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    color: theme.colors.masaGray,
    fontSize: theme.typography.sizes.body,
    lineHeight: 20,
  },
});

const variantStyles: Record<
  AlertBannerVariant,
  {
    container: { backgroundColor: string; borderColor: string };
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
  }
> = {
  info: {
    container: {
      backgroundColor: theme.colors.masaLight,
      borderColor: theme.colors.border,
    },
    icon: 'information-circle-outline',
    iconColor: theme.colors.primary,
  },
  success: {
    container: {
      backgroundColor: '#EAF8EF',
      borderColor: '#A3D9B7',
    },
    icon: 'checkmark-circle-outline',
    iconColor: '#1E7A45',
  },
  warning: {
    container: {
      backgroundColor: '#FFF8EA',
      borderColor: '#E8CC8B',
    },
    icon: 'alert-circle-outline',
    iconColor: '#A37112',
  },
};
