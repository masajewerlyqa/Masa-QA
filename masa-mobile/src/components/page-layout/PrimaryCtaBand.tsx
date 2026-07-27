import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { MasaButton } from '../MasaButton';
import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

type PrimaryCtaBandProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  isArabic: boolean;
};

export function PrimaryCtaBand({
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  isArabic,
}: PrimaryCtaBandProps): React.JSX.Element {
  return (
    <View style={styles.wrap}>
      <View style={styles.pattern} />
      <View style={styles.inner}>
        <Text style={[styles.title, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{title}</Text>
        <Text style={[styles.subtitle, textStyle(isArabic, 'body')]}>{subtitle}</Text>
        <View style={styles.actions}>
          <MasaButton label={primaryLabel} onPress={onPrimary} variant="secondary" />
          {secondaryLabel && onSecondary ? (
            <MasaButton label={secondaryLabel} onPress={onSecondary} variant="outlineLight" />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
    paddingVertical: 64,
    position: 'relative',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
    opacity: 0.12,
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
  },
  title: {
    color: theme.colors.white,
    fontSize: 30,
    lineHeight: 38,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(231, 216, 195, 0.95)',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: theme.spacing.xl,
    maxWidth: 480,
    textAlign: 'center',
  },
  actions: {
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: 320,
  },
});
