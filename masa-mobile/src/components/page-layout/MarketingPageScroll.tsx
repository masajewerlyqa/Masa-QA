import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { MobileFooter } from '../MobileFooter';
import { SiteShell } from '../layout/SiteShell';

/** Full-bleed marketing pages: no horizontal padding on scroll — sections control inset */
export function MarketingPageScroll({ children }: PropsWithChildren): React.JSX.Element {
  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {children}
        <MobileFooter />
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  scroll: {},
});
