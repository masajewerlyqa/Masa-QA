import { StyleSheet, Text, View } from 'react-native';

import { FaqAccordion } from '../../components/page-layout/FaqAccordion';
import { MarketingPageScroll } from '../../components/page-layout/MarketingPageScroll';
import { PageHero } from '../../components/page-layout/PageHero';
import { getFaqItems } from '../../constants/pageContent/faq';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';

/** Mirrors `/contact#faq` section on mobile web */
export function FaqScreen(): React.JSX.Element {
  const { isArabic, t } = useSettings();
  const brand = t('common.brand');

  return (
    <MarketingPageScroll>
      <PageHero
        eyebrow={isArabic ? 'الدعم' : 'Support'}
        isArabic={isArabic}
        paddingY={56}
        subtitle={
          isArabic
            ? `إجابات سريعة حول التسوق والبيع واستخدام ${brand}.`
            : `Quick answers about shopping, selling, and using ${brand}.`}
        title={isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
      />
      <View style={styles.faqBand}>
        <FaqAccordion isArabic={isArabic} items={getFaqItems(brand, isArabic)} />
      </View>
    </MarketingPageScroll>
  );
}

const styles = StyleSheet.create({
  faqBand: {
    backgroundColor: 'rgba(247, 243, 238, 0.4)',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingBottom: 64,
    paddingTop: 32,
  },
});
