import { useRoute } from '@react-navigation/native';
import { MessageCircle } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOBILE_BOTTOM_NAV_HEIGHT } from '../../constants/layout';
import { theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import type { MainTabParamList } from '../../navigation/types';

const WHATSAPP_NUMBER = '97472233141';

/** Screens rendered inside the bottom Tab.Navigator -- the only ones with a visible tab bar. */
const TAB_SCREEN_NAMES: (keyof MainTabParamList)[] = ['Home', 'Discover', 'Wishlist', 'Cart', 'Profile'];

export function WhatsappFloatingButton(): React.JSX.Element {
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  // SiteShell (and this button) is shared by both tab screens and root-stack screens
  // pushed on top of MainTabs. Only tab screens have a tab bar to clear; stack
  // screens (checkout, product details, orders, settings, ...) have none, so
  // adding the tab bar's height there left the button floating with a large,
  // unexplained gap above the real bottom edge.
  const isTabScreen = (TAB_SCREEN_NAMES as string[]).includes(route.name);
  const bottom = (isTabScreen ? MOBILE_BOTTOM_NAV_HEIGHT : 0) + insets.bottom + 24;

  const openWhatsapp = (): void => {
    const text = encodeURIComponent(t('common.whatsappPrefill'));
    void Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
  };

  // Mirrors web's `animate-whatsapp-pulse` keyframe (tailwind.config.ts):
  // a ring expanding from the button's edge while fading out, 6s ease-in-out,
  // looping. CSS animates box-shadow spread directly; RN has no equivalent,
  // so the same motion is reproduced with a scaling + fading ring view.
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 6000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 0.15, 0] });

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
      />
      <Pressable
        accessibilityLabel={t('common.whatsappChatLabel')}
        onPress={openWhatsapp}
        style={styles.button}
      >
        <MessageCircle color={theme.colors.white} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 48,
    zIndex: 50,
  },
  // Same rgba(83, 28, 36, ...) -- theme.colors.primary -- used by web's
  // whatsapp-pulse keyframe (tailwind.config.ts).
  ring: {
    backgroundColor: 'rgba(83, 28, 36, 0.4)',
    borderRadius: 999,
    height: 48,
    position: 'absolute',
    width: 48,
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    elevation: 6,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 48,
  },
});
