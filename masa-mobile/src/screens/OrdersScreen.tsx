import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { MasaCard } from '../components/MasaCard';
import { OrderStatusBadge } from '../components/order/OrderStatusBadge';
import { ScreenBackButton } from '../components/ScreenBackButton';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import { goOrderDetail } from '../navigation/routes';
import {
  formatOrderDisplayRef,
  getMyOrders,
  type OrderListItem,
} from '../services/orderHistoryService';
import { formatCurrencyFromUsd } from '../utils/currency';

/** Matches web `/account/orders`: order history list, mobile layout. */
export function OrdersScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { currency, language, t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const rows = await getMyOrders();
    setOrders(rows);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <SiteShell>
      <FlatList
        contentContainerStyle={styles.content}
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.colors.primary} style={styles.loading} />
          ) : (
            <MasaCard style={styles.emptyCard}>
              <Text style={textStyle(isArabic, 'body')}>{t('account.orders.noOrdersYet')}</Text>
            </MasaCard>
          )
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenBackButton label={t('account.orders.backToAccount')} />
            <Text style={[styles.title, { fontFamily: luxury }]}>{t('account.orders.history')}</Text>
            <Text style={textStyle(isArabic, 'body')}>{t('account.orders.trackOrders')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => goOrderDetail(item.id)}>
            <MasaCard style={styles.orderCard}>
              <View style={styles.orderRow}>
                <View style={styles.orderMain}>
                  <Text style={[textStyle(isArabic, 'bodySm'), styles.orderRef]}>
                    {formatOrderDisplayRef(item)}
                  </Text>
                  <Text style={textStyle(isArabic, 'caption')}>{formatDate(item.createdAt)}</Text>
                </View>
                <OrderStatusBadge status={item.status} />
              </View>
              <View style={styles.orderFooter}>
                <Text style={[styles.orderTotal, { fontFamily: luxury }]}>
                  {formatCurrencyFromUsd(item.total, currency, language)}
                </Text>
                <ChevronRight color={theme.colors.masaGray} size={18} />
              </View>
            </MasaCard>
          </Pressable>
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
  headerBlock: { marginBottom: 20 },
  loading: { marginTop: 40 },
  orderCard: { gap: 12, marginBottom: 12 },
  orderFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderMain: { gap: 2 },
  orderRef: { color: theme.colors.masaDark, fontWeight: '600' },
  orderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderTotal: { color: theme.colors.primary, fontSize: 18 },
  title: {
    color: theme.colors.primary,
    fontSize: 26,
    marginBottom: 4,
  },
});
