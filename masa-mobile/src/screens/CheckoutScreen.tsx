import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import {
  DELIVERY_PAYMENT_METHODS,
  placeOrder,
  type DeliveryPaymentMethod,
  type OrderShippingPayload,
} from '../services/orderService';
import { goAuth, goCart, goOrderPlaced } from '../navigation/routes';
import { useCartStore } from '../stores/cartStore';
import { formatCurrencyFromUsd, parseUsdPrice } from '../utils/currency';

const BUILDING_TYPES = [
  { value: 'house_villa', en: 'House / Villa', ar: 'منزل / فيلا' },
  { value: 'apartment', en: 'Apartment', ar: 'شقة' },
  { value: 'office', en: 'Office', ar: 'مكتب' },
  { value: 'shop', en: 'Shop', ar: 'محل' },
  { value: 'public_place', en: 'Public place', ar: 'مكان عام' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
] as const;

const DEFAULT_LAT = 25.2854;
const DEFAULT_LNG = 51.531;

export function CheckoutScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { currency, language, t, isArabic } = useSettings();
  const items = useCartStore((s) => s.items);
  const refresh = useCartStore((s) => s.refresh);
  const reset = useCartStore((s) => s.reset);
  const luxury = fontFamily(isArabic, 'luxury');

  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityArea, setCityArea] = useState('');
  const [buildingType, setBuildingType] = useState<string>('');
  const [zoneNo, setZoneNo] = useState('');
  const [streetNo, setStreetNo] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [floorNo, setFloorNo] = useState('');
  const [apartmentNo, setApartmentNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<DeliveryPaymentMethod>('cash_on_delivery');

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.product.priceUsd ?? parseUsdPrice(item.product.price)) * item.quantity,
    0,
  );

  if (!user) {
    return (
      <SiteShell>
        <View style={styles.centered}>
          <Text style={textStyle(isArabic, 'body')}>{t('auth.register.signIn')}</Text>
          <MasaButton label={t('auth.register.signIn')} onPress={() => goAuth()} />
        </View>
      </SiteShell>
    );
  }

  const setDohaPin = (): void => {
    setDeliveryLat(DEFAULT_LAT);
    setDeliveryLng(DEFAULT_LNG);
    setSubmitError(null);
  };

  const handlePay = async (): Promise<void> => {
    setSubmitError(null);

    if (!firstName.trim()) {
      setSubmitError(t('checkout.fullNameRequired'));
      return;
    }
    if (!phone.trim()) {
      setSubmitError(t('checkout.phoneNumberRequired'));
      return;
    }
    if (!cityArea.trim()) {
      setSubmitError(t('checkout.cityAreaRequired'));
      return;
    }
    if (!buildingType) {
      setSubmitError(t('checkout.buildingTypeRequired'));
      return;
    }
    if (deliveryLat == null || deliveryLng == null) {
      setSubmitError(t('checkout.mapPinRequired'));
      return;
    }

    if (items.length === 0) {
      setSubmitError(t('cart.empty'));
      return;
    }

    const shipping: OrderShippingPayload = {
      firstName: firstName.trim(),
      deliveryPhone: phone.trim(),
      country: 'Qatar',
      deliveryCityArea: cityArea.trim(),
      deliveryBuildingType: buildingType,
      deliveryZoneNo: zoneNo.trim() || null,
      deliveryStreetNo: streetNo.trim() || null,
      deliveryBuildingNo: buildingNo.trim() || null,
      deliveryFloorNo: floorNo.trim() || null,
      deliveryApartmentNo: apartmentNo.trim() || null,
      deliveryLandmark: landmark.trim() || null,
      deliveryLat,
      deliveryLng,
      deliveryMapUrl: `https://www.google.com/maps?q=${deliveryLat},${deliveryLng}`,
    };

    setIsPaying(true);
    try {
      const result = await placeOrder({
        paymentMethod,
        shipping,
        promoCode: promoCode.trim() || undefined,
      });
      if (!result.ok) {
        setSubmitError(result.error || t('checkout.placeOrderFailed'));
        return;
      }
      // Nothing was charged; the courier collects on delivery.
      reset();
      goOrderPlaced(result.orderId);
    } catch {
      setSubmitError(t('checkout.placeOrderFailed'));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.pageTitle, { fontFamily: luxury }]}>{t('checkout.secureCheckout')}</Text>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('checkout.deliveryAddress')}
          </Text>
          <Text style={textStyle(isArabic, 'caption')}>{t('checkout.realNameVerificationNote')}</Text>

          <Text style={textStyle(isArabic, 'bodySm')}>{t('checkout.fullNameRequired')}</Text>
          <TextInput
            onChangeText={setFirstName}
            placeholder={t('checkout.yourFullName')}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={firstName}
          />

          <Text style={textStyle(isArabic, 'bodySm')}>{t('checkout.phoneNumberRequired')}</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder="+974 ..."
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={phone}
          />

          <Text style={textStyle(isArabic, 'bodySm')}>{t('checkout.cityAreaRequired')}</Text>
          <TextInput
            onChangeText={setCityArea}
            placeholder={isArabic ? 'المنطقة / المدينة' : 'City / area'}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={cityArea}
          />

          <Text style={textStyle(isArabic, 'bodySm')}>{t('checkout.buildingTypeRequired')}</Text>
          <View style={styles.chipRow}>
            {BUILDING_TYPES.map((bt) => (
              <Pressable
                key={bt.value}
                onPress={() => setBuildingType(bt.value)}
                style={[styles.chip, buildingType === bt.value && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    buildingType === bt.value && styles.chipTextActive,
                  ]}
                >
                  {isArabic ? bt.ar : bt.en}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.grid}>
            <TextInput
              onChangeText={setZoneNo}
              placeholder={isArabic ? 'المنطقة (رقم)' : 'Zone no.'}
              placeholderTextColor={theme.colors.masaGray}
              style={[styles.input, styles.gridItem]}
              value={zoneNo}
            />
            <TextInput
              onChangeText={setStreetNo}
              placeholder={isArabic ? 'الشارع' : 'Street no.'}
              placeholderTextColor={theme.colors.masaGray}
              style={[styles.input, styles.gridItem]}
              value={streetNo}
            />
          </View>

          <TextInput
            onChangeText={setLandmark}
            placeholder={isArabic ? 'علامة مميزة' : 'Landmark'}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={landmark}
          />

          <MasaButton
            label={
              deliveryLat != null
                ? isArabic
                  ? 'تم تحديد موقع التوصيل'
                  : 'Delivery location set'
                : t('checkout.mapPinRequired')
            }
            onPress={setDohaPin}
            variant="outline"
          />
        </MasaCard>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('checkout.paymentMethod')}
          </Text>
          {DELIVERY_PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method}
              onPress={() => setPaymentMethod(method)}
              style={[styles.payOption, paymentMethod === method && styles.payOptionActive]}
            >
              <Text style={[textStyle(isArabic, 'body'), styles.payOptionLabel]}>
                {method === 'cash_on_delivery'
                  ? t('checkout.paymentLabels.cashOnDelivery')
                  : t('checkout.paymentLabels.cardOnDelivery')}
              </Text>
              <Text style={textStyle(isArabic, 'caption')}>
                {method === 'cash_on_delivery'
                  ? t('checkout.paymentLabels.cashOnDeliveryHint')
                  : t('checkout.paymentLabels.cardOnDeliveryHint')}
              </Text>
            </Pressable>
          ))}
          <Text style={[textStyle(isArabic, 'caption'), styles.payNote]}>
            {t('checkout.payOnDeliveryBanner')}
          </Text>
        </MasaCard>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
            {t('checkout.orderSummary')}
          </Text>
          <View style={styles.summaryLine}>
            <Text style={textStyle(isArabic, 'body')}>{t('checkout.subtotal')}</Text>
            <Text style={textStyle(isArabic, 'bodySm')}>
              {formatCurrencyFromUsd(subtotal, currency, language)}
            </Text>
          </View>
          <View style={styles.promoRow}>
            <TextInput
              onChangeText={setPromoCode}
              placeholder={t('checkout.promoExample')}
              placeholderTextColor={theme.colors.masaGray}
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={promoCode}
            />
          </View>
        </MasaCard>

        {submitError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <MasaButton
          disabled={isPaying || items.length === 0}
          label={
            isPaying
              ? isArabic
                ? 'جارٍ تنفيذ طلبك...'
                : 'Placing your order...'
              : t('checkout.placeSecureOrder')
          }
          onPress={() => void handlePay()}
        />
        <MasaButton label={t('cart.title')} onPress={() => goCart()} variant="ghost" />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
    gap: 16,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  pageTitle: {
    color: theme.colors.primary,
    fontSize: 30,
    marginBottom: 8,
  },
  section: { gap: 12 },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 20,
  },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.masaDark, fontSize: 12 },
  chipTextActive: { color: theme.colors.white },
  payOption: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    marginTop: 8,
    padding: 12,
  },
  payOptionActive: {
    backgroundColor: theme.colors.masaLight,
    borderColor: theme.colors.primary,
  },
  payOptionLabel: { fontWeight: '600' },
  payNote: { marginTop: 10 },
  grid: { flexDirection: 'row', gap: 8 },
  gridItem: { flex: 1 },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  promoRow: { flexDirection: 'row', gap: 8 },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 12,
  },
  errorText: { color: '#991b1b', fontSize: 14 },
});
