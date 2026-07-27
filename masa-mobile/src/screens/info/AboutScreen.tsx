import { Gem, Eye, Shield, Sparkles, HeartHandshake, Headphones, Store, BadgeCheck, Target } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { MarketingPageScroll } from '../../components/page-layout/MarketingPageScroll';
import { PageHero } from '../../components/page-layout/PageHero';
import { PrimaryCtaBand } from '../../components/page-layout/PrimaryCtaBand';
import { ProseBand } from '../../components/page-layout/ProseBand';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { navigateToBecomeSeller } from '../../lib/sellerNavigation';
import { goDiscover, goInfo } from '../../navigation/routes';
import { sitePages } from '../../constants/siteMap';

export function AboutScreen(): React.JSX.Element {
  const { isArabic, t } = useSettings();
  const brand = t('common.brand');
  const luxury = fontFamily(isArabic, 'luxury');

  const values = isArabic
    ? [
        { title: 'الأصالة أولاً', body: 'نعمل مع بائعين موثّقين وقطع أصلية، لأن الثقة أساس كل عملية شراء.', Icon: Gem },
        { title: 'أمان المعاملات', body: 'مدفوعات وتجربة تسوق مصممة لحمايتك من الطلب حتى التوصيل.', Icon: Shield },
        { title: 'شفافية', body: 'أسعار واضحة، مراجعات حقيقية، ومعلومات تساعدك على القرار بثقة.', Icon: Eye },
        { title: 'ابتكار مدعوم بالذكاء الاصطناعي', body: 'أدوات ذكية للاكتشاف والتوصية دون المساس بخصوصيتك أو أمانك.', Icon: Sparkles },
      ]
    : [
        { title: 'Authenticity first', body: 'We partner with verified sellers and genuine pieces—trust is the foundation of every purchase.', Icon: Gem },
        { title: 'Transaction security', body: 'Payments and shopping flows designed to protect you from checkout to delivery.', Icon: Shield },
        { title: 'Transparency', body: 'Clear pricing, real reviews, and information that helps you decide with confidence.', Icon: Eye },
        { title: 'AI-powered innovation', body: 'Smart discovery and recommendations without compromising your privacy or safety.', Icon: Sparkles },
      ];

  const clientBenefits = isArabic
    ? [
        'تسوّق من متاجر وعلامات مجوهرات مختارة وموثّقة.',
        'توصيات ذكية تساعدك على اكتشاف القطع المناسبة لك.',
        'مدفوعات آمنة وتجربة شراء واضحة من البداية للنهاية.',
        'دعم متواصل عند الحاجة—نحن بجانبك في رحلتك.',
      ]
    : [
        'Shop curated, verified jewelry boutiques and brands.',
        'Smart recommendations to help you discover pieces that fit your style.',
        'Secure payments and a clear purchase journey from start to finish.',
        'Responsive support when you need us—we are with you all the way.',
      ];

  const sellerBenefits = isArabic
    ? [
        'ظهور متجرك وعلامتك أمام مشترين يبحثون عن مجوهرات فاخرة موثوقة.',
        'شارة التوثيق والثقة—تُبرز احترافيتك وتقوّي ثقة العملاء بمتجرك.',
        'لوحة وإدارة منتجات وطلبات في مكان واحد، بواجهة واضحة وسهلة.',
        'الاستفادة من اكتشاف المنتجات والتوصيات الذكية لزيادة فرص ظهور مجموعتك.',
        `دعم وإرشاد من فريق ${brand} لمساعدتك في الانطلاق والنمو على المنصة.`,
      ]
    : [
        'Showcase your store and brand to buyers actively seeking trusted luxury jewelry.',
        'Verification and trust signals that highlight your professionalism and reassure customers.',
        'A unified dashboard to manage products and orders with a clear, efficient workflow.',
        'Benefit from intelligent discovery and recommendations so your collection reaches the right audience.',
        `Guidance and support from the ${brand} team to help you launch and grow on the platform.`,
      ];

  return (
    <MarketingPageScroll>
      <PageHero
        eyebrow={isArabic ? 'من نحن' : 'Who we are'}
        isArabic={isArabic}
        paddingY={56}
        subtitle={
          isArabic
            ? 'نجمع بين الأناقة والتقنية: سوق إلكتروني يوفّر لك قطعاً أصلية من بائعين موثّقين، مع أدوات ذكية لتجربة تسوق آمنة ومريحة في قطر وما حولها.'
            : 'We unite elegance and technology: a digital marketplace for authentic jewelry from verified sellers, with intelligent tools for a secure, confident shopping experience in Qatar and beyond.'
        }
        title={
          isArabic
            ? `${brand} منصة المجوهرات الفاخرة الذكية`
            : `${brand} — the intelligent luxury jewelry marketplace`
        }
      />

      <View style={styles.whiteBand}>
        <View style={styles.constrained}>
          <Text style={[styles.h2, { fontFamily: luxury }]}>{isArabic ? 'من نحن' : 'Who we are'}</Text>
          <Text style={textStyle(isArabic, 'body')}>
            {isArabic
              ? `${brand} منصة سوقية متخصصة في المجوهرات الفاخرة. هدفنا أن نجعل اكتشاف وشراء القطع الاستثنائية أبسط وأكثر أماناً.`
              : `${brand} is a marketplace dedicated to luxury jewelry. We make it simpler and safer to discover and acquire exceptional pieces.`}
          </Text>
          <Text style={textStyle(isArabic, 'body')}>
            {isArabic
              ? 'نؤمن بأن التكنولوجيا يجب أن تخدم الجمال والثقة: لذلك ندمج التوصيات الذكية، والتحقق من البائعين، وتجربة مستخدم واضحة في مكان واحد.'
              : 'We believe technology should serve beauty and trust—so we combine intelligent recommendations, seller verification, and a clear customer experience in one place.'}
          </Text>
        </View>
      </View>

      <ProseBand>
        <View style={styles.valuesHeader}>
          <Text style={[styles.h2Center, { fontFamily: luxury }]}>{isArabic ? 'قيمنا' : 'Our values'}</Text>
          <Text style={[styles.valuesSub, textStyle(isArabic, 'body')]}>
            {isArabic
              ? 'مبادئ نلتزم بها في كل تفاعل معك ومع شركائنا.'
              : 'Principles we uphold in every interaction with you and our partners.'}
          </Text>
        </View>
        <View style={styles.valuesGrid}>
          {values.map(({ title, body, Icon }) => (
            <MasaCard key={title} style={styles.valueCard}>
              <View style={styles.iconCircle}>
                <Icon color={theme.colors.primary} size={24} />
              </View>
              <Text style={[styles.valueTitle, { fontFamily: luxury }]}>{title}</Text>
              <Text style={textStyle(isArabic, 'body')}>{body}</Text>
            </MasaCard>
          ))}
        </View>
      </ProseBand>

      <View style={styles.whiteBand}>
        <View style={[styles.constrained, styles.missionCard]}>
          <View style={styles.missionIcon}>
            <Target color={theme.colors.white} size={28} />
          </View>
          <View style={styles.missionBody}>
            <Text style={[styles.h2, { fontFamily: luxury }]}>{isArabic ? 'مهمتنا' : 'Our mission'}</Text>
            <Text style={[styles.missionText, textStyle(isArabic, 'body')]}>
              {isArabic
                ? 'تمكين المشترين والبائعين من التواصل عبر منصة موثوقة، شفافة، ومدعومة بالذكاء الاصطناعي.'
                : 'To empower buyers and sellers through a trustworthy, transparent, AI-enhanced platform—where authenticity is honoured, customers are respected, and lasting relationships are built.'}
            </Text>
          </View>
        </View>
      </View>

      <ProseBand variant="light">
        <Text style={[styles.h2, { fontFamily: luxury }]}>
          {isArabic ? `ما الذي يقدّمه ${brand} لك كعميل؟` : `What ${brand} offers you as a client`}
        </Text>
        {clientBenefits.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <HeartHandshake color={theme.colors.primary} size={20} />
            <Text style={[styles.bulletText, textStyle(isArabic, 'body')]}>{line}</Text>
          </View>
        ))}
        <MasaButton label={isArabic ? 'تسوّق الآن' : 'Shop now'} onPress={() => goDiscover()} />
        <MasaCard style={styles.supportCard}>
          <View style={styles.quickHeader}>
            <Headphones color={theme.colors.primary} size={24} />
            <Text style={[styles.valueTitle, { fontFamily: luxury }]}>
              {isArabic ? 'نحن هنا من أجلك' : 'We are here for you'}
            </Text>
          </View>
          <Text style={textStyle(isArabic, 'body')}>
            {isArabic
              ? 'أسئلة عن منتج، طلب، أو حسابك؟ فريق الدعم جاهز لمساعدتك.'
              : 'Questions about a product, an order, or your account? Our support team is ready to help.'}
          </Text>
          <MasaButton
            label={isArabic ? 'تواصل معنا' : 'Contact us'}
            onPress={() => goInfo(sitePages.contact)}
            variant="outline"
          />
        </MasaCard>
      </ProseBand>

      <View style={styles.whiteBand}>
        <View style={styles.constrained}>
          <MasaCard style={styles.supportCard}>
            <View style={styles.quickHeader}>
              <Store color={theme.colors.primary} size={24} />
              <Text style={[styles.valueTitle, { fontFamily: luxury }]}>
                {isArabic ? 'شريكك في النمو الرقمي' : 'Your partner in digital growth'}
              </Text>
            </View>
            <Text style={textStyle(isArabic, 'body')}>
              {isArabic
                ? 'سواء كنت متجراً قائماً أو علامة ناشئة، نساعدك على بناء حضور احترافي وربط مجموعتك بعملاء يقدّرون الجودة.'
                : 'Whether you are an established boutique or an emerging brand, we help you build a professional presence and connect your collection with quality-focused customers.'}
            </Text>
          </MasaCard>
          <Text style={[styles.h2, { fontFamily: luxury, marginTop: 24 }]}>
            {isArabic ? `ماذا يقدّم ${brand} لمتاجركم وعلاماتكم؟` : `What ${brand} offers your store & brand`}
          </Text>
          {sellerBenefits.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <BadgeCheck color={theme.colors.primary} size={20} />
              <Text style={[styles.bulletText, textStyle(isArabic, 'body')]}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <PrimaryCtaBand
        isArabic={isArabic}
        onPrimary={() => void navigateToBecomeSeller()}
        onSecondary={() => goInfo(sitePages.contact)}
        primaryLabel={isArabic ? 'قدّم طلب البائع' : `Apply to sell on ${brand}`}
        secondaryLabel={isArabic ? 'تحدث مع فريق الشراكات' : 'Talk to our partnerships team'}
        subtitle={
          isArabic
            ? `هل تمثّل علامة تجارية أو متجر مجوهرات؟ انضم إلى شبكة البائعين الموثّقين في ${brand}.`
            : `Represent a brand or jewelry boutique? Join ${brand}'s verified seller network and showcase your collection.`
        }
        title={isArabic ? 'انضم إلينا الآن' : 'Join us now'}
      />
    </MarketingPageScroll>
  );
}

const styles = StyleSheet.create({
  whiteBand: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingVertical: 56,
  },
  constrained: {
    gap: 20,
    maxWidth: 768,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    width: '100%',
    alignSelf: 'center',
  },
  h2: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 32,
  },
  h2Center: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  valuesHeader: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  valuesSub: { textAlign: 'center' },
  valuesGrid: {
    gap: 24,
    width: '100%',
  },
  valueCard: { gap: 12 },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(83, 28, 36, 0.1)',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  valueTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    lineHeight: 24,
  },
  missionCard: {
    backgroundColor: 'rgba(247, 243, 238, 0.8)',
    borderColor: 'rgba(83, 28, 36, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 24,
    padding: 32,
  },
  missionIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  missionBody: { flex: 1, gap: 16 },
  missionText: { color: theme.colors.masaDark, fontSize: 18 },
  bulletRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  bulletText: { color: theme.colors.masaDark, flex: 1 },
  supportCard: { gap: 12, marginTop: 8 },
  quickHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
});
