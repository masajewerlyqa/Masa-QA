import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { CheckCircle2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import type { RootStackParamList } from '../navigation/types';
import { goDiscover, goHome } from '../navigation/routes';
import { useCartStore } from '../stores/cartStore';

/**
 * Order confirmation.
 *
 * There is nothing to verify here any more: payment is collected by the
 * courier at delivery, so the order is already placed by the time we arrive.
 * The screen confirms the order rather than claiming a payment succeeded.
 */
export function PaymentSuccessScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentSuccess'>>();
  const orderId = route.params.orderId;
  const { isArabic, t } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const refreshCart = useCartStore((s) => s.refresh);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content}>
        <MasaCard style={styles.card}>
          <View style={styles.iconWrap}>
            <CheckCircle2 color={theme.colors.primary} size={44} />
          </View>

          <Text style={[styles.title, { fontFamily: luxury }]}>
            {isArabic ? 'تم تأكيد طلبك' : 'Your order is confirmed'}
          </Text>

          <Text style={[textStyle(isArabic, 'body'), styles.centerText]}>
            {t('checkout.payOnDeliveryBanner')}
          </Text>

          <View style={styles.orderRow}>
            <Text style={textStyle(isArabic, 'caption')}>
              {isArabic ? 'رقم الطلب' : 'Order reference'}
            </Text>
            <Text style={[textStyle(isArabic, 'bodySm'), styles.orderId]}>
              {orderId.slice(0, 8).toUpperCase()}
            </Text>
          </View>

          <Text style={[textStyle(isArabic, 'caption'), styles.centerText]}>
            {isArabic
              ? 'سنراسلك بتفاصيل الطلب، وسيتواصل معك المندوب قبل التوصيل.'
              : 'We have emailed your order details. The courier will contact you before delivery.'}
          </Text>

          <MasaButton label={t('cart.continueShopping')} onPress={() => goDiscover()} />
          <MasaButton label={t('mobileNav.home')} onPress={() => goHome()} variant="ghost" />
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 12, padding: 24 },
  centerText: { textAlign: 'center' },
  content: {
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  iconWrap: { marginBottom: 4 },
  orderId: { fontWeight: '600', letterSpacing: 1 },
  orderRow: {
    alignItems: 'center',
    backgroundColor: theme.colors.masaLight,
    borderRadius: 8,
    gap: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { color: theme.colors.primary, fontSize: 22, textAlign: 'center' },
});
