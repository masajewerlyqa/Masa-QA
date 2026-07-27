import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeBrandsSection({ brands }: { brands: string[] }): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  return (
    <View style={styles.whiteSection}>
      <ContentContainer>
        <Text style={[styles.sectionTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
          {t('home.brandsTitle')}
        </Text>
        <Text style={styles.sectionSubtitle}>{t('home.brandsSubtitle')}</Text>
        <View style={styles.brandsGrid}>
          {brands.map((brand) => (
            <View key={brand} style={styles.brandTile}>
              <Text style={styles.brandText}>{brand}</Text>
            </View>
          ))}
        </View>
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteSection: { backgroundColor: theme.colors.background, paddingVertical: theme.layout.sectionPy },
  sectionTitle: { color: theme.colors.primary, fontSize: 30, lineHeight: 38, marginBottom: 8 },
  sectionSubtitle: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  brandsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  brandTile: { alignItems: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border, borderRadius: theme.radius.lg, borderWidth: 1, justifyContent: 'center', minHeight: 96, padding: 8, width: '31%' },
  brandText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
