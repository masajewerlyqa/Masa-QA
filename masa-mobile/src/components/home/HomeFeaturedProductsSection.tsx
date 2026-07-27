import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { goDiscover, goProduct } from '../../navigation/routes';
import { Product } from '../../types/catalog';
import { ProductCard } from '../ProductCard';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeFeaturedProductsSection({
  products,
}: {
  products: Product[];
}): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  return (
    <View style={styles.whiteSection}>
      <ContentContainer>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
              {t('home.latestTitle')}
            </Text>
            <Text style={styles.sectionSubtitle}>{t('home.latestSubtitle')}</Text>
          </View>
          <Pressable onPress={() => goDiscover()}>
            <Text style={styles.linkAction}>{t('home.viewAll')}</Text>
          </Pressable>
        </View>
        <View style={styles.productGrid}>
          {products.map((item) => (
            <View key={item.id} style={styles.productGridItem}>
              <ProductCard onPress={() => goProduct(item.id)} product={item} />
            </View>
          ))}
        </View>
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteSection: { backgroundColor: theme.colors.background, paddingVertical: theme.layout.sectionPy },
  sectionHeaderRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  sectionTitle: { color: theme.colors.primary, fontSize: 30, lineHeight: 38, marginBottom: 8 },
  sectionSubtitle: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  linkAction: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.layout.productGridGap },
  productGridItem: { width: '48%' },
});
