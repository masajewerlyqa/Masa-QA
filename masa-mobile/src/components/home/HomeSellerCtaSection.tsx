import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { navigateToBecomeSeller } from '../../lib/sellerNavigation';
import { MasaButton } from '../MasaButton';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeSellerCtaSection(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';
  const benefits = isArabic
    ? ['واجهة متجر رقمية', 'لوحة تحكم ذكية', 'لوجستيات آمنة', 'شبكة مشترين مميزة']
    : ['Digital storefront', 'Smart dashboard', 'Secure logistics', 'Premium buyers network'];

  return (
    <View style={styles.sellerSection}>
      <ContentContainer>
        <Text style={[styles.sellerTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
          {t('home.sellerTitle')}
        </Text>
        <Text style={styles.sellerSubtitle}>{t('home.sellerSubtitle')}</Text>
        {benefits.map((b) => (
          <Text key={b} style={styles.sellerBenefit}>
            • {b}
          </Text>
        ))}
        <MasaButton
          label={t('home.sellerCta')}
          onPress={() => void navigateToBecomeSeller()}
          style={styles.sellerBtn}
        />
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  sellerSection: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.sectionLg },
  sellerTitle: { color: theme.colors.white, fontSize: 32, lineHeight: 40, marginBottom: 12, textAlign: 'center' },
  sellerSubtitle: { color: theme.colors.secondary, fontSize: 16, lineHeight: 24, marginBottom: 24, textAlign: 'center' },
  sellerBenefit: { color: theme.colors.secondary, fontSize: 14, marginBottom: 8, textAlign: 'center' },
  sellerBtn: { alignSelf: 'center', marginTop: 16 },
});
