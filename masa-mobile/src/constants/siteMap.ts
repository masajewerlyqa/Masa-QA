import type { InfoPageKey } from './infoPages';

export const sitePages = {
  about: { pageKey: 'about' as InfoPageKey },
  marketPrices: { pageKey: 'marketPrices' as InfoPageKey },
  sizeGuide: { pageKey: 'sizeGuide' as InfoPageKey },
  delivery: { pageKey: 'delivery' as InfoPageKey },
  returns: { pageKey: 'returns' as InfoPageKey },
  contact: { pageKey: 'contact' as InfoPageKey },
  faq: { pageKey: 'faq' as InfoPageKey },
  privacy: { pageKey: 'privacy' as InfoPageKey },
  terms: { pageKey: 'terms' as InfoPageKey },
  cookies: { pageKey: 'cookies' as InfoPageKey },
} as const;
