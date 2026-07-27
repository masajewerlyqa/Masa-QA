import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import {
  cookiesPage,
  deliveryPage,
  privacyPage,
  returnsPage,
  termsPage,
} from '../constants/pageContent/legal';
import type { InfoPageKey } from '../constants/infoPages';
import type { RootStackParamList } from '../navigation/types';
import { AboutScreen } from './info/AboutScreen';
import { ContactScreen } from './info/ContactScreen';
import { FaqScreen } from './info/FaqScreen';
import { LegalProseScreen } from './info/LegalProseScreen';
import { SizeGuideScreen } from './info/SizeGuideScreen';

const LEGAL_PAGES: Partial<
  Record<InfoPageKey, { en: typeof deliveryPage.en; ar: typeof deliveryPage.ar }>
> = {
  delivery: deliveryPage,
  returns: returnsPage,
  privacy: privacyPage,
  terms: termsPage,
  cookies: cookiesPage,
};

export function InfoPageScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'Info'>>();
  const pageKey = route.params?.pageKey ?? 'about';

  switch (pageKey) {
    case 'about':
      return <AboutScreen />;
    case 'contact':
      return <ContactScreen />;
    case 'faq':
      return <FaqScreen />;
    case 'sizeGuide':
      return <SizeGuideScreen />;
    case 'delivery':
    case 'returns':
    case 'privacy':
    case 'terms':
    case 'cookies': {
      const content = LEGAL_PAGES[pageKey];
      if (content) return <LegalProseScreen content={content} />;
      return <AboutScreen />;
    }
    default:
      return <AboutScreen />;
  }
}
