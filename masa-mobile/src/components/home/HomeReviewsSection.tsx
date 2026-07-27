import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { ContentContainer } from '../layout/ContentContainer';

export function HomeReviewsSection(): React.JSX.Element {
  const { t, language } = useSettings();
  const isArabic = language === 'ar';
  const brand = t('common.brand');
  const reviews = isArabic
    ? [
        { quote: `سهّلت ${brand} العثور على القطعة المناسبة. المستشار الذكي فهم تماماً ما أبحث عنه.`, author: 'سارة م.' },
        { quote: `بعت ذهبي عبر متجر موثّق في ${brand}. تسعير شفاف وعملية سلسة.`, author: 'أحمد ك.' },
        { quote: 'أخيراً سوق مجوهرات فاخر في قطر يمكنني الوثوق به.', author: 'ليلى ح.' },
      ]
    : [
        { quote: `${brand} made finding the right piece for our anniversary so easy. The AI advisor understood exactly what I was looking for.`, author: 'Sarah M.' },
        { quote: `I sold my gold through a verified store on ${brand}. Transparent pricing and smooth process.`, author: 'Ahmed K.' },
        { quote: 'Finally a luxury jewelry marketplace in Qatar I trust.', author: 'Layla H.' },
      ];

  return (
    <View style={styles.reviewsSection}>
      <ContentContainer>
        <Text style={[styles.sectionTitleCenter, { fontFamily: fontFamily(isArabic, 'luxury') }]}>
          {t('home.reviewsTitle')}
        </Text>
        <Text style={styles.sectionSubtitleCenter}>{t('home.reviewsSubtitle')}</Text>
        {reviews.map((r) => (
          <View key={r.author} style={styles.reviewCard}>
            <View style={styles.reviewStars}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons key={i} color={theme.colors.masaGold} name="star" size={20} />
              ))}
            </View>
            <Text style={styles.reviewQuote}>{r.quote}</Text>
            <Text style={styles.reviewAuthor}>— {r.author}</Text>
          </View>
        ))}
      </ContentContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  reviewsSection: { backgroundColor: theme.colors.masaLight, paddingVertical: theme.layout.sectionPy },
  sectionTitleCenter: { color: theme.colors.primary, fontSize: 30, lineHeight: 38, marginBottom: 12, textAlign: 'center' },
  sectionSubtitleCenter: { color: theme.colors.masaGray, fontSize: 14, lineHeight: 22, marginBottom: 32, textAlign: 'center' },
  reviewCard: { ...theme.surfaces.borderedCard, marginBottom: 16, padding: 24 },
  reviewStars: { flexDirection: 'row', gap: 2, marginBottom: 12 },
  reviewQuote: { color: theme.colors.foreground, fontSize: 16, lineHeight: 24, marginBottom: 12 },
  reviewAuthor: { color: theme.colors.primary, fontSize: 14 },
});
