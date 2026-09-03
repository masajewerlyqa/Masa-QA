import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MasaCard } from '../MasaCard';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';

/** Shared KPI tile for the seller and admin dashboards (web `StatsCard`). */
export function StatCard({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  /** When set the tile becomes a link into the matching list screen. */
  onPress?: () => void;
}): React.JSX.Element {
  const { isArabic } = useSettings();

  const body = (
    <MasaCard style={styles.card}>
      <View style={styles.row}>
        <Ionicons color={theme.colors.primary} name={icon} size={20} />
        <Text numberOfLines={2} style={[textStyle(isArabic, 'caption'), styles.label]}>
          {label}
        </Text>
        {onPress ? (
          <Ionicons
            color={theme.colors.masaGray}
            name={isArabic ? 'chevron-back' : 'chevron-forward'}
            size={14}
          />
        ) : null}
      </View>
      <Text style={[styles.value, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{value}</Text>
    </MasaCard>
  );

  // The grid item is always the outer element, so pressable and static tiles
  // occupy identical space in the wrapping flex row.
  if (!onPress) return <View style={styles.gridItem}>{body}</View>;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.gridItem}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, height: '100%' },
  gridItem: { flexBasis: '47%', flexGrow: 1 },
  label: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  value: { color: theme.colors.primary, fontSize: 20 },
});
