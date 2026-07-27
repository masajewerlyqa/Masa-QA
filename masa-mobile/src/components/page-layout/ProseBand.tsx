import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { theme } from '../../constants/theme';

type ProseBandProps = PropsWithChildren<{
  variant?: 'light' | 'white';
}>;

/** Matches web `py-16 md:py-24 bg-masa-light/40 border-t` prose sections */
export function ProseBand({ children, variant = 'light' }: ProseBandProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.band,
        variant === 'light' ? styles.light : styles.white,
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingVertical: 64,
  },
  light: {
    backgroundColor: 'rgba(247, 243, 238, 0.4)',
  },
  white: {
    backgroundColor: theme.colors.background,
  },
  inner: {
    maxWidth: 768,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    width: '100%',
    alignSelf: 'center',
    gap: 48,
  },
});
