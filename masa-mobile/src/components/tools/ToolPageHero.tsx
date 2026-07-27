import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

type ToolPageHeroProps = {
  title: string;
  subtitle: string;
  badge?: string;
};

export function ToolPageHero({ title, subtitle, badge }: ToolPageHeroProps): React.JSX.Element {
  const { language } = useSettings();
  const isArabic = language === 'ar';

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.primary]} style={styles.hero}>
      <View style={styles.inner}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
        <Text style={[styles.title, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontFamily: fontFamily(isArabic, 'body') }]}>{subtitle}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 48, paddingTop: 56 },
  inner: { paddingHorizontal: theme.layout.screenPaddingX },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(231, 216, 195, 0.2)',
    borderRadius: theme.radius.full,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '600' },
  title: { color: theme.colors.white, fontSize: 30, lineHeight: 38, marginBottom: 8 },
  subtitle: { color: theme.colors.secondary, fontSize: 16, lineHeight: 24 },
});
