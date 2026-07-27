import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

type CategoryChipProps = {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
};

export function CategoryChip({
  label,
  isActive = false,
  onPress,
}: CategoryChipProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, isActive ? styles.activeChip : styles.inactiveChip]}
    >
      <Text style={[styles.label, isActive ? styles.activeLabel : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    marginRight: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactiveChip: {
    backgroundColor: theme.colors.masaLight,
  },
  label: {
    color: theme.colors.primary,
    fontFamily: theme.typography.body,
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
  },
  activeLabel: {
    color: theme.colors.white,
  },
});
