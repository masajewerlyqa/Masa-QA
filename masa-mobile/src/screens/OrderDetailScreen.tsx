import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MasaCard } from '../components/MasaCard';
import { OrderStatusBadge } from '../components/order/OrderStatusBadge';
import { ScreenBackButton } from '../components/ScreenBackButton';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';
import {
  formatOrderDisplayRef,
  getMyOrderDetail,
  type OrderDetail,
} from '../services/orderHistoryService';
import { formatCurrencyFromUsd } from '../utils/currency';

/** Matches web `/account/orders/[id]`: order detail, mobile-appropriate subset (no rating/return flows). */
export function OrderDetailScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const { orderId } = route.params;
  const { currency, language, t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMyOrderDetail(orderId).then((data) => {
      if (mounted) {
        setOrder(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} style={styles.loading} />
      </SiteShell>
    );
  }

  if (!order) {
    return (
      <SiteShell>
        <View style={styles.content}>
          <MasaCard>
            <Text style={textStyle(isArabic, 'body')}>{t('account.experienceRating.orderNotFound')}</Text>
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  const addressLines = [
    order.deliveryBuildingType,
    order.deliveryZoneNo ? `${t('checkout.zoneNo')} ${order.deliveryZoneNo}` : null,
    order.deliveryStreetNo ? `${t('checkout.streetNo')} ${order.deliveryStreetNo}` : null,
    order.deliveryBuildingNo ? `${t('checkout.buildingNo')} ${order.deliveryBuildingNo}` : null,
    order.deliveryFloorNo,
    order.deliveryApartmentNo,
    order.deliveryLandmark,
    order.deliveryCityArea,
  ].filter((line): line is string => Boolean(line && line.trim()));

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={t('account.orders.backToOrderHistory')} />
        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={[styles.title, { fontFamily: luxury }]}>
              {t('account.orders.order')} {formatOrderDisplayRef(order)}
            </Text>
            <Text style={textStyle(isArabic, 'caption')}>
              {t('account.orders.placed')} {formatDate(order.createdAt)}
            </Text>
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.orders.items')}</Text>
          {order.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <View style={styles.itemMain}>
                <Text style={textStyle(isArabic, 'bodySm')}>{item.productName}</Text>
                <Text style={textStyle(isArabic, 'caption')}>
                  {t('account.orders.qty')}: {item.quantity}
                </Text>
              </View>
              <Text style={textStyle(isArabic, 'bodySm')}>
                {formatCurrencyFromUsd(item.totalPrice, currency, language)}
              </Text>
            </View>
          ))}
        </MasaCard>

        {addressLines.length > 0 ? (
          <MasaCard style={styles.section}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {t('account.orders.shippingAddress')}
            </Text>
            {addressLines.map((line, i) => (
              <Text key={`${line}-${i}`} style={textStyle(isArabic, 'bodySm')}>
                {line}
              </Text>
            ))}
            {order.deliveryPhone ? (
              <Text style={textStyle(isArabic, 'bodySm')}>{order.deliveryPhone}</Text>
            ) : null}
          </MasaCard>
        ) : null}

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.orders.summary')}</Text>
          <SummaryRow
            label={t('checkout.subtotal')}
            value={formatCurrencyFromUsd(order.subtotal, currency, language)}
          />
          <SummaryRow
            label={t('checkout.shipping')}
            value={
              order.shippingCost > 0
                ? formatCurrencyFromUsd(order.shippingCost, currency, language)
                : t('checkout.free')
            }
          />
          {order.discountAmount > 0 ? (
            <SummaryRow
              label={t('checkout.discount')}
              value={`-${formatCurrencyFromUsd(order.discountAmount, currency, language)}`}
            />
          ) : null}
          <View style={styles.divider} />
          <SummaryRow
            bold
            label={t('checkout.total')}
            value={formatCurrencyFromUsd(order.total, currency, language)}
          />
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold ? styles.summaryBold : null]}>{label}</Text>
      <Text style={[styles.summaryValue, bold ? styles.summaryBold : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  divider: {
    backgroundColor: theme.colors.border,
    height: 1,
    marginVertical: 4,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitles: { flex: 1, gap: 4 },
  itemMain: { flex: 1, gap: 2 },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  loading: { marginTop: 60 },
  section: { gap: 8 },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    marginBottom: 4,
  },
  summaryBold: { color: theme.colors.primary, fontWeight: '700' },
  summaryLabel: { color: theme.colors.masaGray, fontSize: 14 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryValue: { color: theme.colors.masaDark, fontSize: 14 },
  title: {
    color: theme.colors.primary,
    fontSize: 22,
  },
});
