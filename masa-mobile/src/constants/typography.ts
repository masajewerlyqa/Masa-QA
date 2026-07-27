import { TextStyle } from 'react-native';

import { fontFamily, theme } from './theme';

/** Mirrors web Tailwind text utilities used on mobile breakpoints. */
export function textStyle(
  isArabic: boolean,
  variant:
    | 'heroTitle'
    | 'sectionTitle'
    | 'sectionTitleSm'
    | 'cardTitle'
    | 'body'
    | 'bodySm'
    | 'caption'
    | 'navLabel'
    | 'menuLabel'
    | 'menuSection',
): TextStyle {
  const luxury = fontFamily(isArabic, 'luxury');
  const body = fontFamily(isArabic, 'body');

  switch (variant) {
    case 'heroTitle':
      return {
        fontFamily: luxury,
        fontSize: 30,
        lineHeight: 38,
        color: theme.colors.primary,
        fontWeight: isArabic ? '700' : '400',
      };
    case 'sectionTitle':
      return {
        fontFamily: luxury,
        fontSize: 30,
        lineHeight: 38,
        color: theme.colors.primary,
        fontWeight: isArabic ? '700' : '400',
      };
    case 'sectionTitleSm':
      return {
        fontFamily: luxury,
        fontSize: 24,
        lineHeight: 32,
        color: theme.colors.primary,
        fontWeight: isArabic ? '700' : '400',
      };
    case 'cardTitle':
      return {
        fontFamily: luxury,
        fontSize: 18,
        lineHeight: 24,
        color: theme.colors.primary,
        fontWeight: isArabic ? '700' : '400',
      };
    case 'body':
      return {
        fontFamily: body,
        fontSize: 14,
        lineHeight: isArabic ? 26 : 22,
        color: theme.colors.masaGray,
        fontWeight: '400',
      };
    case 'bodySm':
      return {
        fontFamily: body,
        fontSize: 14,
        lineHeight: isArabic ? 26 : 22,
        color: theme.colors.masaDark,
        fontWeight: '500',
      };
    case 'caption':
      return {
        fontFamily: body,
        fontSize: 12,
        lineHeight: isArabic ? 22 : 18,
        color: theme.colors.masaGray,
        fontWeight: '400',
      };
    case 'navLabel':
      return {
        fontFamily: body,
        fontSize: 10,
        lineHeight: 14,
        fontWeight: '600',
      };
    case 'menuLabel':
      return {
        fontFamily: body,
        fontSize: 14,
        lineHeight: isArabic ? 26 : 20,
        color: theme.colors.masaDark,
        fontWeight: '500',
      };
    case 'menuSection':
      return {
        fontFamily: body,
        fontSize: 12,
        lineHeight: 16,
        color: theme.colors.masaGray,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
      };
    default:
      return { fontFamily: body, fontSize: 14 };
  }
}
