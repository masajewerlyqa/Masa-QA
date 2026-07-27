import { MessageCircle } from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOBILE_BOTTOM_NAV_HEIGHT } from '../../constants/layout';
import { theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

const WHATSAPP_NUMBER = '97472233141';

export function WhatsappFloatingButton(): React.JSX.Element {
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const bottom = MOBILE_BOTTOM_NAV_HEIGHT + insets.bottom + 24;

  const openWhatsapp = (): void => {
    const text = encodeURIComponent(t('common.whatsappPrefill'));
    void Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
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
    position: 'absolute',
    right: 16,
    zIndex: 50,
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
