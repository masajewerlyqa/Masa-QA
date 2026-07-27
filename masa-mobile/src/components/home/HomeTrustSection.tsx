import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeTrustSection(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';

  const buyerItems = [
    { icon: 'shield-outline' as const, title: t('home.trust.buyer1Title'), desc: t('home.trust.buyer1Desc') },
    { icon: 'globe-outline' as const, title: t('home.trust.buyer2Title'), desc: t('home.trust.buyer2Desc') },
    { icon: 'star-outline' as const, title: t('home.trust.buyer3Title'), desc: t('home.trust.buyer3Desc') },
  ];
  const sellerItems = [
    { icon: 'checkmark-circle-outline' as const, title: t('home.trust.seller1Title'), desc: t('home.trust.seller1Desc') },
    { icon: 'storefront-outline' as const, title: t('home.trust.seller2Title'), desc: t('home.trust.seller2Desc') },
    { icon: 'people-outline' as const, title: t('home.trust.seller3Title'), desc: t('home.trust.seller3Desc') },
  ];

  return (
    <View style={styles.trustSection}>
      <ContentContainer>
        <TrustColumn
          heading={t('home.trust.buyersTitle')}
          isArabic={isArabic}
          items={buyerItems}
          subtitle={t('home.trust.buyersSubtitle')}
        />
        <View style={styles.trustDivider} />
        <TrustColumn
          heading={t('home.trust.sellersTitle')}
          isArabic={isArabic}
          items={sellerItems}
          subtitle={t('home.trust.sellersSubtitle')}
        />
      </ContentContainer>
    </View>
  );
}

function TrustColumn({
  heading,
  subtitle,
  items,
  isArabic,
}: {
  heading: string;
  subtitle: string;
  items: Array<{ icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }>;
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.trustColumn}>
      <Text style={[styles.trustHeading, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{heading}</Text>
      <Text style={styles.trustSubheading}>{subtitle}</Text>
      {items.map((item) => (
        <View key={item.title} style={styles.trustItemRow}>
          <View style={styles.trustIconCircle}>
            <Ionicons color={theme.colors.primary} name={item.icon} size={28} />
          </View>
          <View style={styles.trustCopy}>
            <Text style={[styles.trustItemTitle, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
              {item.title}
            </Text>
            <Text style={styles.trustItemDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  trustSection: { backgroundColor: theme.colors.masaLight, borderColor: theme.colors.border, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: theme.layout.sectionPy },
  trustDivider: { backgroundColor: theme.colors.border, height: 1, marginVertical: 32 },
  trustColumn: { gap: 8 },
  trustHeading: { color: theme.colors.primary, fontSize: 24, marginBottom: 8, textAlign: 'center' },
  trustSubheading: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 24, textAlign: 'center' },
  trustItemRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  trustIconCircle: { alignItems: 'center', backgroundColor: theme.colors.white, borderColor: theme.colors.border, borderRadius: 28, borderWidth: 1, height: 56, justifyContent: 'center', width: 56 },
  trustCopy: { flex: 1 },
  trustItemTitle: { color: theme.colors.primary, fontSize: 16, marginBottom: 4 },
  trustItemDesc: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22 },
});
