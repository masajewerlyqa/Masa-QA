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

function AppleLogoIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }): React.JSX.Element {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
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

function GooglePlayBrandIcon(): React.JSX.Element {
  return (
    <Svg height={24} viewBox="0 0 28.99 31.99" width={22}>
      <Path d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z" fill="#ea4335" />
      <Path d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z" fill="#fbbc04" />
      <Path d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z" fill="#4285f4" />
      <Path d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z" fill="#34a853" />
    </Svg>
  );
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

const iosAppStoreUrl = process.env.EXPO_PUBLIC_IOS_APP_STORE_URL?.trim() ?? '';
const androidPlayStoreUrl = process.env.EXPO_PUBLIC_ANDROID_PLAY_STORE_URL?.trim() ?? '';

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
          <Text style={[styles.description, textStyle(isArabic, 'bodySm')]}>{t('footer.description')}</Text>

          <View style={styles.socialRow}>
            {SOCIAL_LINKS.map(({ href, Icon }) => (
              <Pressable key={href} onPress={() => void Linking.openURL(href)} style={styles.socialBtn}>
                <Icon color={theme.colors.white} size={20} />
              </Pressable>
            ))}
          </View>

          <Text
            style={[
              styles.appLabel,
              isArabic ? styles.appLabelArabic : null,
              textStyle(isArabic, 'caption'),
            ]}
          >
            {t('footer.getTheApp')}
          </Text>
          <View style={styles.appRow}>
            {iosAppStoreUrl ? (
              <Pressable
                accessibilityLabel={t('footer.downloadOnAppStore')}
                onPress={() => void Linking.openURL(iosAppStoreUrl)}
                style={styles.socialBtn}
              >
                <AppleLogoIcon />
              </Pressable>
            ) : (
              <View
                accessibilityLabel={`${t('footer.downloadOnAppStore')} — ${t('footer.appLinkComingSoon')}`}
                style={[styles.socialBtn, styles.appBtnDisabled]}
              >
                <AppleLogoIcon color="rgba(255,255,255,0.7)" />
              </View>
            )}
            {androidPlayStoreUrl ? (
              <Pressable
                accessibilityLabel={t('footer.getItOnGooglePlay')}
                onPress={() => void Linking.openURL(androidPlayStoreUrl)}
                style={styles.socialBtn}
              >
                <GooglePlayBrandIcon />
              </Pressable>
            ) : (
              <View
                accessibilityLabel={`${t('footer.getItOnGooglePlay')} — ${t('footer.appLinkComingSoon')}`}
                style={[styles.socialBtn, styles.appBtnDisabled]}
              >
                <GooglePlayBrandIcon />
              </View>
            )}
          </View>

          <View style={styles.newsletterBlock}>
            <Text style={[styles.newsletterTitle, { fontFamily: luxury }]}>{t('footer.newsletter')}</Text>
            <Text style={[styles.newsletterHint, textStyle(isArabic, 'bodySm')]}>{t('footer.newsletterHint')}</Text>
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
    color: theme.colors.secondary,
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
  appLabel: {
    color: 'rgba(231,216,195,0.9)',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  appLabelArabic: {
    letterSpacing: 0,
    textTransform: 'none',
  },
  appRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  appBtnDisabled: {
    opacity: 0.45,
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
    color: theme.colors.secondary,
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
