import { Circle, Ruler } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { DataTable } from '../../components/page-layout/DataTable';
import { MarketingPageScroll } from '../../components/page-layout/MarketingPageScroll';
import { PageHero } from '../../components/page-layout/PageHero';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { goInfo } from '../../navigation/routes';
import { sitePages } from '../../constants/siteMap';

export function SizeGuideScreen(): React.JSX.Element {
  const { isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  return (
    <MarketingPageScroll>
      <PageHero
        eyebrow={isArabic ? 'اعثر على المقاس المناسب' : 'Find your fit'}
        isArabic={isArabic}
        paddingY={80}
        subtitle={
          isArabic
            ? 'اختر المقاس المناسب للخواتم والأساور والقلائد. قد تختلف المقاسات قليلًا حسب التصميم.'
            : 'Choose the right size for rings, bracelets, and necklaces. Sizes may vary slightly by designer—when in doubt, contact the seller.'
        }
        title={isArabic ? 'دليل المقاسات' : 'Size Guide'}
      />

      <SizeSection
        description={
          isArabic
            ? 'قس المحيط الداخلي لخاتم ترتديه أو محيط الإصبع بالملليمتر، ثم قارن بالجدول.'
            : 'Measure the inner circumference of a ring you already wear, or the circumference of your finger in mm. Compare to the table below.'
        }
        headers={['US', 'UK', 'EU', isArabic ? 'المحيط (مم)' : 'Circumference (mm)']}
        isArabic={isArabic}
        rows={[
          ['5', 'J½', '52', '49.3'],
          ['6', 'L½', '54', '52.0'],
          ['7', 'O', '54.5', '54.4'],
          ['8', 'Q', '57', '57.0'],
          ['9', 'S', '59', '59.6'],
          ['10', 'U', '60.5', '62.2'],
        ]}
        title={isArabic ? 'مقاسات الخواتم' : 'Ring sizes'}
        variant="light"
      />

      <SizeSection
        description={
          isArabic
            ? 'قس المعصم وأضف الطول المقترح حسب درجة الاتساع المطلوبة.'
            : 'Measure your wrist and add the suggested length for the fit you want.'
        }
        headers={[isArabic ? 'المقاس' : 'Fit', isArabic ? 'الطول (سم)' : 'Length (cm)', isArabic ? 'مناسب لـ' : 'Suitable for']}
        isArabic={isArabic}
        rows={[
          [isArabic ? 'مشدود' : 'Snug', '14 – 15', isArabic ? 'معصم صغير' : 'Small wrist, bangle-style'],
          [isArabic ? 'قياسي' : 'Standard', '16 – 18', isArabic ? 'معظم البالغين' : 'Most adults'],
          [isArabic ? 'واسع' : 'Loose', '19 – 21', isArabic ? 'مظهر طبقات' : 'Layered look, larger wrist'],
        ]}
        title={isArabic ? 'أطوال الأساور' : 'Bracelet lengths'}
        variant="white"
      />

      <SizeSection
        description={
          isArabic
            ? 'يُقاس الطول على امتداد السلسلة عند فردها. اختر حسب الأسلوب وشكل الياقة.'
            : 'Length is measured along the chain or strand when laid flat. Choose by style and neckline.'
        }
        headers={[
          isArabic ? 'الطول (إنش)' : 'Length (inches)',
          isArabic ? 'الطول (سم)' : 'Length (cm)',
          isArabic ? 'النمط' : 'Style',
        ]}
        isArabic={isArabic}
        rows={[
          ['14 – 16', '35 – 40', isArabic ? 'تشوكر / طوق' : 'Choker, collar'],
          ['18 – 20', '45 – 50', isArabic ? 'برنسس / ماتينيه' : 'Princess, matinee'],
          ['22 – 24', '55 – 60', 'Opera'],
          ['28 – 36', '70 – 90', isArabic ? 'طويل / حبل' : 'Rope, long'],
        ]}
        title={isArabic ? 'أطوال القلائد' : 'Necklace lengths'}
        variant="light"
      />

      <View style={styles.ctaBand}>
        <View style={styles.iconCircle}>
          <Ruler color={theme.colors.primary} size={24} />
        </View>
        <Text style={[styles.ctaTitle, { fontFamily: luxury }]}>
          {isArabic ? 'تحتاج مساعدة في القياس؟' : 'Need help measuring?'}
        </Text>
        <Text style={[styles.ctaBody, textStyle(isArabic, 'body')]}>
          {isArabic
            ? 'قد تختلف المقاسات بين العلامات. عند الشك، تواصل مع البائع أو فريق الدعم.'
            : 'Sizes can vary by brand. When in doubt, contact the seller or our support team for help choosing the right size.'}
        </Text>
        <MasaButton
          label={isArabic ? 'تواصل مع الدعم' : 'Contact support'}
          onPress={() => goInfo(sitePages.contact)}
          variant="outline"
        />
      </View>
    </MarketingPageScroll>
  );
}

function SizeSection({
  title,
  description,
  headers,
  rows,
  isArabic,
  variant,
}: {
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  isArabic: boolean;
  variant: 'light' | 'white';
}): React.JSX.Element {
  const luxury = fontFamily(isArabic, 'luxury');
  return (
    <View style={[styles.section, variant === 'light' ? styles.sectionLight : styles.sectionWhite]}>
      <View style={styles.sectionInner}>
        <View style={styles.sectionHead}>
          <View style={styles.iconCircle}>
            <Circle color={theme.colors.primary} size={24} />
          </View>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{title}</Text>
        </View>
        <Text style={textStyle(isArabic, 'body')}>{description}</Text>
        <DataTable headers={headers} isArabic={isArabic} rows={rows} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingVertical: 64,
  },
  sectionLight: { backgroundColor: 'rgba(247, 243, 238, 0.4)' },
  sectionWhite: { backgroundColor: theme.colors.background },
  sectionInner: {
    gap: 24,
    maxWidth: 896,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHead: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  sectionTitle: { color: theme.colors.primary, fontSize: 24, lineHeight: 32 },
  iconCircle: {
    alignItems: 'center',
    borderColor: 'rgba(83, 28, 36, 0.15)',
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  ctaBand: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: 16,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 64,
  },
  ctaTitle: { color: theme.colors.primary, fontSize: 24, textAlign: 'center' },
  ctaBody: { marginBottom: 8, textAlign: 'center' },
});
