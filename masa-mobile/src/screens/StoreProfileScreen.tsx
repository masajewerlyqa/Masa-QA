import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Mail, MapPin, Phone, Star } from 'lucide-react-native';

import { MasaBadge } from '../components/MasaBadge';
import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { MobileFooter } from '../components/MobileFooter';
import { ProductCard } from '../components/ProductCard';
import { ScreenBackButton } from '../components/ScreenBackButton';
import { StoreLocationMap } from '../components/store/StoreLocationMap';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { goProduct } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/types';
import { getProductsByStore } from '../services/productService';
import { getPublicStoreById, type PublicStore } from '../services/storeProfileService';
import type { Product } from '../types/catalog';

/** Mirrors web `app/(site)/store/[slug]/page.tsx`: cover, about, contact/location, policy, products. */
export function StoreProfileScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'StoreProfile'>>();
  const { storeId } = route.params;
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<PublicStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const [storeResult, productRows] = await Promise.all([
        getPublicStoreById(storeId),
        getProductsByStore(storeId),
      ]);
      if (!mounted) return;
      setStore(storeResult);
      setProducts(productRows);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [storeId]);

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </SiteShell>
    );
  }

  if (!store) {
    return (
      <SiteShell>
        <View style={styles.content}>
          <ScreenBackButton label={isArabic ? 'رجوع' : 'Back'} />
          <MasaCard>
            <Text style={textStyle(isArabic, 'body')}>
              {isArabic ? 'المتجر غير متاح.' : 'This store is not available.'}
            </Text>
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  const discounted = products.filter((p) => Boolean(p.discountLabel));
  const hasCoords = store.latitude != null && store.longitude != null;

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={isArabic ? 'رجوع' : 'Back'} />

        {/* Cover, mirroring web's gradient banner with logo + name overlaid. */}
        <View style={styles.cover}>
          {store.coverImage ? (
            <Image resizeMode="cover" source={{ uri: store.coverImage }} style={styles.coverImage} />
          ) : null}
          <View style={styles.coverOverlay} />
          <View style={styles.coverContent}>
            <MasaBadge label={isArabic ? 'علامة موثّقة' : 'Verified Brand'} variant="gold" />
            <Text style={[styles.storeName, { fontFamily: luxury }]}>{store.name}</Text>
            <View style={styles.metaRow}>
              <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    color={theme.colors.masaGold}
                    fill={i < Math.floor(store.rating) ? theme.colors.masaGold : 'transparent'}
                    size={14}
                  />
                ))}
              </View>
              <Text style={styles.metaText}>
                {store.rating} ({store.reviewCount} {isArabic ? 'تقييمات' : 'reviews'})
              </Text>
              <Text style={styles.metaText}>·</Text>
              <Text style={styles.metaText}>
                {store.productCount} {isArabic ? 'منتج' : 'Products'}
              </Text>
            </View>
          </View>
        </View>

        {store.logo ? (
          <Image resizeMode="contain" source={{ uri: store.logo }} style={styles.logo} />
        ) : null}

        {store.description ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {isArabic ? `حول ${store.name}` : `About ${store.name}`}
            </Text>
            <Text style={textStyle(isArabic, 'body')}>{store.description}</Text>
          </MasaCard>
        ) : null}

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {isArabic ? 'الموقع والتواصل' : 'Location & contact'}
          </Text>

          {store.location ? (
            <View style={styles.contactRow}>
              <MapPin color={theme.colors.primary} size={18} />
              <Text style={[textStyle(isArabic, 'bodySm'), styles.contactText]}>{store.location}</Text>
            </View>
          ) : null}
          {hasCoords ? (
            <StoreLocationMap latitude={store.latitude as number} longitude={store.longitude as number} />
          ) : (
            <Text style={[textStyle(isArabic, 'caption'), styles.noMap]}>
              {isArabic ? 'لم يتم تحديد موقع على الخريطة.' : 'No map location set.'}
            </Text>
          )}

          {store.phone ? (
            <View style={styles.contactRow}>
              <Phone color={theme.colors.primary} size={18} />
              <Text style={[textStyle(isArabic, 'bodySm'), styles.contactText]}>{store.phone}</Text>
            </View>
          ) : null}
          {store.email ? (
            <View style={styles.contactRow}>
              <Mail color={theme.colors.primary} size={18} />
              <Text style={[textStyle(isArabic, 'bodySm'), styles.contactText]}>{store.email}</Text>
            </View>
          ) : null}

          {store.phone ? (
            <MasaButton
              label={isArabic ? 'تواصل مع المتجر' : 'Contact Store'}
              onPress={() => void Linking.openURL(`tel:${store.phone}`)}
              style={styles.contactBtn}
            />
          ) : null}
        </MasaCard>

        {store.policy ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {t('storefront.storePolicyTitle')}
            </Text>
            <Text style={[textStyle(isArabic, 'caption'), styles.policyIntro]}>
              {t('storefront.storePolicyIntro')}
            </Text>
            <Text style={textStyle(isArabic, 'bodySm')}>
              •{' '}
              {store.policy.returnsEnabled
                ? t('account.orders.policyReturnsOn').replace('{{n}}', String(store.policy.returnPeriodDays))
                : t('account.orders.policyReturnsOff')}
            </Text>
            <Text style={textStyle(isArabic, 'bodySm')}>
              •{' '}
              {store.policy.exchangesEnabled
                ? t('account.orders.policyExchangesOn').replace(
                    '{{n}}',
                    String(store.policy.exchangePeriodDays),
                  )
                : t('account.orders.policyExchangesOff')}
            </Text>
            {store.policy.sameDayDeliveryEnabled && store.policy.sameDayCutoffLocal ? (
              <Text style={textStyle(isArabic, 'bodySm')}>
                • {t('account.orders.policySameDay').replace('{{t}}', store.policy.sameDayCutoffLocal.slice(0, 5))}
              </Text>
            ) : null}
            {store.policy.customConditions?.trim() ? (
              <View style={styles.conditionsBox}>
                <Text style={[textStyle(isArabic, 'caption'), styles.conditionsLabel]}>
                  {t('account.orders.policyConditions')}
                </Text>
                <Text style={textStyle(isArabic, 'bodySm')}>{store.policy.customConditions.trim()}</Text>
              </View>
            ) : null}
          </MasaCard>
        ) : null}

        {discounted.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { fontFamily: luxury }]}>
              {isArabic ? 'عروض العلامة' : 'Brand Offers'}
            </Text>
            <View style={styles.productGrid}>
              {discounted.map((p) => (
                <View key={p.id} style={styles.productItem}>
                  <ProductCard onPress={() => goProduct(p.id)} product={p} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { fontFamily: luxury }]}>
            {discounted.length > 0
              ? isArabic
                ? 'كل المنتجات'
                : 'All Products'
              : isArabic
                ? 'المنتجات'
                : 'Products'}
          </Text>
          {products.length === 0 ? (
            <MasaCard>
              <Text style={textStyle(isArabic, 'body')}>
                {isArabic ? 'لا توجد منتجات بعد.' : 'No products yet.'}
              </Text>
            </MasaCard>
          ) : (
            <View style={styles.productGrid}>
              {products.map((p) => (
                <View key={p.id} style={styles.productItem}>
                  <ProductCard onPress={() => goProduct(p.id)} product={p} />
                </View>
              ))}
            </View>
          )}
        </View>

        <MobileFooter />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  conditionsBox: {
    backgroundColor: theme.colors.masaLight,
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    padding: 12,
  },
  conditionsLabel: { marginBottom: 4 },
  contactBtn: { marginTop: 8 },
  contactRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginVertical: 6 },
  contactText: { flex: 1 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  cover: {
    borderRadius: 16,
    height: 180,
    overflow: 'hidden',
  },
  coverContent: {
    bottom: 0,
    gap: 6,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
    opacity: 0.55,
  },
  loading: { marginTop: 60 },
  logo: {
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 64,
    marginTop: -40,
    marginLeft: 16,
    width: 64,
  },
  metaRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaText: { color: theme.colors.secondary, fontSize: 13 },
  noMap: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: 8,
    marginVertical: 6,
    padding: 16,
    textAlign: 'center',
  },
  policyIntro: { marginBottom: 4 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productItem: { width: '47%' },
  section: { gap: 12 },
  sectionHeading: { color: theme.colors.primary, fontSize: 22 },
  sectionTitle: { color: theme.colors.primary, fontSize: 16 },
  starsRow: { flexDirection: 'row', gap: 1 },
  storeName: { color: theme.colors.white, fontSize: 24 },
});
