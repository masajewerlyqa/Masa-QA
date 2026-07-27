import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { textPresets, theme } from '../constants/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
}: SectionHeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? (
        <Pressable hitSlop={8} style={styles.actionWrap}>
          <Text style={styles.action}>{actionLabel}</Text>
          <Ionicons color={theme.colors.primary} name="chevron-forward" size={16} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  textBlock: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  title: {
    ...textPresets.sectionTitle,
  },
  subtitle: {
    ...textPresets.sectionSubtitle,
    marginTop: theme.spacing.xs,
  },
  action: {
    color: theme.colors.primary,
    fontFamily: theme.typography.body,
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    marginTop: 8,
  },
  actionWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
});
