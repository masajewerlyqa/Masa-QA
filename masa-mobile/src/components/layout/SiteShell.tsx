import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { MobileTopBar } from '../MobileTopBar';
import { WhatsappFloatingButton } from '../support/WhatsappFloatingButton';
import { theme } from '../../constants/theme';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

/**
 * Mirrors web `(site)/layout.tsx` mobile chrome: sticky navbar + page body.
 * Footer and bottom nav spacing are applied inside each screen scroll area.
 */
export function SiteShell({ children }: PropsWithChildren): React.JSX.Element {
  const cartCount = useCartStore((s) => s.count);
  const wishlistCount = useWishlistStore((s) => s.count);

  return (
    <View style={styles.root}>
      <MobileTopBar cartCount={cartCount} wishlistCount={wishlistCount} />
      <View style={styles.body}>{children}</View>
      <WhatsappFloatingButton />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
