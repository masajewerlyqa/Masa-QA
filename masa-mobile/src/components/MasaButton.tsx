import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type MasaButtonVariant = 'primary' | 'secondary' | 'outline' | 'outlineLight' | 'ghost' | 'light';
type VariantStyle = { button: ViewStyle; text: TextStyle };

type MasaButtonProps = {
  label: string;
  variant?: MasaButtonVariant;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  onPress?: () => void;
};

export function MasaButton({
  label,
  variant = 'primary',
  style,
  icon,
  disabled = false,
  onPress,
}: MasaButtonProps): React.JSX.Element {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant].button,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          color={variantStyles[variant].text.color}
          name={icon}
          size={16}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.text, variantStyles[variant].text]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.88,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
  },
});

const variantStyles: Record<MasaButtonVariant, VariantStyle> = {
  primary: {
    button: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    text: { color: theme.colors.white },
  },
  secondary: {
    button: {
      backgroundColor: theme.colors.secondary,
      borderColor: theme.colors.secondary,
    },
    text: { color: theme.colors.primary },
  },
  outline: {
    button: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
    },
    text: { color: theme.colors.primary },
  },
  outlineLight: {
    button: {
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,0.4)',
    },
    text: { color: theme.colors.white },
  },
  ghost: {
    button: {
      backgroundColor: theme.colors.masaLight,
      borderColor: theme.colors.border,
    },
    text: { color: theme.colors.primary },
  },
  /** Web `bg-white text-primary` — a CTA sitting on a primary-colored section. */
  light: {
    button: {
      backgroundColor: theme.colors.white,
      borderColor: theme.colors.white,
    },
    text: { color: theme.colors.primary },
  },
};
