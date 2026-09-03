import { BarChart3, Store, Truck, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { navigateToBecomeSeller } from '../../lib/sellerNavigation';
import { DiamondPattern } from '../DiamondPattern';
import { MasaButton } from '../MasaButton';
import { ContentContainer } from '../layout/ContentContainer';

/**
 * Port of web `components/home/SellerCTASection.tsx` at the MOBILE breakpoint.
 *
 * Web reference for the values below:
 *   section  → `py-24 bg-primary` + `<DiamondPattern className="opacity-10" />`
 *   heading  → `font-luxury text-3xl` (30px) white, centered
 *   subtitle → `text-secondary text-lg` (18px), centered
 *   benefits → `grid-cols-1 gap-6`, each `flex items-center gap-3 text-secondary`
 *              with a `w-6 h-6 text-masa-gold` icon (24px, gold)
 *   CTA      → `bg-white text-primary` (NOT primary-on-white)
 *
 * The previous mobile version dropped the diamond pattern and the gold icons,
 * centred the benefit rows instead of listing them, and rendered the CTA with
 * the default primary variant -- i.e. inverted against web (dark button on a
 * dark section) which is why it read as a different design.
 */
export function HomeSellerCtaSection(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  const benefits = [
    { Icon: Store, text: isArabic ? 'واجهة متجر رقمية' : 'Digital storefront' },
    { Icon: BarChart3, text: isArabic ? 'لوحة تحكم ذكية' : 'Smart dashboard' },
    { Icon: Truck, text: isArabic ? 'لوجستيات آمنة' : 'Secure logistics' },
    { Icon: Users, text: isArabic ? 'شبكة مشترين مميزة' : 'Premium buyers network' },
  ];

  return (
    <View style={styles.sellerSection}>
      <View style={styles.pattern}>
        <DiamondPattern />
      </View>

      <ContentContainer>
        <Text style={[styles.sellerTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
          {t('home.sellerTitle')}
        </Text>
        <Text style={styles.sellerSubtitle}>{t('home.sellerSubtitle')}</Text>

        <View style={styles.benefitList}>
          {benefits.map(({ Icon, text }) => (
            <View
              key={text}
              style={[styles.benefitRow, isArabic ? styles.benefitRowRtl : null]}
            >
              <Icon color={theme.colors.masaGold} size={24} />
              <Text style={styles.benefitText}>{text}</Text>
            </View>
          ))}
        </View>

        <MasaButton
          label={t('home.sellerCta')}
          onPress={() => void navigateToBecomeSeller()}
          style={styles.sellerBtn}
          variant="light"
        />
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  // `opacity-10` on web's DiamondPattern.
  pattern: { ...StyleSheet.absoluteFillObject, opacity: 0.1 },
  sellerSection: {
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
    paddingVertical: theme.spacing.sectionLg,
    position: 'relative',
  },
  // web `text-3xl` = 30px, `mb-6` = 24px
  sellerTitle: {
    color: theme.colors.white,
    fontSize: 30,
    lineHeight: 38,
    marginBottom: 24,
    textAlign: 'center',
  },
  // web `text-lg` = 18px
  sellerSubtitle: {
    color: theme.colors.secondary,
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 48,
    textAlign: 'center',
  },
  // web `gap-6` = 24px between grid items, `mb-12` = 48px
  benefitList: { gap: 24, marginBottom: 48 },
  // web `flex items-center gap-3` = 12px
  benefitRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  benefitRowRtl: { flexDirection: 'row-reverse' },
  benefitText: { color: theme.colors.secondary, flex: 1, fontSize: 16, lineHeight: 24 },
  sellerBtn: { alignSelf: 'center', paddingHorizontal: 32 },
});
