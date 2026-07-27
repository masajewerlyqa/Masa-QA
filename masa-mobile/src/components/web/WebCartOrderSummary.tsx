import { ArrowRight, Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '../../constants/theme';
import { web } from '../../design/webTokens';
import { useSettings } from '../../context/SettingsContext';
import { goDiscover } from '../../navigation/routes';
import { WebButton } from './WebButton';
import { WebCard } from './WebCard';
import { WebFormattedPrice } from './WebFormattedPrice';
import { WebInput } from './WebInput';

type WebCartOrderSummaryProps = {
  subtotalUsd: number;
  hasItems: boolean;
};

/** Port of `components/cart/CartOrderSummary.tsx` (promo apply omitted — requires checkout API) */
export function WebCartOrderSummary({
  subtotalUsd,
  hasItems,
}: WebCartOrderSummaryProps): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const body = fontFamily(isArabic, 'body');
  const [promoInput, setPromoInput] = useState('');
  const shippingUsd = 0;
  const totalUsd = subtotalUsd + shippingUsd;

  return (
    <WebCard contentStyle={styles.content} shadow="lg">
      <Text style={[styles.heading, { fontFamily: luxury }]}>{t('checkout.orderSummary')}</Text>
      <View style={styles.lines}>
        <View style={styles.line}>
          <Text style={[styles.label, { fontFamily: body }]}>{t('checkout.subtotal')}</Text>
          <WebFormattedPrice usd={subtotalUsd} />
        </View>
        <View style={styles.line}>
          <Text style={[styles.label, { fontFamily: body }]}>{t('checkout.shipping')}</Text>
          <Text style={[styles.free, { fontFamily: body }]}>{t('checkout.free')}</Text>
        </View>
        <View style={styles.totalBlock}>
          <View style={styles.line}>
            <Text style={[styles.totalLabel, { fontFamily: body }]}>{t('checkout.total')}</Text>
            <WebFormattedPrice luxury usd={totalUsd} />
          </View>
        </View>
      </View>

      <Text style={[styles.promoLabel, { fontFamily: body }]}>{t('checkout.promoCode')}</Text>
      <View style={styles.promoRow}>
        <WebInput
          autoCapitalize="none"
          autoComplete="off"
          onChangeText={setPromoInput}
          placeholder={t('checkout.promoExample')}
          style={styles.promoInput}
          value={promoInput}
        />
        <WebButton
          disabled={!promoInput.trim()}
          fullWidth={false}
          onPress={() => {}}
          style={styles.applyBtn}
        >
          {t('checkout.apply')}
        </WebButton>
      </View>

      <View style={styles.actions}>
        <WebButton disabled={!hasItems} size="lg" variant="primary">
          <View style={styles.checkoutRow}>
            <Text style={[styles.checkoutLabel, { fontFamily: body }]}>{t('cart.proceedToCheckout')}</Text>
            <ArrowRight
              color={web.colors.white}
              size={20}
              style={isArabic ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </View>
        </WebButton>
        <WebButton onPress={() => goDiscover()} variant="outline">
          {t('cart.continueShopping')}
        </WebButton>
      </View>
    </WebCard>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  heading: {
    color: web.colors.primary,
    fontSize: web.fontSize.xl,
    marginBottom: 24,
  },
  lines: { gap: 16, marginBottom: 24 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { color: web.colors.masaGray, fontSize: web.fontSize.sm },
  free: { color: web.colors.green600, fontSize: web.fontSize.sm, fontWeight: '600' },
  totalBlock: {
    borderTopColor: web.colors.border,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  totalLabel: { color: web.colors.masaDark, fontSize: web.fontSize.lg },
  promoLabel: {
    color: web.colors.masaGray,
    fontSize: web.fontSize.sm,
    marginBottom: 8,
  },
  promoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  promoInput: { flex: 1 },
  applyBtn: { paddingHorizontal: 16 },
  actions: { gap: 12 },
  checkoutRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  checkoutLabel: {
    color: web.colors.white,
    fontSize: web.fontSize.base,
    fontWeight: '600',
  },
});
