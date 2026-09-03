import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import {
  getSellerReviews,
  getSellerStoreForUser,
  type SellerReviewRow,
} from '../../services/sellerDashboardService';
import { updateSellerReviewStatus } from '../../services/sellerWriteService';

/** Mirrors web `app/seller/reviews`: pending queue + approved/rejected history. */
export function SellerReviewsScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [storeId, setStoreId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<SellerReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const storeResult = await getSellerStoreForUser();
    if (!storeResult.ok || !storeResult.store) {
      setError(storeResult.ok ? t('seller.reviews.noStoreYet') : storeResult.error);
      return;
    }
    setStoreId(storeResult.store.id);
    setReviews(await getSellerReviews(storeResult.store.id));
    setError(null);
  }, [t]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await load();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const respond = async (reviewId: string, status: 'approved' | 'rejected'): Promise<void> => {
    setBusyId(reviewId);
    const result = await updateSellerReviewStatus(reviewId, status);
    setBusyId(null);
    if (!result.ok) {
      setError(
        status === 'approved' ? t('seller.reviews.failedApprove') : t('seller.reviews.failedReject'),
      );
      return;
    }
    await load();
  };

  const pending = reviews.filter((r) => r.status === 'pending');
  const decided = reviews.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl onRefresh={() => void onRefresh()} refreshing={refreshing} tintColor={theme.colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenBackButton label={t('seller.availability.backToDashboard')} />
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('seller.reviews.title')}</Text>
        <Text style={textStyle(isArabic, 'body')}>{t('seller.reviews.subtitle')}</Text>

        {error ? (
          <MasaCard style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </MasaCard>
        ) : null}

        {pending.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('seller.reviews.pending')}</Text>
            {pending.map((r) => (
              <MasaCard key={r.id} style={styles.reviewCard}>
                <ReviewBody r={r} t={t} isArabic={isArabic} />
                <View style={styles.actionRow}>
                  <MasaButton
                    disabled={busyId === r.id}
                    label={t('seller.reviews.approve')}
                    onPress={() => void respond(r.id, 'approved')}
                    style={styles.actionBtn}
                  />
                  <MasaButton
                    disabled={busyId === r.id}
                    label={t('seller.reviews.reject')}
                    onPress={() => void respond(r.id, 'rejected')}
                    style={styles.actionBtn}
                    variant="outline"
                  />
                </View>
              </MasaCard>
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {isArabic ? 'التقييمات المُراجعة' : 'Reviewed'}
          </Text>
          {decided.length === 0 ? (
            <Text style={textStyle(isArabic, 'body')}>{t('seller.reviews.noApprovedYet')}</Text>
          ) : (
            decided.map((r) => (
              <MasaCard key={r.id} style={styles.reviewCard}>
                <ReviewBody r={r} t={t} isArabic={isArabic} />
              </MasaCard>
            ))
          )}
        </View>
      </ScrollView>
    </SiteShell>
  );
}

function ReviewBody({
  r,
  t,
  isArabic,
}: {
  r: SellerReviewRow;
  t: (key: string) => string;
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <>
      <View style={styles.reviewHeader}>
        <Text style={textStyle(isArabic, 'bodySm')} numberOfLines={1}>
          {r.productName}
        </Text>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              color={theme.colors.masaGold}
              fill={i < r.rating ? theme.colors.masaGold : 'transparent'}
              size={14}
            />
          ))}
        </View>
      </View>
      <Text style={textStyle(isArabic, 'caption')}>
        {t('seller.reviews.byCustomer').replace('{name}', r.customerName ?? t('seller.reviews.customerFallback'))}
      </Text>
      {r.title ? <Text style={[textStyle(isArabic, 'bodySm'), styles.reviewTitle]}>{r.title}</Text> : null}
      {r.body ? <Text style={textStyle(isArabic, 'body')}>{r.body}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  actionBtn: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  errorCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  errorText: { color: '#dc2626', fontSize: 13 },
  loading: { marginTop: 60 },
  reviewCard: { gap: 4, marginBottom: 10 },
  reviewHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  reviewTitle: { fontWeight: '600' },
  section: { gap: 4 },
  sectionLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  starsRow: { flexDirection: 'row', gap: 2 },
  title: { color: theme.colors.primary, fontSize: 24 },
});
