import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeFeaturesStrip(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';
  const features = [
    { icon: 'shield-outline' as const, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: 'ribbon-outline' as const, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: 'sparkles-outline' as const, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: 'trending-up-outline' as const, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
  ];

  return (
    <View style={styles.featuresStrip}>
      <ContentContainer>
        <View style={styles.featuresGrid}>
          {features.map((f) => (
            <View key={f.title} style={styles.featureCell}>
              <View style={styles.featureIconCircle}>
                <Ionicons color={theme.colors.primary} name={f.icon} size={32} />
              </View>
              <Text style={[styles.featureTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
                {f.title}
              </Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  featuresStrip: { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 48 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  featureCell: { alignItems: 'center', marginBottom: 24, paddingHorizontal: 8, width: '50%' },
  featureIconCircle: { alignItems: 'center', backgroundColor: theme.colors.masaLight, borderRadius: 32, height: 64, justifyContent: 'center', marginBottom: 12, width: 64 },
  featureTitle: { color: theme.colors.primary, fontSize: 18, marginBottom: 8, textAlign: 'center' },
  featureDesc: { color: theme.colors.masaGray, fontSize: 14, textAlign: 'center' },
});
