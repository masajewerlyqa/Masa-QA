import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import {
  getAdminOrders,
  getAdminProducts,
  getAdminSellers,
  getAdminStores,
} from '../../services/adminDataService';
import { formatOrderDisplayRef } from '../../services/orderHistoryService';
import { formatCurrencyFromUsd } from '../../utils/currency';

/** A row reduced to what the list renders, so all four sections share one renderer. */
type Row = {
  id: string;
  primary: string;
  secondary: string | null;
  value: string | null;
  status: string | null;
};

/**
 * Admin list screen for orders / products / stores / sellers.
 *
 * One screen rather than four: the sections differ only in which fields map to
 * the primary/secondary/value/status slots, so a shared renderer keeps them
 * visually identical and avoids four near-copies drifting apart.
 */
export function AdminListScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'AdminList'>>();
  const { section } = route.params;
  const { t, isArabic, currency, language } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (section === 'orders') {
      const res = await getAdminOrders();
      if (!res.ok) return setError(res.error);
      setError(null);
      setRows(
        res.rows.map((o) => ({
          id: o.id,
          primary: formatOrderDisplayRef({ id: o.id, orderNumber: o.order_number }),
          secondary: o.customer_name ?? o.customer_email,
          value: formatCurrencyFromUsd(Number(o.total), currency, language),
          status: o.status,
        })),
      );
      return;
    }

    if (section === 'products') {
      const res = await getAdminProducts();
      if (!res.ok) return setError(res.error);
      setError(null);
      setRows(
        res.rows.map((p) => ({
          id: p.id,
          primary: p.name,
          secondary: p.store_name,
          value: formatCurrencyFromUsd(Number(p.price), currency, language),
          status: p.status,
        })),
      );
      return;
    }

    if (section === 'stores') {
      const res = await getAdminStores();
      if (!res.ok) return setError(res.error);
      setError(null);
      setRows(
        res.rows.map((s) => ({
          id: s.id,
          primary: s.name,
          // A bare count reads as an unlabelled number, so it is qualified here.
          secondary: [s.location, `${s.product_count} ${t('marketplace.products')}`]
            .filter(Boolean)
            .join(' · '),
          value: null,
          status: s.status,
        })),
      );
      return;
    }

    const res = await getAdminSellers();
    if (!res.ok) return setError(res.error);
    setError(null);
    setRows(
      res.rows.map((s) => ({
        id: s.id,
        primary: s.name,
        secondary: [s.email, `${s.products} ${t('marketplace.products')}`]
          .filter(Boolean)
          .join(' · '),
        value: null,
        status: s.status,
      })),
    );
  }, [section, currency, language, t]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
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

  const title =
    section === 'orders'
      ? t('admin.overview.recentOrders')
      : section === 'products'
        ? t('admin.overview.totalProducts')
        : section === 'stores'
          ? t('admin.overview.totalStores')
          : t('admin.overview.totalSellers');

  return (
    <SiteShell>
      <FlatList
        contentContainerStyle={styles.content}
        data={rows}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loading} />
          ) : (
            <MasaCard style={styles.emptyCard}>
              <Text style={textStyle(isArabic, 'body')}>
                {error ?? t('common.noDataToDisplay')}
              </Text>
            </MasaCard>
          )
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenBackButton label={t('admin.overview.platformOverview')} />
            <Text style={[styles.title, { fontFamily: luxury }]}>{title}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => void onRefresh()}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <MasaCard style={styles.rowCard}>
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text numberOfLines={1} style={textStyle(isArabic, 'bodySm')}>
                  {item.primary}
                </Text>
                {item.secondary ? (
                  <Text numberOfLines={1} style={textStyle(isArabic, 'caption')}>
                    {item.secondary}
                  </Text>
                ) : null}
              </View>
              <View style={styles.rowEnd}>
                {item.value ? (
                  <Text style={[textStyle(isArabic, 'bodySm'), styles.rowValue]}>{item.value}</Text>
                ) : null}
                {item.status ? <OrderStatusBadge status={item.status} /> : null}
              </View>
            </View>
          </MasaCard>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  header: { marginBottom: 16 },
  loading: { marginTop: 40 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  rowCard: { marginBottom: 10 },
  rowEnd: { alignItems: 'flex-end', gap: 4 },
  rowMain: { flex: 1, gap: 2, paddingRight: 8 },
  rowValue: { color: theme.colors.masaDark, fontWeight: '600' },
  title: { color: theme.colors.primary, fontSize: 24 },
});
