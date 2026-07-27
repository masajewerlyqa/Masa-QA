/**
 * Bundled web-aligned assets from masa-mobile/public/image (same files as Next /image/*).
 * Set EXPO_PUBLIC_SITE_URL when you need remote product-adjacent assets from the running site.
 */
import { resolveSiteUrl } from '../config/env';

const siteBase = resolveSiteUrl();

export const localAssets = {
  logoNav: require('../../public/image/logo-nav.png'),
  logoFooter: require('../../public/image/logo-footer.png'),
  heroBackground: require('../../public/image/bg-photo.jpeg'),
  logoBrowser: require('../../public/image/logo-browser.png'),
} as const;

export const webAssets = {
  logoNav: localAssets.logoNav,
  logoFooter: localAssets.logoFooter,
  heroBackground: localAssets.heroBackground,
  logoBrowser: localAssets.logoBrowser,
  /** Remote fallback only when site base is configured */
  remoteHero: siteBase ? `${siteBase}/image/bg-photo.jpeg` : undefined,
} as const;
