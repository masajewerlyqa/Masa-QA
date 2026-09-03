import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { SiteShell } from '../../components/layout/SiteShell';
import { getSellerNextStatusOptions } from '../../constants/sellerOrderTransitions';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { formatOrderDisplayRef } from '../../services/orderHistoryService';
import {
  getSellerOrderDetail,
  markSellerOrderPaid,
  updateSellerOrderStatus,
  updateSellerOrderTracking,
  type SellerOrderDetail,
} from '../../services/sellerWriteService';
import { formatCurrencyFromUsd } from '../../utils/currency';

/** Mirrors web `app/seller/orders/[id]/page.tsx`: status actions, tracking, payment collection. */
export function SellerOrderDetailScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'SellerOrderDetail'>>();
  const { orderId } = route.params;
  const { t, isArabic, currency, language } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [order, setOrder] = useState<SellerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelFor, setShowCancelFor] = useState<string | null>(null);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [savingTracking, setSavingTracking] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const load = useCallback(async () => {
    const res = await getSellerOrderDetail(orderId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setOrder(res.order);
    setTrackingNumber(res.order.tracking_number ?? '');
    setShippingCompany(res.order.shipping_company ?? '');
    setEstimatedDelivery(res.order.estimated_delivery ?? '');
  }, [orderId]);

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

  const applyStatus = async (newStatus: string, reason?: string): Promise<void> => {
    setBusyStatus(newStatus);
    const result = await updateSellerOrderStatus(orderId, newStatus, reason ?? null);
    setBusyStatus(null);
    if (!result.ok) {
      setError(result.error ?? null);
      return;
    }
    setShowCancelFor(null);
    setCancelReason('');
    await load();
  };

  const handleStatusPress = (nextStatus: string): void => {
    if (nextStatus === 'cancelled') {
      setShowCancelFor(nextStatus);
      return;
    }
    void applyStatus(nextStatus);
  };

  const confirmCancel = (): void => {
    const trimmed = cancelReason.trim();
    // Optional only from awaiting_seller, matching updateOrderStatus's own rule
    // -- the server still enforces this, this just avoids a round trip to learn it.
    const optionalReason = order?.status === 'awaiting_seller';
    if (!optionalReason && trimmed.length < 10) {
      setError(t('seller.orders.cancellationReasonTooShort'));
      return;
    }
    void applyStatus('cancelled', trimmed || undefined);
  };

  const handleMarkPaid = async (): Promise<void> => {
    setMarkingPaid(true);
    const result = await markSellerOrderPaid(orderId);
    setMarkingPaid(false);
    if (!result.ok) {
      setError(result.error ?? null);
      return;
    }
    await load();
  };

  const handleSaveTracking = async (): Promise<void> => {
    setSavingTracking(true);
    const result = await updateSellerOrderTracking(orderId, {
      tracking_number: trackingNumber.trim() || null,
      shipping_company: shippingCompany.trim() || null,
      estimated_delivery: estimatedDelivery.trim() || null,
    });
    setSavingTracking(false);
    if (!result.ok) {
      setError(result.error ?? null);
      return;
    }
    await load();
  };

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
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

  if (!order) {
    return (
      <SiteShell>
        <View style={styles.content}>
          <ScreenBackButton label={t('seller.overview.dashboard')} />
          <MasaCard>
            <Text style={textStyle(isArabic, 'body')}>{error ?? t('account.experienceRating.orderNotFound')}</Text>
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  const nextOptions = getSellerNextStatusOptions(order.status);
  const canCollectPayment =
    order.payment_status === 'pending' &&
    (order.status === 'delivered' || order.status === 'out_for_delivery');

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={t('seller.overview.dashboard')} />

        <View style={styles.headerRow}>
          <View style={styles.headerTitles}>
            <Text style={[styles.title, { fontFamily: luxury }]}>
              {t('account.orders.order')} {formatOrderDisplayRef({ id: order.id, orderNumber: order.order_number })}
            </Text>
            <Text style={textStyle(isArabic, 'caption')}>{formatDate(order.created_at)}</Text>
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        {error ? (
          <MasaCard style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </MasaCard>
        ) : null}

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.overview.customer')}</Text>
          <Text style={textStyle(isArabic, 'bodySm')}>{order.customer_name ?? '—'}</Text>
          {order.customer_email ? <Text style={textStyle(isArabic, 'caption')}>{order.customer_email}</Text> : null}
          {order.customer_phone ? <Text style={textStyle(isArabic, 'caption')}>{order.customer_phone}</Text> : null}
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.orders.items')}</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={textStyle(isArabic, 'bodySm')} numberOfLines={1}>
                {item.product_name} × {item.quantity}
              </Text>
              <Text style={textStyle(isArabic, 'bodySm')}>
                {formatCurrencyFromUsd(item.total_price, currency, language)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
            <Text style={styles.totalValue}>{formatCurrencyFromUsd(order.total, currency, language)}</Text>
          </View>
          {order.store_earnings != null ? (
            <View style={styles.itemRow}>
              <Text style={textStyle(isArabic, 'caption')}>{t('admin.overview.totalSellerEarnings')}</Text>
              <Text style={textStyle(isArabic, 'bodySm')}>
                {formatCurrencyFromUsd(order.store_earnings, currency, language)}
              </Text>
            </View>
          ) : null}
        </MasaCard>

        {nextOptions.length > 0 ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.orders.status')}</Text>
            <View style={styles.chipRow}>
              {nextOptions.map((s) => (
                <MasaButton
                  disabled={busyStatus !== null}
                  key={s}
                  label={busyStatus === s ? t('common.saving') : t(`order.statuses.${s}`)}
                  onPress={() => handleStatusPress(s)}
                  style={styles.statusBtn}
                  variant={s === 'cancelled' ? 'outline' : 'primary'}
                />
              ))}
            </View>

            {showCancelFor === 'cancelled' ? (
              <View style={styles.cancelBox}>
                <Text style={styles.fieldLabel}>{t('seller.orders.cancellationReasonLabel')}</Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  onChangeText={setCancelReason}
                  placeholder={t('seller.orders.cancellationReasonPlaceholder')}
                  placeholderTextColor={theme.colors.masaGray}
                  style={[styles.input, styles.textarea]}
                  value={cancelReason}
                />
                <MasaButton
                  disabled={busyStatus !== null}
                  label={t('seller.orders.confirmCancellation')}
                  onPress={confirmCancel}
                  variant="outline"
                />
              </View>
            ) : null}
          </MasaCard>
        ) : null}

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('seller.orders.deliveryTrackingTitle')}
          </Text>
          <Text style={styles.fieldLabel}>{t('seller.orders.trackingNumberLabel')}</Text>
          <TextInput
            onChangeText={setTrackingNumber}
            placeholder={t('seller.orders.trackingNumberPlaceholder')}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={trackingNumber}
          />
          <Text style={styles.fieldLabel}>{t('seller.orders.carrier')}</Text>
          <TextInput
            onChangeText={setShippingCompany}
            placeholder={t('seller.orders.carrierPlaceholder')}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={shippingCompany}
          />
          <Text style={styles.fieldLabel}>{t('seller.orders.estimatedDeliveryLabel')}</Text>
          <TextInput
            onChangeText={setEstimatedDelivery}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={estimatedDelivery}
          />
          <MasaButton
            disabled={savingTracking}
            label={savingTracking ? t('seller.orders.savingDeliveryDetails') : t('seller.orders.saveDeliveryDetails')}
            onPress={() => void handleSaveTracking()}
            variant="outline"
          />
        </MasaCard>

        {canCollectPayment ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {isArabic ? 'تحصيل الدفع' : 'Payment collection'}
            </Text>
            <Text style={textStyle(isArabic, 'body')}>
              {isArabic
                ? 'تم تسليم الطلب أو هو قيد التوصيل. سجّل ذلك بعد استلام المندوب للمبلغ من العميل.'
                : 'The order is out for delivery or delivered. Record this once the courier has collected payment from the customer.'}
            </Text>
            <MasaButton
              disabled={markingPaid}
              label={markingPaid ? t('common.saving') : isArabic ? 'تم تحصيل الدفع' : 'Mark payment collected'}
              onPress={() => void handleMarkPaid()}
            />
          </MasaCard>
        ) : null}
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  cancelBox: { gap: 8, marginTop: 12 },
  card: { gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  divider: { backgroundColor: theme.colors.border, height: 1, marginVertical: 4 },
  errorCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  errorText: { color: '#dc2626', fontSize: 13 },
  fieldLabel: {
    color: theme.colors.masaDark,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  headerTitles: { flex: 1, gap: 4 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  loading: { marginTop: 60 },
  sectionTitle: { color: theme.colors.primary, fontSize: 16 },
  statusBtn: { paddingHorizontal: 14 },
  textarea: { minHeight: 80 },
  title: { color: theme.colors.primary, fontSize: 20 },
  totalLabel: { color: theme.colors.primary, fontWeight: '700' },
  totalValue: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
});
