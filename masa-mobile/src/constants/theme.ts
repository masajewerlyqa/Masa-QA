import { TextStyle, ViewStyle } from 'react-native';

/** Matches web `tailwind.config.ts` + mobile layout conventions. */
export const theme = {
  colors: {
    primary: '#531C24',
    secondary: '#E7D8C3',
    masaDark: '#1A1A1A',
    masaGray: '#635C5C',
    masaLight: '#F7F3EE',
    masaGold: '#D4AF37',
    exclusiveGradientTop: '#FAF8F5',
    background: '#FFFFFF',
    foreground: '#1A1A1A',
    card: '#FFFFFF',
    border: 'rgba(83, 28, 36, 0.1)',
    white: '#FFFFFF',
    navBar: 'rgba(255, 255, 255, 0.95)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    section: 64,
    sectionMd: 80,
    sectionLg: 96,
  },
  layout: {
    maxContentWidth: 1440,
    screenPaddingX: 16,
    sectionPy: 64,
    sectionPyMd: 80,
    tabBarHeight: 64,
    heroMinHeight: 500,
    exclusiveCardWidth: 180,
    productGridGap: 12,
  },
  radius: {
    md: 6,
    lg: 8,
    xl: 12,
    full: 999,
  },
  typography: {
    luxury: 'PlayfairDisplay_400Regular',
    luxuryAr: 'IBMPlexSansArabic_700Bold',
    // Web's Tailwind `font-sans` (the default body font for English UI) is
    // Playfair Display, not a sans-serif -- see app/globals.css. Arabic keeps
    // IBM Plex Arabic: it's web's own fallback for `font-arabic` since Alilato
    // (the primary Arabic font) ships only as .woff2, which Android/Hermes
    // font loading does not support -- .ttf/.otf would be needed to match web
    // exactly there.
    body: 'PlayfairDisplay_400Regular',
    bodyAr: 'IBMPlexSansArabic_400Regular',
    sizes: {
      navLabel: 10,
      caption: 12,
      body: 14,
      bodyLg: 16,
      title: 24,
      sectionTitle: 30,
      hero: 30,
      heroLg: 36,
    },
    weights: {
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    } satisfies ViewStyle,
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 3,
    } satisfies ViewStyle,
    lg: {
      shadowColor: '#531C24',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    } satisfies ViewStyle,
  },
  surfaces: {
    borderedCard: {
      backgroundColor: '#FFFFFF',
      borderColor: 'rgba(83, 28, 36, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
    } satisfies ViewStyle,
    featureCard: {
      backgroundColor: '#F7F3EE',
      borderColor: 'rgba(83, 28, 36, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
    } satisfies ViewStyle,
  },
} as const;

export function fontFamily(isArabic: boolean, variant: 'luxury' | 'body' = 'body'): string {
  if (isArabic) {
    return variant === 'luxury' ? theme.typography.luxuryAr : theme.typography.bodyAr;
  }
  return variant === 'luxury' ? theme.typography.luxury : theme.typography.body;
}

export const textPresets = {
  sectionTitle: {
    fontFamily: theme.typography.luxury,
    fontSize: theme.typography.sizes.sectionTitle,
    color: theme.colors.primary,
    lineHeight: 38,
  } satisfies TextStyle,
  sectionSubtitle: {
    fontFamily: theme.typography.body,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.masaGray,
    lineHeight: 22,
  } satisfies TextStyle,
} as const;
