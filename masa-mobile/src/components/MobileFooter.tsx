import { Ionicons } from '@expo/vector-icons';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DiamondPattern } from './DiamondPattern';
import { FooterNewsletter } from './FooterNewsletter';
import { webAssets } from '../constants/assets';
import { MOBILE_BOTTOM_NAV_HEIGHT, MOBILE_CONTENT_PADDING_X, MOBILE_FOOTER_MARGIN_TOP } from '../constants/layout';
import { sitePages } from '../constants/siteMap';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { navigateToBecomeSeller } from '../lib/sellerNavigation';
import { goDiscover, goHome, goInfo } from '../navigation/routes';

function TikTokIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }): React.JSX.Element {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </Svg>
  );
}

function SnapchatIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }): React.JSX.Element {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
    </Svg>
  );
}

function FacebookIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }): React.JSX.Element {
  return <Ionicons color={color} name="logo-facebook" size={size} />;
}

function InstagramIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }): React.JSX.Element {
  return <Ionicons color={color} name="logo-instagram" size={size} />;
}

function TwitterIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }): React.JSX.Element {
  return <Ionicons color={color} name="logo-twitter" size={size} />;
}

type SocialLink = {
  href: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://x.com/masajewelry_ar', Icon: TwitterIcon },
  { href: 'https://www.facebook.com/profile.php?id=61577488271138', Icon: FacebookIcon },
  { href: 'https://www.tiktok.com/@masajewelry.ar', Icon: TikTokIcon },
  { href: 'https://www.instagram.com/masajewelry.ar', Icon: InstagramIcon },
  { href: 'https://www.snapchat.com/@masajewelry.ar', Icon: SnapchatIcon },
];

export function MobileFooter(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const insets = useSafeAreaInsets();
  const brand = t('common.brand');
  const year = new Date().getFullYear();
  const luxury = fontFamily(isArabic, 'luxury');

  const shopLinks = [
    { label: t('footer.shopLinks.allJewelry'), action: () => goDiscover() },
    { label: t('footer.shopLinks.rings'), action: () => goDiscover({ category: 'Ring' }) },
    { label: t('footer.shopLinks.necklaces'), action: () => goDiscover({ category: 'Necklace' }) },
    { label: t('footer.shopLinks.earrings'), action: () => goDiscover({ category: 'Earrings' }) },
    { label: t('footer.shopLinks.bracelets'), action: () => goDiscover({ category: 'Bracelet' }) },
  ];

  const supportLinks = [
    { label: t('footer.supportLinks.about'), action: () => goInfo(sitePages.about) },
    { label: t('footer.supportLinks.sizeGuide'), action: () => goInfo(sitePages.sizeGuide) },
    { label: t('footer.supportLinks.delivery'), action: () => goInfo(sitePages.delivery) },
    { label: t('footer.supportLinks.returns'), action: () => goInfo(sitePages.returns) },
    { label: t('footer.supportLinks.faq'), action: () => goInfo(sitePages.faq) },
    { label: t('footer.supportLinks.becomeSeller'), action: () => void navigateToBecomeSeller() },
    { label: t('footer.supportLinks.contactUs'), action: () => goInfo(sitePages.contact) },
  ];

  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: MOBILE_BOTTOM_NAV_HEIGHT + insets.bottom },
      ]}
    >
      <View style={styles.patternWrap}>
        <DiamondPattern />
      </View>

      <View style={styles.inner}>
        <View style={styles.brandBlock}>
          <Pressable accessibilityLabel={`${brand} Home`} onPress={() => goHome()}>
            <Image resizeMode="contain" source={webAssets.logoFooter} style={styles.logo} />
          </Pressable>
          {/* textStyle() must come first: it sets its own `color`, and RN style
              arrays let later entries win -- putting it after styles.description
              silently overrode the white text with textStyle's masaDark. */}
          <Text style={[textStyle(isArabic, 'bodySm'), styles.description]}>{t('footer.description')}</Text>

          <View style={styles.socialRow}>
            {SOCIAL_LINKS.map(({ href, Icon }) => (
              <Pressable key={href} onPress={() => void Linking.openURL(href)} style={styles.socialBtn}>
                <Icon color={theme.colors.white} size={20} />
              </Pressable>
            ))}
          </View>

          <View style={styles.newsletterBlock}>
            <Text style={[styles.newsletterTitle, { fontFamily: luxury }]}>{t('footer.newsletter')}</Text>
            <Text style={[textStyle(isArabic, 'bodySm'), styles.newsletterHint]}>{t('footer.newsletterHint')}</Text>
            <FooterNewsletter />
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Pressable onPress={() => goDiscover()}>
              <Text style={[styles.columnTitle, { fontFamily: luxury }]}>{t('footer.shop')}</Text>
            </Pressable>
            {shopLinks.map((link) => (
              <Pressable key={link.label} onPress={link.action}>
                <Text style={styles.link}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={[styles.columnTitle, { fontFamily: luxury }]}>{t('footer.support')}</Text>
            {supportLinks.map((link) => (
              <Pressable key={link.label} onPress={link.action}>
                <Text style={styles.link}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.legalRow}>
          <Text style={styles.copy}>
            © {year} {brand}. {t('footer.allRightsReserved')}
          </Text>
          <View style={styles.legalLinks}>
            <Pressable onPress={() => goInfo(sitePages.privacy)}>
              <Text style={styles.legalLink}>{t('footer.privacyPolicy')}</Text>
            </Pressable>
            <Pressable onPress={() => goInfo(sitePages.terms)}>
              <Text style={styles.legalLink}>{t('footer.terms')}</Text>
            </Pressable>
            <Pressable onPress={() => goInfo(sitePages.cookies)}>
              <Text style={styles.legalLink}>{t('footer.cookiePolicy')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: theme.colors.primary,
    marginTop: MOBILE_FOOTER_MARGIN_TOP,
    overflow: 'hidden',
    position: 'relative',
  },
  patternWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  inner: {
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 48,
    paddingBottom: 16,
  },
  brandBlock: {
    marginBottom: 32,
  },
  logo: {
    height: 64,
    marginBottom: 24,
    width: 200,
  },
  description: {
    color: theme.colors.white,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 400,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  socialBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  newsletterBlock: {
    marginTop: 0,
  },
  newsletterTitle: {
    color: theme.colors.white,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  newsletterHint: {
    color: theme.colors.white,
    lineHeight: 22,
    marginBottom: 8,
  },
  columns: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  columnTitle: {
    color: theme.colors.white,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  link: {
    color: theme.colors.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
  legalRow: {
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    gap: 16,
    paddingTop: 32,
  },
  copy: {
    color: theme.colors.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  legalLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  legalLink: {
    color: theme.colors.secondary,
    fontSize: 14,
  },
});
