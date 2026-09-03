import { Clock, Headphones, Mail, MapPin, Phone, Shield } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ContactFormMobile } from '../../components/contact/ContactFormMobile';
import { MasaCard } from '../../components/MasaCard';
import { FaqAccordion } from '../../components/page-layout/FaqAccordion';
import { MarketingPageScroll } from '../../components/page-layout/MarketingPageScroll';
import { PageHero } from '../../components/page-layout/PageHero';
import { PrimaryCtaBand } from '../../components/page-layout/PrimaryCtaBand';
import { getFaqItems } from '../../constants/pageContent/faq';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { goInfo } from '../../navigation/routes';
import { sitePages } from '../../constants/siteMap';

export function ContactScreen(): React.JSX.Element {
  const { isArabic, t } = useSettings();
  const brand = t('common.brand');
  const luxury = fontFamily(isArabic, 'luxury');

  const trustCards = isArabic
    ? [
        { title: 'دعم فاخر مخصص', body: 'فريقنا مدرّب للتعامل مع استفسارات المجوهرات عالية القيمة وشراكات الأعمال.', Icon: Headphones },
        { title: 'تواصل آمن', body: 'تُدار بياناتك ورسائلك بسرية كاملة وبمعايير أمان عالية.', Icon: Shield },
        { title: 'سرعة في الاستجابة', body: 'نهدف إلى الرد على جميع الاستفسارات خلال 24-48 ساعة.', Icon: Clock },
      ]
    : [
        { title: 'Dedicated luxury support', body: 'Our team is trained to assist with high-value jewelry inquiries and partnerships.', Icon: Headphones },
        { title: 'Secure communication', body: 'Your details and messages are handled with confidentiality and security.', Icon: Shield },
        { title: 'Fast response time', body: 'We aim to respond to all inquiries within 24–48 hours.', Icon: Clock },
      ];

  return (
    <MarketingPageScroll>
      <PageHero
        eyebrow={isArabic ? 'تواصل معنا' : 'Get in touch'}
        isArabic={isArabic}
        paddingY={56}
        subtitle={
          isArabic
            ? 'نحن هنا لمساعدتك في مشتريات المجوهرات الفاخرة، وشراكات البائعين، ودعم المنصة.'
            : 'We are here to assist you with luxury purchases, seller partnerships, and platform support.'
        }
        title={isArabic ? `تواصل مع ${brand}` : `Contact ${brand}`}
      />

      <View style={styles.formBand}>
        <View style={styles.formInner}>
          <MasaCard style={styles.formCard}>
            <Text style={[styles.formTitle, { fontFamily: luxury }]}>
              {isArabic ? 'أرسل رسالة' : 'Send a message'}
            </Text>
            <ContactFormMobile />
          </MasaCard>
          <View style={styles.details}>
            <Text style={[styles.formTitle, { fontFamily: luxury }]}>
              {isArabic ? 'تواصل معنا مباشرة' : 'Reach us directly'}
            </Text>
            <ContactRow Icon={MapPin} isArabic={isArabic} text={isArabic ? 'الدوحة، قطر' : 'Doha, Qatar'} />
            <ContactRow
              Icon={Mail}
              isArabic={isArabic}
              label={isArabic ? 'البريد الإلكتروني' : 'Email'}
              link="mailto:support@masajewelry.com"
              text="support@masajewelry.com"
            />
            <ContactRow
              Icon={Phone}
              isArabic={isArabic}
              label={isArabic ? 'الهاتف' : 'Phone'}
              link="tel:+97472233141"
              text="+974 7223 3141"
            />
          </View>
        </View>
      </View>

      <View style={styles.trustBand}>
        <Text style={[styles.trustHeading, { fontFamily: luxury }]}>
          {isArabic ? `لماذا تتواصل مع ${brand}` : `Why Contact ${brand}`}
        </Text>
        <Text style={[textStyle(isArabic, 'body'), styles.trustSub]}>
          {isArabic
            ? 'نمزج بين الخصوصية والأمان وسرعة الاستجابة في كل تواصل.'
            : 'We combine discretion, security and speed in every response.'}
        </Text>
        {trustCards.map(({ title, body, Icon }) => (
          <View key={title} style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <Icon color={theme.colors.primary} size={28} />
            </View>
            <Text style={[styles.trustTitle, { fontFamily: luxury }]}>{title}</Text>
            <Text style={textStyle(isArabic, 'body')}>{body}</Text>
          </View>
        ))}
      </View>

      <View style={styles.faqBand}>
        <Text style={[styles.trustHeading, { fontFamily: luxury }]}>
          {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </Text>
        <Text style={[textStyle(isArabic, 'body'), styles.trustSub]}>
          {isArabic
            ? `إجابات سريعة حول التسوق والبيع واستخدام ${brand}.`
            : `Quick answers about shopping, selling, and using ${brand}.`}
        </Text>
        <FaqAccordion isArabic={isArabic} items={getFaqItems(brand, isArabic)} />
      </View>

      <PrimaryCtaBand
        isArabic={isArabic}
        onPrimary={() => goInfo(sitePages.contact)}
        primaryLabel={isArabic ? 'قدّم كبائع' : 'Apply as Seller'}
        subtitle={
          isArabic
            ? 'انضم إلى سوق فاخر للمجوهرات مدعوم بالذكاء الاصطناعي.'
            : 'Join a premium AI-powered jewelry marketplace and reach high-value buyers across Qatar and the Middle East.'
        }
        title={isArabic ? `انضم كبائع في ${brand}` : `Become a ${brand} Seller`}
      />

      <View style={styles.seoBand}>
        <Text style={[textStyle(isArabic, 'body'), styles.seoText]}>
          {isArabic
            ? `${brand} سوق إلكتروني موثوق للمجوهرات الفاخرة في قطر.`
            : `${brand} is a trusted online luxury jewelry marketplace in Qatar, offering secure digital services for buying, selling, valuation, and intelligent jewelry discovery powered by AI technology.`}
        </Text>
      </View>
    </MarketingPageScroll>
  );
}

function ContactRow({
  Icon,
  text,
  label,
  link,
  isArabic,
}: {
  Icon: typeof MapPin;
  text: string;
  label?: string;
  link?: string;
  isArabic: boolean;
}): React.JSX.Element {
  const content = (
    <View style={styles.contactRow}>
      <View style={styles.contactIcon}>
        <Icon color={theme.colors.primary} size={20} />
      </View>
      <View>
        {label ? <Text style={textStyle(isArabic, 'bodySm')}>{label}</Text> : null}
        <Text style={[textStyle(isArabic, 'body'), { color: theme.colors.masaDark }]}>{text}</Text>
      </View>
    </View>
  );
  if (link) {
    return <Pressable onPress={() => void Linking.openURL(link)}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  formBand: {
    backgroundColor: 'rgba(247, 243, 238, 0.4)',
    paddingVertical: 48,
  },
  formInner: {
    gap: 48,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
  },
  formCard: {
    gap: 24,
    padding: 32,
  },
  formTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    marginBottom: 8,
  },
  details: { gap: 32 },
  trustBand: {
    backgroundColor: theme.colors.background,
    gap: 24,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 64,
  },
  trustHeading: {
    color: theme.colors.primary,
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'center',
  },
  trustSub: { marginBottom: 8, textAlign: 'center' },
  trustCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(247, 243, 238, 0.3)',
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 32,
  },
  trustIcon: {
    alignItems: 'center',
    borderColor: 'rgba(83, 28, 36, 0.15)',
    borderRadius: 999,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    marginBottom: 8,
    width: 56,
  },
  trustTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    textAlign: 'center',
  },
  faqBand: {
    backgroundColor: 'rgba(247, 243, 238, 0.4)',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    gap: 16,
    paddingBottom: 64,
    paddingTop: 64,
  },
  seoBand: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingVertical: 48,
  },
  seoText: { textAlign: 'center' },
  contactRow: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  contactIcon: {
    alignItems: 'center',
    borderColor: 'rgba(83, 28, 36, 0.15)',
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
