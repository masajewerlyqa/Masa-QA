import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Award, Shield, TrendingUp } from 'lucide-react-native';

import { MasaButton } from '../components/MasaButton';
import { MobileFooter } from '../components/MobileFooter';
import { ProductCard } from '../components/ProductCard';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X } from '../constants/layout';
import { ProductSkeleton } from '../components/ui/ProductSkeleton';
import { theme } from '../constants/theme';
import { fontFamily } from '../constants/theme';
import { resolveSiteUrl } from '../config/env';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import { goAuth, goProduct } from '../navigation/routes';
import { getProductById, getRelatedProducts } from '../services/productService';
import {
  getCustomerReviewForProduct,
  getProductReviews,
  getProductReviewStats,
  hasCustomerPurchasedProduct,
  submitReview,
} from '../services/reviewService';
import type { ProductReview, ProductReviewStats } from '../services/reviewService';
import type { RootStackParamList } from '../navigation/types';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { Product } from '../types/catalog';
import { formatCurrencyFromUsd, parseUsdPrice } from '../utils/currency';

type TabKey = 'description' | 'specifications' | 'reviews';

function Stars({ rating, size = 14 }: { rating: number; size?: number }): React.JSX.Element {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          color={i < Math.round(rating) ? theme.colors.masaGold : 'rgba(99,92,92,0.3)'}
          name="star"
          size={size}
        />
      ))}
    </View>
  );
}

export function ProductDetailsScreen(): React.JSX.Element {
  const { currency, language, t, isArabic } = useSettings();
  const { user } = useAuth();
  const route = useRoute<RouteProp<RootStackParamList, 'Product'>>();
  const productId = route.params?.productId ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [reviewStats, setReviewStats] = useState<ProductReviewStats>({
    averageRating: 0,
    reviewCount: 0,
  });
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [myReview, setMyReview] = useState<ProductReview | null>(null);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const inWishlist = useWishlistStore((s) => s.isInWishlist(productId));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  const refreshReviews = (): void => {
    void getProductReviewStats(productId).then(setReviewStats);
    void getProductReviews(productId).then(setReviews);
    if (user) {
      void getCustomerReviewForProduct(user.id, productId).then((review) => {
        setMyReview(review);
        if (review) {
          setFormRating(review.rating);
          setFormTitle(review.title ?? '');
          setFormBody(review.body ?? '');
        }
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setActiveImage(0);
    setActiveTab('description');
    setMyReview(null);
    setHasPurchased(false);
    setFormRating(5);
    setFormTitle('');
    setFormBody('');
    setSubmitError(null);

    if (!productId) {
      setProduct(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    getProductById(productId).then((result) => {
      if (!mounted) return;
      setProduct(result);
      setLoading(false);

      if (result) {
        void getProductReviewStats(productId).then((stats) => mounted && setReviewStats(stats));
        void getProductReviews(productId).then((list) => mounted && setReviews(list));
        if (result.storeId) {
          void getRelatedProducts(productId, result.storeId, result.category, 4).then(
            (list) => mounted && setRelated(list),
          );
        }
        if (user) {
          void hasCustomerPurchasedProduct(user.id, productId).then(
            (value) => mounted && setHasPurchased(value),
          );
          void getCustomerReviewForProduct(user.id, productId).then((review) => {
            if (!mounted) return;
            setMyReview(review);
            if (review) {
              setFormRating(review.rating);
              setFormTitle(review.title ?? '');
              setFormBody(review.body ?? '');
            }
          });
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [productId, user]);

  const handleSubmitReview = async (): Promise<void> => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitReview({
      productId,
      customerId: user.id,
      rating: formRating,
      title: formTitle,
      body: formBody,
    });
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(t('product.reviewSubmitFailed'));
      return;
    }
    refreshReviews();
  };

  if (loading) {
    return (
      <SiteShell>
        <View style={styles.skeletonWrap}>
          <ProductSkeleton variant="list" />
        </View>
      </SiteShell>
    );
  }

  if (!product) {
    return (
      <SiteShell>
        <View style={styles.center}>
          <Text style={styles.mutedText}>{t('product.unavailable') || 'Product unavailable.'}</Text>
        </View>
      </SiteShell>
    );
  }

  const priceUsd = product.priceUsd ?? parseUsdPrice(product.price);
  const displayPrice = formatCurrencyFromUsd(priceUsd, currency, language);
  const originalPriceUsd = product.originalPrice ? parseUsdPrice(product.originalPrice) : undefined;
  const displayOriginal = originalPriceUsd
    ? formatCurrencyFromUsd(originalPriceUsd, currency, language)
    : undefined;
  const discountPercent =
    originalPriceUsd && originalPriceUsd > priceUsd
      ? Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)
      : undefined;
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const luxury = fontFamily(isArabic, 'luxury');

  const onShare = async (): Promise<void> => {
    const site = resolveSiteUrl() ?? 'https://masajewelry.com';
    try {
      await Share.share({
        message: `${product.name} — ${displayPrice}\n${site}/product/${product.id}`,
      });
    } catch {
      // user dismissed share sheet — nothing to do
    }
  };

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: images[activeImage] }} style={styles.heroImage} />
        {images.length > 1 ? (
          <View style={styles.thumbRow}>
            {images.slice(0, 4).map((uri, idx) => (
              <Pressable key={uri + idx} onPress={() => setActiveImage(idx)}>
                <Image
                  source={{ uri }}
                  style={[styles.thumb, idx === activeImage ? styles.thumbActive : null]}
                />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.badgeRow}>
          {product.isNew ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>{t('product.newArrival')}</Text>
            </View>
          ) : null}
          <View style={styles.outlineBadge}>
            <Text style={styles.outlineBadgeText}>{t('product.certifiedAuthentic')}</Text>
          </View>
        </View>

        <Text style={[styles.title, { fontFamily: luxury }]}>{product.name}</Text>

        <View style={styles.storeRow}>
          {product.storeName ? (
            <View style={styles.storeNameWrap}>
              <Text style={styles.store}>{product.storeName}</Text>
              <Ionicons color={theme.colors.primary} name="checkmark-circle" size={14} />
            </View>
          ) : null}
          {reviewStats.reviewCount > 0 ? (
            <View style={styles.ratingWrap}>
              <Stars rating={reviewStats.averageRating} />
              <Text style={styles.ratingText}>
                {reviewStats.averageRating.toFixed(1)} •{' '}
                {reviewStats.reviewCount === 1 ? t('product.reviewWord') : t('product.reviewsWord')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { fontFamily: luxury }]}>{displayPrice}</Text>
          {displayOriginal ? <Text style={styles.originalPrice}>{displayOriginal}</Text> : null}
          {discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>
                {discountPercent}% {t('product.offSuffix')}
              </Text>
            </View>
          ) : null}
        </View>

        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}

        <View style={styles.actions}>
          <MasaButton
            icon="cart-outline"
            label={t('product.addToCart')}
            onPress={async () => {
              if (!user) {
                goAuth();
                return;
              }
              const result = await addItem(product.id, 1);
              if (!result.ok && result.error) {
                Alert.alert(result.error);
              }
            }}
            style={styles.addToCartButton}
          />
          <Pressable
            accessibilityLabel={t('product.addToWishlist')}
            onPress={async () => {
              if (!user) {
                goAuth();
                return;
              }
              const result = await toggleWishlist(product.id);
              if (!result.ok && result.error) {
                Alert.alert(result.error);
              }
            }}
            style={styles.iconAction}
          >
            <Ionicons
              color={theme.colors.primary}
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={22}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={t('product.share')}
            onPress={() => void onShare()}
            style={styles.iconAction}
          >
            <Ionicons color={theme.colors.primary} name="share-social-outline" size={22} />
          </Pressable>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Shield color={theme.colors.primary} size={20} />
            <Text style={styles.trustLabel}>{t('product.certifiedAuthentic')}</Text>
          </View>
          <View style={styles.trustItem}>
            <Award color={theme.colors.primary} size={20} />
            <Text style={styles.trustLabel}>{t('product.lifetimeWarranty')}</Text>
          </View>
          <View style={styles.trustItem}>
            <TrendingUp color={theme.colors.primary} size={20} />
            <Text style={styles.trustLabel}>{t('product.investmentValue')}</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {(
            [
              ['description', t('product.descriptionTab')],
              ['specifications', t('product.specificationsTab')],
              ['reviews', `${t('product.reviewsTab')} (${reviewStats.reviewCount})`],
            ] as [TabKey, string][]
          ).map(([key, label]) => (
            <Pressable key={key} onPress={() => setActiveTab(key)} style={styles.tabButton}>
              <Text style={[styles.tabText, activeTab === key ? styles.tabTextActive : null]}>
                {label}
              </Text>
              {activeTab === key ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          ))}
        </View>

        {activeTab === 'description' ? (
          <Text style={styles.tabContent}>
            {product.description ?? t('product.longDescriptionFallback')}
          </Text>
        ) : null}

        {activeTab === 'specifications' ? (
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>{t('product.metalTypeLabel')}</Text>
              <Text style={styles.specValue}>{product.metal ?? '—'}</Text>
            </View>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>{t('product.categoryLabel')}</Text>
              <Text style={styles.specValue}>{product.category}</Text>
            </View>
          </View>
        ) : null}

        {activeTab === 'reviews' ? (
          <View style={styles.reviewsWrap}>
            {(() => {
              const list =
                myReview && !reviews.some((r) => r.id === myReview.id)
                  ? [myReview, ...reviews]
                  : reviews;

              if (list.length === 0) {
                return <Text style={styles.mutedText}>{t('product.noReviewsYet')}</Text>;
              }

              return list.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Stars rating={review.rating} size={13} />
                    <View style={styles.reviewHeaderRight}>
                      {review.status === 'pending' ? (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>{t('product.pending')}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString(
                          isArabic ? 'ar' : 'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' },
                        )}
                      </Text>
                    </View>
                  </View>
                  {review.title ? <Text style={styles.reviewTitle}>{review.title}</Text> : null}
                  {review.body ? <Text style={styles.reviewBody}>{review.body}</Text> : null}
                  <Text style={styles.reviewMeta}>
                    {review.customerName ? `${review.customerName} • ` : ''}
                    {t('product.verifiedPurchase')}
                  </Text>
                </View>
              ));
            })()}

            <View style={styles.writeReviewSection}>
              <Text style={[styles.relatedTitle, { fontFamily: luxury, fontSize: 18 }]}>
                {t('product.writeReview')}
              </Text>

              {!user ? (
                <Text style={styles.mutedText}>
                  <Text onPress={() => goAuth()} style={styles.signInLink}>
                    {t('product.signIn')}
                  </Text>{' '}
                  {t('product.signInToReview')}
                </Text>
              ) : !hasPurchased ? (
                <Text style={styles.mutedText}>{t('product.purchasedOnlyReview')}</Text>
              ) : (
                <View style={styles.reviewForm}>
                  <Text style={styles.specLabel}>{t('product.yourRating')}</Text>
                  <View style={styles.starPicker}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Pressable key={value} onPress={() => setFormRating(value)}>
                        <Ionicons
                          color={value <= formRating ? theme.colors.masaGold : 'rgba(99,92,92,0.3)'}
                          name="star"
                          size={26}
                        />
                      </Pressable>
                    ))}
                  </View>

                  <Text style={styles.specLabel}>{t('product.titleOptional')}</Text>
                  <TextInput
                    onChangeText={setFormTitle}
                    placeholder={t('product.reviewTitlePlaceholder')}
                    placeholderTextColor={theme.colors.masaGray}
                    style={styles.reviewInput}
                    value={formTitle}
                  />

                  <Text style={styles.specLabel}>{t('product.commentOptional')}</Text>
                  <TextInput
                    multiline
                    numberOfLines={4}
                    onChangeText={setFormBody}
                    placeholder={t('product.reviewBodyPlaceholder')}
                    placeholderTextColor={theme.colors.masaGray}
                    style={[styles.reviewInput, styles.reviewTextarea]}
                    value={formBody}
                  />

                  {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

                  <MasaButton
                    disabled={submitting}
                    label={
                      submitting
                        ? t('common.saving')
                        : myReview
                          ? t('product.updateReview')
                          : t('product.submitReview')
                    }
                    onPress={() => void handleSubmitReview()}
                    style={styles.submitReviewButton}
                  />
                </View>
              )}
            </View>
          </View>
        ) : null}

        {related.length > 0 ? (
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { fontFamily: luxury }]}>
              {t('product.youMayAlsoLike')}
            </Text>
            <View style={styles.relatedGrid}>
              {related.map((item) => (
                <View key={item.id} style={styles.relatedItem}>
                  <ProductCard onPress={() => goProduct(item.id)} product={item} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <MobileFooter />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  skeletonWrap: {
    marginTop: theme.spacing.lg,
  },
  mutedText: {
    color: theme.colors.masaGray,
    fontSize: theme.typography.sizes.body,
  },
  content: {
    paddingBottom: 0,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: theme.spacing.lg,
  },
  heroImage: {
    aspectRatio: 1,
    backgroundColor: theme.colors.masaLight,
    borderRadius: theme.radius.xl,
    width: '100%',
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  thumb: {
    aspectRatio: 1,
    backgroundColor: theme.colors.masaLight,
    borderColor: 'transparent',
    borderRadius: theme.radius.md,
    borderWidth: 2,
    flex: 1,
  },
  thumbActive: {
    borderColor: theme.colors.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: theme.spacing.md,
  },
  newBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  outlineBadge: {
    borderColor: theme.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  outlineBadgeText: {
    color: theme.colors.masaDark,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.title,
    marginTop: theme.spacing.sm,
  },
  storeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginTop: theme.spacing.xs,
  },
  storeNameWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  store: {
    color: theme.colors.masaGray,
    fontSize: theme.typography.sizes.body,
  },
  ratingWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    color: theme.colors.masaGray,
    fontSize: 12,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  price: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  originalPrice: {
    color: theme.colors.masaGray,
    fontSize: theme.typography.sizes.bodyLg,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.body,
    lineHeight: 22,
    marginTop: theme.spacing.lg,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  addToCartButton: {
    flex: 1,
  },
  iconAction: {
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  trustRow: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  trustLabel: {
    color: theme.colors.masaGray,
    fontSize: 10,
    textAlign: 'center',
  },
  tabBar: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 20,
    marginTop: theme.spacing.xl,
  },
  tabButton: {
    paddingBottom: 10,
  },
  tabText: {
    color: theme.colors.masaGray,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  tabIndicator: {
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
    bottom: -1,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  tabContent: {
    color: theme.colors.foreground,
    fontSize: theme.typography.sizes.body,
    lineHeight: 22,
    paddingVertical: theme.spacing.lg,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  specItem: {
    minWidth: '45%',
  },
  specLabel: {
    color: theme.colors.masaGray,
    fontSize: 12,
    marginBottom: 2,
  },
  specValue: {
    color: theme.colors.foreground,
    fontSize: 14,
  },
  reviewsWrap: {
    paddingVertical: theme.spacing.lg,
  },
  reviewItem: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewDate: {
    color: theme.colors.masaGray,
    fontSize: 11,
  },
  reviewTitle: {
    color: theme.colors.foreground,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewBody: {
    color: theme.colors.masaGray,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewMeta: {
    color: theme.colors.masaGray,
    fontSize: 11,
    marginTop: 6,
  },
  relatedSection: {
    marginTop: theme.spacing.xl,
  },
  relatedTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    marginBottom: theme.spacing.lg,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  relatedItem: {
    width: '48.5%',
  },
  reviewHeaderRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pendingBadge: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    color: theme.colors.masaGray,
    fontSize: 10,
    fontWeight: '700',
  },
  writeReviewSection: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  signInLink: {
    color: theme.colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  reviewForm: {
    marginTop: theme.spacing.md,
  },
  starPicker: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.md,
    marginTop: 8,
  },
  reviewInput: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginBottom: theme.spacing.md,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewTextarea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  submitError: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: theme.spacing.sm,
  },
  submitReviewButton: {
    alignSelf: 'flex-start',
  },
});
