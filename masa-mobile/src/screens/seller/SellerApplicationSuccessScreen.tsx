import { StyleSheet, Text, View } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { parseSellerPlanId } from '../../constants/sellerPlans';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import { goHome, goProfile } from '../../navigation/routes';

export function SellerApplicationSuccessScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'SellerApplicationSuccess'>>();
  const { isArabic, t } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const planId = parseSellerPlanId(route.params?.planId);
  const planName =
    planId === 'premium'
      ? t('sellerOnboarding.premiumName')
      : t('sellerOnboarding.basicName');

  return (
    <SiteShell>
      <View style={styles.wrap}>
        <MasaCard style={styles.card}>
          <Text style={[styles.title, { fontFamily: luxury }]}>
            {t('sellerOnboarding.successPageTitle')}
          </Text>
          <Text style={textStyle(isArabic, 'body')}>
            {t('sellerOnboarding.successPageSubtitle')}
          </Text>
          {planId ? (
            <Text style={textStyle(isArabic, 'bodySm')}>
              {t('sellerOnboarding.successPlanLabel')}: {planName}
            </Text>
          ) : null}
          <Text style={textStyle(isArabic, 'body')}>
            {t('sellerOnboarding.successReviewNote')}
          </Text>
          <MasaButton
            label={t('sellerOnboarding.successBackHome')}
            onPress={() => goHome()}
          />
          <MasaButton
            label={t('sellerOnboarding.successGoAccount')}
            onPress={() => goProfile()}
            variant="outline"
          />
        </MasaCard>
      </View>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: MOBILE_CONTENT_PADDING_X,
  },
  card: { gap: 16 },
  title: {
    color: theme.colors.primary,
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
  },
});
