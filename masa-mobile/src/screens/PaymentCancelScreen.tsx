import { ScrollView, StyleSheet, Text } from 'react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { goCart, goDiscover } from '../navigation/routes';

export function PaymentCancelScreen(): React.JSX.Element {
  const { isArabic, t } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MasaCard style={styles.card}>
          <Text style={[styles.title, { fontFamily: luxury }]}>
            {isArabic ? 'تم إلغاء الدفع' : 'Payment cancelled'}
          </Text>
          <Text style={textStyle(isArabic, 'body')}>
            {isArabic
              ? 'لم تكتمل عملية الدفع. يمكنك العودة إلى السلة والمحاولة مرة أخرى.'
              : 'Your payment was not completed. You can return to your cart and try again.'}
          </Text>
          <MasaButton label={t('cart.title')} onPress={() => goCart()} />
          <MasaButton label={t('cart.continueShopping')} onPress={() => goDiscover()} variant="outline" />
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
