import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { CheckCircle2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { verifyCheckoutSession } from '../lib/stripe/checkout-client';
import type { RootStackParamList } from '../navigation/types';
import { goDiscover, goHome } from '../navigation/routes';
import { useCartStore } from '../stores/cartStore';

type VerifyStatus = 'loading' | 'confirmed' | 'processing' | 'failed';

export function PaymentSuccessScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentSuccess'>>();
  const sessionId = route.params.sessionId;
  const { isArabic, t } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const refreshCart = useCartStore((s) => s.refresh);
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll(): Promise<void> {
      const result = await verifyCheckoutSession(sessionId);
      if (cancelled) return;

      if (result.status === 'confirmed') {
        setStatus('confirmed');
        setOrderNumber(result.orderNumber ?? result.orderId ?? null);
        void refreshCart();
        return;
      }

      if (
        result.status === 'payment_failed' ||
        result.status === 'invalid' ||
        result.status === 'not_found'
      ) {
        setStatus('failed');
        return;
      }

      attempts += 1;
      if (attempts < 15) {
        setStatus('processing');
        setTimeout(() => void poll(), 2000);
      } else {
        setStatus('failed');
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, refreshCart]);

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MasaCard style={styles.card}>
          {status === 'loading' || status === 'processing' ? (
            <>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={[styles.title, { fontFamily: luxury }]}>
                {isArabic ? 'جارٍ تأكيد الدفع...' : 'Confirming your payment...'}
              </Text>
              <Text style={textStyle(isArabic, 'body')}>
                {isArabic
                  ? 'يرجى الانتظار بينما نتحقق من عملية الدفع.'
                  : 'Please wait while we verify your payment with Stripe.'}
              </Text>
            </>
          ) : null}

          {status === 'confirmed' ? (
            <>
              <CheckCircle2 color={theme.colors.primary} size={48} />
              <Text style={[styles.title, { fontFamily: luxury }]}>
                {t('checkout.success.thankYou')}
              </Text>
              {orderNumber ? (
                <Text style={textStyle(isArabic, 'body')}>
                  {isArabic ? `رقم الطلب: ${orderNumber}` : `Order #${orderNumber}`}
                </Text>
              ) : null}
              <MasaButton label={t('cart.continueShopping')} onPress={() => goDiscover()} />
              <MasaButton label={isArabic ? 'الرئيسية' : 'Home'} onPress={() => goHome()} variant="outline" />
            </>
          ) : null}

          {status === 'failed' ? (
            <>
              <Text style={[styles.title, { fontFamily: luxury }]}>
                {isArabic ? 'تعذّر تأكيد الدفع' : 'Payment not confirmed'}
              </Text>
              <Text style={textStyle(isArabic, 'body')}>
                {isArabic
                  ? 'لم نتمكن من تأكيد الدفع بعد. إذا تم خصم المبلغ، تواصل مع الدعم.'
                  : 'We could not confirm payment yet. If you were charged, contact support.'}
              </Text>
              <MasaButton label={t('cart.continueShopping')} onPress={() => goDiscover()} />
            </>
          ) : null}
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 48,
  },
  card: {
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 24,
    textAlign: 'center',
  },
});
