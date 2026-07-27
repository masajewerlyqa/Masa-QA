import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../constants/theme';

/** Matches web `max-w-content mx-auto px-4`. */
export function ContentContainer({ children }: PropsWithChildren): React.JSX.Element {
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: theme.layout.screenPaddingX,
    width: '100%',
  },
});
