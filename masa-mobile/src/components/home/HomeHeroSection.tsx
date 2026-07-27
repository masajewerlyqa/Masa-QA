import { ArrowRight, BadgeCheck, Gem, Lock, Sparkles } from 'lucide-react-native';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { webAssets } from '../../constants/assets';
import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { goAuth, goDiscover } from '../../navigation/routes';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeHeroSection(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  return (
    <View style={styles.heroWrap}>
      <ImageBackground resizeMode="cover" source={webAssets.heroBackground} style={styles.heroBg}>
        <LinearGradient
          colors={['rgba(247,243,238,0.95)', 'rgba(247,243,238,0.8)', 'rgba(247,243,238,0.25)']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <ContentContainer>
          <View style={styles.heroContent}>
            <Text style={[styles.heroTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
              {t('home.heroTitle')}
            </Text>
            <Text style={[styles.heroDesc, { fontFamily: fontFamily(isArabic, 'body') }]}>
              {t('home.heroDescription')}
            </Text>
            <View style={styles.heroCtas}>
              <Pressable onPress={() => goDiscover()} style={styles.primaryCta}>
                <Text style={styles.primaryCtaText}>{t('home.heroPrimaryCta')}</Text>
                <ArrowRight
                  color={theme.colors.white}
                  size={20}
                  style={isArabic ? styles.ctaIconRtl : styles.ctaIcon}
                />
              </Pressable>
              <Pressable onPress={() => goAuth()} style={styles.secondaryCta}>
                <Sparkles color={theme.colors.primary} size={20} />
                <Text style={styles.secondaryCtaText}>{t('home.heroSecondaryCta')}</Text>
              </Pressable>
            </View>
            <View style={styles.trustRow}>
              {[
                { Icon: Lock, label: isArabic ? 'مدفوعات آمنة' : 'Secure payments' },
                { Icon: BadgeCheck, label: isArabic ? 'بائعون موثّقون' : 'Verified sellers' },
                { Icon: Gem, label: isArabic ? 'منتجات أصلية' : 'Authentic products' },
              ].map((item) => (
                <View key={item.label} style={styles.trustItem}>
                  <item.Icon color={theme.colors.primary} size={20} />
                  <Text style={styles.trustLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ContentContainer>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: { minHeight: theme.layout.heroMinHeight },
  heroBg: { flex: 1, minHeight: theme.layout.heroMinHeight },
  heroContent: { paddingVertical: 48 },
  heroTitle: { color: theme.colors.primary, fontSize: 30, lineHeight: 38, marginBottom: 12 },
  heroDesc: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 20, maxWidth: 400 },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  primaryCta: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primaryCtaText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  ctaIcon: { marginLeft: 4 },
  ctaIconRtl: { marginRight: 4, transform: [{ rotate: '180deg' }] },
  secondaryCta: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  secondaryCtaText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 24 },
  trustItem: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  trustLabel: { color: theme.colors.masaGray, fontSize: 14 },
});
