import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** py-14 (56) default; py-20 (80) for legal/marketing heroes */
  paddingY?: 56 | 80;
  centered?: boolean;
  isArabic: boolean;
};

/** Matches web centered hero: eyebrow → h1 → divider → subtitle */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  paddingY = 56,
  centered = true,
  isArabic,
}: PageHeroProps): React.JSX.Element {
  return (
    <View style={[styles.wrap, { paddingVertical: paddingY }]}>
      <LinearGradient
        colors={['rgba(247,243,238,0.7)', 'rgba(255,255,255,1)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.inner, centered && styles.centered]}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, textStyle(isArabic, 'caption')]}>{eyebrow}</Text>
        ) : null}
        <Text style={[styles.title, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{title}</Text>
        <View style={styles.divider} />
        {subtitle ? <Text style={[styles.subtitle, textStyle(isArabic, 'body')]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.background,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
  },
  centered: {
    alignItems: 'center',
  },
  eyebrow: {
    letterSpacing: 3.2,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.primary,
    fontSize: 36,
    lineHeight: 44,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  divider: {
    alignSelf: 'center',
    backgroundColor: 'rgba(83, 28, 36, 0.3)',
    height: 1,
    marginBottom: theme.spacing.lg,
    width: 48,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 480,
    textAlign: 'center',
  },
});
