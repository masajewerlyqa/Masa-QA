import { ar } from './ar';
import { en } from './en';
import { mobileOverrides } from './mobileOverrides';

import type { AppLanguage } from '../context/SettingsContext';

const dictionaries = { en, ar } as const;

/** Flat keys used in older mobile screens → web dictionary paths. */
const legacyKeyMap: Record<string, string> = {
  home: 'mobileNav.home',
  discover: 'mobileNav.discover',
  wishlist: 'mobileNav.wishlist',
  cart: 'mobileNav.cart',
  profile: 'mobileNav.profile',
  support: 'navbar.support',
  tools: 'navbar.tools',
  menu: 'navbar.openMenu',
  search: 'navbar.searchMobilePlaceholder',
  discoverTitle: 'marketplace.discover',
  discoverSubtitle: 'marketplace.discoverSubtitle',
  discoverSearch: 'marketplace.searchProductsBrands',
  filters: 'marketplace.filters',
  sortBy: 'marketplace.sortBy',
  wishlistTitle: 'mobileNav.wishlist',
  wishlistEmpty: 'wishlist.empty',
  cartTitle: 'cart.title',
  cartEmpty: 'cart.empty',
  accountTitle: 'account.accountPage.myAccount',
  accountSubtitle: 'account.accountPage.manageProfile',
  supportTitle: 'navbar.support',
  toolsTitle: 'navbar.tools',
  exclusiveOffers: 'home.exclusiveOffers',
  exclusiveOffersSubtitle: 'home.exclusiveOffersSubtitle',
  smartExperience: 'home.smartTitle',
  smartExperienceSubtitle: 'home.smartSubtitle',
  trustTitle: 'home.trust.buyersTitle',
  trustSubtitle: 'home.trust.buyersSubtitle',
  latestPieces: 'home.latestTitle',
  latestPiecesSubtitle: 'home.latestSubtitle',
  premiumStores: 'home.brandsTitle',
  premiumStoresSubtitle: 'home.brandsSubtitle',
  sellerCta: 'home.sellerTitle',
  sellerCtaSubtitle: 'home.sellerSubtitle',
  reviewsTitle: 'home.reviewsTitle',
  reviewsSubtitle: 'home.reviewsSubtitle',
};

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

export function translate(language: AppLanguage, key: string): string | undefined {
  const resolvedKey = legacyKeyMap[key] ?? key;
  const override = mobileOverrides[language][resolvedKey] ?? mobileOverrides[language][key];
  if (override) return override;

  const dict = dictionaries[language] as Record<string, unknown>;
  const value = getByPath(dict, resolvedKey);
  if (typeof value === 'string') return value;

  if (resolvedKey !== key) {
    const legacyValue = getByPath(dict, key);
    if (typeof legacyValue === 'string') return legacyValue;
  }

  if (language !== 'en') {
    const enValue = getByPath(dictionaries.en as Record<string, unknown>, resolvedKey);
    if (typeof enValue === 'string') return enValue;
  }

  return undefined;
}

export function t(language: AppLanguage, key: string, fallback?: string): string {
  return translate(language, key) ?? fallback ?? key;
}

/** For array-shaped dictionary entries (e.g. feature lists) that `t()` cannot return. */
export function translateList(language: AppLanguage, key: string): string[] {
  const resolvedKey = legacyKeyMap[key] ?? key;
  const dict = dictionaries[language] as Record<string, unknown>;
  const value = getByPath(dict, resolvedKey);
  if (Array.isArray(value)) return value as string[];

  if (language !== 'en') {
    const enValue = getByPath(dictionaries.en as Record<string, unknown>, resolvedKey);
    if (Array.isArray(enValue)) return enValue as string[];
  }

  return [];
}
