import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import { goAuth } from '../navigation/routes';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { Product } from '../types/catalog';
import { formatCurrencyFromUsd, parseUsdPrice } from '../utils/currency';

type ProductCardProps = {
  product: Product;
  onPress?: () => void;
  width?: number;
};

function StarRow({ rating }: { rating: number }): React.JSX.Element {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          color={i < Math.round(rating) ? theme.colors.masaGold : 'rgba(99,92,92,0.3)'}
          name="star"
          size={10}
        />
      ))}
    </View>
  );
}

function ProductCardComponent({
  product,
  onPress,
  width,
}: ProductCardProps): React.JSX.Element {
  const { currency, language, t } = useSettings();
  const { user } = useAuth();
  const isArabic = language === 'ar';
  const inWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  const displayPrice = formatCurrencyFromUsd(
    product.priceUsd ?? parseUsdPrice(product.price),
    currency,
    language,
  );
  const displayOriginalPrice = product.originalPrice
    ? formatCurrencyFromUsd(parseUsdPrice(product.originalPrice), currency, language)
    : undefined;
  const inStock = product.inStock !== false;

  const onWishlistPress = useCallback(async () => {
    if (!user) {
      goAuth();
      return;
    }
    const result = await toggleWishlist(product.id);
    if (!result.ok && result.error) {
      Alert.alert(result.error);
    }
  }, [product.id, t, toggleWishlist, user]);

  const onQuickAdd = useCallback(async () => {
    if (!user) {
      goAuth();
      return;
    }
    if (!inStock) {
      return;
    }
    const result = await addItem(product.id, 1);
    if (!result.ok && result.error) {
      Alert.alert(result.error);
    }
  }, [addItem, inStock, product.id, t, user]);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, width != null ? { width } : null]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        <View style={styles.badgeColumn}>
          {product.discountLabel ? (
            <View style={styles.discountBadge}>
              <Text style={styles.badgeText}>{product.discountLabel}</Text>
            </View>
          ) : null}
          {!inStock ? (
            <View style={styles.grayBadge}>
              <Text style={styles.badgeText}>{t('product.outOfStock')}</Text>
            </View>
          ) : null}
          {inStock && product.isNew && !product.discountLabel ? (
            <View style={styles.primaryBadge}>
              <Text style={styles.badgeText}>{t('product.new')}</Text>
            </View>
          ) : null}
          {inStock && product.isFeatured && !product.discountLabel ? (
            <View style={styles.goldBadge}>
              <Text style={styles.badgeText}>{t('product.featured')}</Text>
            </View>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel={t('product.addToWishlist')}
          onPress={(e) => {
            e.stopPropagation?.();
            void onWishlistPress();
          }}
          style={styles.wishlistBtn}
        >
          <Ionicons
            color={theme.colors.primary}
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={18}
          />
        </Pressable>
        {inStock ? (
          <Pressable
            accessibilityLabel={t('product.addToCart')}
            onPress={(e) => {
              e.stopPropagation?.();
              void onQuickAdd();
            }}
            style={styles.quickAddBtn}
          >
            <Ionicons color={theme.colors.white} name="cart-outline" size={16} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.brand}>
          {(product.brand ?? product.storeName ?? '').toUpperCase()}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.title, { fontFamily: fontFamily(isArabic, 'body') }]}
        >
          {product.name}
        </Text>
        {product.rating != null && (product.reviewCount ?? 0) > 0 ? (
          <StarRow rating={product.rating} />
        ) : null}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
            {displayPrice}
          </Text>
          {displayOriginalPrice ? (
            <Text style={styles.originalPrice}>{displayOriginalPrice}</Text>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.meta}>
          {product.category}
          {product.metal ? ` • ${product.metal}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: theme.colors.masaLight,
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  badgeColumn: {
    gap: 6,
    left: 8,
    position: 'absolute',
    top: 8,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(83, 28, 36, 0.95)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  primaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  goldBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.masaGold,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  grayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.masaGray,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  wishlistBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: theme.radius.full,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
  },
  quickAddBtn: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
    bottom: 8,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    width: 32,
  },
  content: {
    padding: 12,
  },
  brand: {
    color: theme.colors.masaGray,
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    color: theme.colors.foreground,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 4,
    minHeight: 32,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 4,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  price: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  originalPrice: {
    color: theme.colors.masaGray,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  meta: {
    color: theme.colors.masaGray,
    fontSize: 10,
  },
});
