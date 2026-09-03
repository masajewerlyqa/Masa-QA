import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { MasaCard } from '../MasaCard';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';

/** Shared KPI tile for the seller and admin dashboards (web `StatsCard`). */
export function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}): React.JSX.Element {
  const { isArabic } = useSettings();

  return (
    <MasaCard style={styles.card}>
      <View style={styles.row}>
        <Ionicons color={theme.colors.primary} name={icon} size={20} />
        <Text numberOfLines={2} style={[textStyle(isArabic, 'caption'), styles.label]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{value}</Text>
    </MasaCard>
  );
}

const styles = StyleSheet.create({
  card: { flexGrow: 1, flexBasis: '47%', gap: 8 },
  label: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  value: { color: theme.colors.primary, fontSize: 20 },
});
