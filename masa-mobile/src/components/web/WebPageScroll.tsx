import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { SiteShell } from '../layout/SiteShell';
import { WebFooter } from './WebFooter';

type WebPageScrollProps = PropsWithChildren<{
  contentContainerStyle?: object;
}>;

/** Site layout: navbar + scroll(main + footer) + bottom tab padding */
export function WebPageScroll({
  children,
  contentContainerStyle,
}: WebPageScrollProps): React.JSX.Element {
  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={[styles.scroll, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
        <WebFooter />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
  },
});
