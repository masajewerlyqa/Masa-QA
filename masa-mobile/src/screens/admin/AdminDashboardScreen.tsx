import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { StatCard } from '../../components/dashboard/StatCard';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { goAdminList, goHome } from '../../navigation/routes';
import {
  getAdminMetrics,
  getAdminRecentApplications,
  getAdminRecentOrders,
  type AdminMetrics,
  type AdminRecentApplication,
  type AdminRecentOrder,
} from '../../services/adminDashboardService';
import { formatOrderDisplayRef } from '../../services/orderHistoryService';
import { formatCurrencyFromUsd } from '../../utils/currency';

/** Mirrors web `/admin` overview. Read-only; admin mutations are separate screens. */
export function AdminDashboardScreen(): React.JSX.Element {
  const { t, isArabic, currency, language } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<AdminRecentOrder[]>([]);
  const [applications, setApplications] = useState<AdminRecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getAdminMetrics();
    if (!result.ok) {
      setError(result.error);
      setMetrics(null);
      return;
    }
    setError(null);
    setMetrics(result.metrics);
    const [orderRows, applicationRows] = await Promise.all([
      getAdminRecentOrders(10),
      getAdminRecentApplications(10),
    ]);
    setOrders(orderRows);
    setApplications(applicationRows);
  }, []);

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

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </SiteShell>
    );
  }

  if (error) {
    return (
      <SiteShell>
        <View style={styles.content}>
          <ScreenBackButton label={t('seller.overview.backHome')} />
          <MasaCard style={styles.card}>
            <Text style={textStyle(isArabic, 'body')}>{error}</Text>
            <MasaButton
              label={t('seller.overview.backHome')}
              onPress={() => goHome()}
              variant="outline"
            />
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void onRefresh()}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenBackButton label={t('seller.overview.backHome')} />
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('admin.overview.platformOverview')}</Text>

        <View style={styles.statGrid}>
          <StatCard
            icon="people-outline"
            label={t('admin.overview.totalUsers')}
            value={String(metrics?.totalUsers ?? 0)}
          />
          <StatCard
            icon="storefront-outline"
            label={t('admin.overview.totalStores')}
            onPress={() => goAdminList('stores')}
            value={String(metrics?.totalStores ?? 0)}
          />
          <StatCard
            icon="cube-outline"
            label={t('admin.overview.totalProducts')}
            onPress={() => goAdminList('products')}
            value={String(metrics?.totalProducts ?? 0)}
          />
          <StatCard
            icon="receipt-outline"
            label={t('admin.overview.totalOrders')}
            onPress={() => goAdminList('orders')}
            value={String(metrics?.totalOrders ?? 0)}
          />
          <StatCard
            icon="cash-outline"
            label={t('admin.overview.totalRevenue')}
            value={formatCurrencyFromUsd(metrics?.totalRevenue ?? 0, currency, language)}
          />
          <StatCard
            icon="trending-up-outline"
            label={t('admin.overview.totalCommissions')}
            value={formatCurrencyFromUsd(metrics?.totalCommissions ?? 0, currency, language)}
          />
          <StatCard
            icon="hourglass-outline"
            label={t('admin.overview.pendingApplications')}
            value={String(metrics?.pendingSellerApplications ?? 0)}
          />
          <StatCard
            icon="ribbon-outline"
            label={t('admin.overview.totalSellers')}
            onPress={() => goAdminList('sellers')}
            value={String(metrics?.totalSellers ?? 0)}
          />
        </View>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('admin.overview.recentOrders')}
          </Text>
          {orders.length === 0 ? (
            <Text style={textStyle(isArabic, 'body')}>{t('seller.overview.noOrdersYet')}</Text>
          ) : (
            orders.map((o) => (
              <View key={o.id} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text numberOfLines={1} style={textStyle(isArabic, 'bodySm')}>
                    {formatOrderDisplayRef({ id: o.id, orderNumber: o.orderNumber })}
                  </Text>
                  <Text style={textStyle(isArabic, 'caption')}>{formatDate(o.createdAt)}</Text>
                </View>
                <View style={styles.rowEnd}>
                  <Text style={[textStyle(isArabic, 'bodySm'), styles.rowValue]}>
                    {formatCurrencyFromUsd(o.total, currency, language)}
                  </Text>
                  <OrderStatusBadge status={o.status} />
                </View>
              </View>
            ))
          )}
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('admin.overview.recentSellerApplications')}
          </Text>
          {applications.length === 0 ? (
            <Text style={textStyle(isArabic, 'body')}>{t('admin.overview.noApplicationsYet')}</Text>
          ) : (
            applications.map((a) => (
              <View key={a.id} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text numberOfLines={1} style={textStyle(isArabic, 'bodySm')}>
                    {a.businessName}
                  </Text>
                  <Text style={textStyle(isArabic, 'caption')}>{formatDate(a.createdAt)}</Text>
                </View>
                <OrderStatusBadge status={a.status} />
              </View>
            ))
          )}
        </MasaCard>

        <MasaButton
          label={t('seller.overview.backHome')}
          onPress={() => goHome()}
          variant="outline"
        />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  loading: { marginTop: 60 },
  row: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowEnd: { alignItems: 'flex-end', gap: 4 },
  rowMain: { flex: 1, gap: 2, paddingRight: 8 },
  rowValue: { color: theme.colors.masaDark, fontWeight: '600' },
  sectionTitle: { color: theme.colors.primary, fontSize: 16 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  title: { color: theme.colors.primary, fontSize: 26 },
});
