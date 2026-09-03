import { Bell, Menu, Search, ShoppingCart } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MobileDrawer } from './navigation/MobileDrawer';
import { webAssets } from '../constants/assets';
import { theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { goCart, goHome, goNotifications } from '../navigation/routes';
import { useNotificationStore } from '../stores/notificationStore';

type MobileTopBarProps = {
  cartCount?: number;
  wishlistCount?: number;
};

export function MobileTopBar({
  cartCount = 0,
  wishlistCount = 0,
}: MobileTopBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { isArabic, searchQuery, setSearchQuery, t } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const startNotifications = useNotificationStore((s) => s.start);

  // Opens the realtime channel once and keeps the badge live. The store guards
  // against duplicate subscriptions when several top bars mount.
  useEffect(() => {
    let stop: (() => void) | null = null;
    let cancelled = false;
    void (async () => {
      const cleanup = await startNotifications();
      if (cancelled) cleanup();
      else stop = cleanup;
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [startNotifications]);

  return (
    <>
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityLabel={t('navbar.openMenu')}
            onPress={() => setMenuOpen(true)}
            style={styles.iconBtn}
          >
            <Menu color={theme.colors.masaDark} size={20} />
          </Pressable>

          <Pressable onPress={() => goHome()} style={styles.logoWrap}>
            <Image resizeMode="contain" source={webAssets.logoNav} style={styles.logo} />
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel={t('navbar.search')}
              onPress={() => setSearchOpen((v) => !v)}
              style={styles.iconBtn}
            >
              <Search color={theme.colors.masaDark} size={20} />
            </Pressable>
            <Pressable
              accessibilityLabel={t('account.notifications.title')}
              onPress={() => goNotifications()}
              style={styles.iconBtn}
            >
              <Bell color={theme.colors.masaDark} size={20} />
              {unreadCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable
              accessibilityLabel={t('navbar.cart')}
              onPress={() => goCart()}
              style={styles.iconBtn}
            >
              <ShoppingCart color={theme.colors.masaDark} size={20} />
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {searchOpen ? (
          <View style={styles.searchRow}>
            <Search color={theme.colors.masaGray} size={16} />
            <TextInput
              autoFocus
              onChangeText={setSearchQuery}
              placeholder={t('navbar.searchMobilePlaceholder')}
              placeholderTextColor={theme.colors.masaGray}
              style={[styles.searchInput, { fontFamily: textStyle(isArabic, 'body').fontFamily }]}
              value={searchQuery}
            />
          </View>
        ) : null}
      </View>

      <MobileDrawer
        cartCount={cartCount}
        onClose={() => setMenuOpen(false)}
        visible={menuOpen}
        wishlistCount={wishlistCount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    zIndex: 50,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: { padding: 8, position: 'relative' },
  logoWrap: { alignItems: 'center', flex: 1 },
  logo: { height: 36, width: 200 },
  headerActions: { alignItems: 'center', flexDirection: 'row' },
  cartBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    paddingHorizontal: 2,
    position: 'absolute',
    right: 2,
    top: 2,
  },
  cartBadgeText: { color: theme.colors.white, fontSize: 9, fontWeight: '700' },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: theme.colors.foreground,
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
});
