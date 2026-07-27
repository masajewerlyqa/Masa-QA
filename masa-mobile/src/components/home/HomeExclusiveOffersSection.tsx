import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { goDiscover, goProduct } from '../../navigation/routes';
import { Product } from '../../types/catalog';
import { ProductCard } from '../ProductCard';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeExclusiveOffersSection({
  products,
}: {
  products: Product[];
}): React.JSX.Element | null {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';
  if (products.length === 0) return null;

  return (
    <LinearGradient
      colors={[theme.colors.exclusiveGradientTop, theme.colors.masaLight]}
      style={styles.exclusiveSection}
    >
      <View style={styles.exclusiveTopLine} />
      <ContentContainer>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderText}>
            <Text style={[styles.sectionTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
              {t('home.exclusiveOffers')}
            </Text>
            <Text style={styles.sectionSubtitle}>{t('home.exclusiveOffersSubtitle')}</Text>
          </View>
          <Pressable onPress={() => goDiscover()}>
            <Text style={styles.linkAction}>{t('home.viewAllOffers')} →</Text>
          </Pressable>
        </View>
        <FlatList
          contentContainerStyle={styles.horizontalList}
          data={products}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              onPress={() => goProduct(item.id)}
              product={item}
              width={theme.layout.exclusiveCardWidth}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      </ContentContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  exclusiveSection: { paddingVertical: theme.layout.sectionPy, position: 'relative' },
  exclusiveTopLine: {
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sectionHeaderRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  sectionHeaderText: { flex: 1, paddingRight: 12 },
  sectionTitle: { color: theme.colors.primary, fontSize: 30, lineHeight: 38, marginBottom: 8 },
  sectionSubtitle: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  linkAction: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  horizontalList: { gap: 24 },
});
