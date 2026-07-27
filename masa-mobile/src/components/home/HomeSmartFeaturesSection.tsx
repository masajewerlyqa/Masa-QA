import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { goAdvisor, goSellGold, goZakat } from '../../navigation/routes';
import { MasaButton } from '../MasaButton';
import { ContentContainer } from '../layout/ContentContainer';

const smartTools = [
  {
    id: 'advisor',
    icon: 'sparkles-outline' as const,
    titleKey: 'home.advisorTitle',
    descKey: 'home.advisorDesc',
    ctaKey: 'home.advisorCta',
    action: goAdvisor,
  },
  {
    id: 'zakat',
    icon: 'calculator-outline' as const,
    titleKey: 'home.zakatTitle',
    descKey: 'home.zakatDesc',
    ctaKey: 'home.zakatCta',
    action: goZakat,
  },
  {
    id: 'sell',
    icon: 'cash-outline' as const,
    titleKey: 'home.sellTitle',
    descKey: 'home.sellDesc',
    ctaKey: 'home.sellCta',
    action: goSellGold,
  },
];

export function HomeSmartFeaturesSection(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  return (
    <View style={styles.whiteSection}>
      <ContentContainer>
        <Text style={[styles.sectionTitleCenter, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
          {t('home.smartTitle')}
        </Text>
        <Text style={styles.sectionSubtitleCenter}>{t('home.smartSubtitle')}</Text>
        <View style={styles.smartGrid}>
          {smartTools.map((tool) => (
            <View key={tool.id} style={styles.smartCard}>
              <View style={styles.smartIconWrap}>
                <Ionicons color={theme.colors.primary} name={tool.icon} size={28} />
              </View>
              <Text style={[styles.smartTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
                {t(tool.titleKey)}
              </Text>
              <Text style={styles.smartDesc}>{t(tool.descKey)}</Text>
              <MasaButton label={t(tool.ctaKey)} onPress={tool.action} variant="outline" />
            </View>
          ))}
        </View>
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteSection: { backgroundColor: theme.colors.background, paddingVertical: theme.layout.sectionPy },
  sectionTitleCenter: { color: theme.colors.primary, fontSize: 30, lineHeight: 38, marginBottom: 12, textAlign: 'center' },
  sectionSubtitleCenter: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 32, textAlign: 'center' },
  smartGrid: { gap: 24 },
  smartCard: { ...theme.surfaces.featureCard, padding: 24 },
  smartIconWrap: { alignItems: 'center', backgroundColor: 'rgba(83,28,36,0.1)', borderRadius: 12, height: 56, justifyContent: 'center', marginBottom: 16, width: 56 },
  smartTitle: { color: theme.colors.masaDark, fontSize: 20, marginBottom: 8 },
  smartDesc: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 16 },
});
