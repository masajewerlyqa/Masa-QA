import { useCallback, useEffect } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MobileFooter } from '../components/MobileFooter';
import { ProductCard } from '../components/ProductCard';
import { SiteShell } from '../components/layout/SiteShell';
import { ProductSkeletonGrid } from '../components/ui/ProductSkeleton';
import { MOBILE_CONTENT_PADDING_X } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../context/SettingsContext';
import { goAuth, goDiscover, goProduct } from '../navigation/routes';
import { useWishlistStore } from '../stores/wishlistStore';

const GRID_GAP = 12;
const COLS = 2;

/** Matches web `/wishlist` — title, subtitle, 2-column product grid */
export function WishlistScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { isArabic, t } = useSettings();
  const products = useWishlistStore((s) => s.products);
  const isLoading = useWishlistStore((s) => s.isLoading);
  const refresh = useWishlistStore((s) => s.refresh);
  const luxury = fontFamily(isArabic, 'luxury');

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - MOBILE_CONTENT_PADDING_X * 2 - GRID_GAP) / COLS;

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  const subtitle =
    products.length === 0
      ? isArabic
        ? 'قائمة المفضلة فارغة حالياً.'
        : 'Your wishlist is empty.'
      : isArabic
        ? `${products.length} ${products.length === 1 ? 'منتج محفوظ' : 'منتجات محفوظة'}`
        : `${products.length} item${products.length === 1 ? '' : 's'} saved`;

  const renderItem = useCallback(
    ({ item }: { item: (typeof products)[number] }) => (
      <View style={{ width: cardWidth, marginBottom: GRID_GAP }}>
        <ProductCard onPress={() => goProduct(item.id)} product={item} width={cardWidth} />
      </View>
    ),
    [cardWidth],
  );

  return (
    <SiteShell>
      <FlatList
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        data={user ? products : []}
        initialNumToRender={6}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isLoading ? (
            <ProductSkeletonGrid count={4} />
          ) : user ? (
            <View style={styles.emptyWrap}>
              <MasaButton
                label={isArabic ? 'اكتشف المجوهرات' : 'Discover jewelry'}
                onPress={() => goDiscover()}
              />
            </View>
          ) : null
        }
        ListFooterComponent={<MobileFooter />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { fontFamily: luxury }]}>
              {isArabic ? 'المفضلة' : 'Wishlist'}
            </Text>
            <Text style={[textStyle(isArabic, 'body'), styles.subtitle]}>{subtitle}</Text>
            {!user ? (
              <View style={styles.guestBlock}>
                <Text style={textStyle(isArabic, 'body')}>
                  {isArabic ? 'سجّل الدخول لمزامنة قائمة المفضلة.' : 'Sign in to sync your wishlist.'}
                </Text>
                <MasaButton label={t('auth.register.signIn')} onPress={() => goAuth()} />
              </View>
            ) : null}
          </View>
        }
        numColumns={COLS}
        onRefresh={() => void refresh()}
        refreshing={isLoading}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
  guestBlock: {
    gap: 12,
    marginTop: 8,
  },
  row: {
    gap: GRID_GAP,
    justifyContent: 'space-between',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
  },
});
