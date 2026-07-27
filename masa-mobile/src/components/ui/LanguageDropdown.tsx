import { Check, Globe } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { AppLanguage } from '../../stores/settingsStore';

type LanguageDropdownProps = {
  onSelected?: () => void;
  triggerColor?: string;
};

export function LanguageDropdown({
  onSelected,
  triggerColor = theme.colors.masaDark,
}: LanguageDropdownProps): React.JSX.Element {
  const { language, setLanguage, t, isArabic } = useSettings();
  const [open, setOpen] = useState(false);

  function pick(next: AppLanguage): void {
    setLanguage(next);
    setOpen(false);
    onSelected?.();
  }

  return (
    <>
      <Pressable
        accessibilityLabel={isArabic ? 'اختيار اللغة' : 'Select language'}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Globe color={triggerColor} size={20} />
      </Pressable>

      <Modal animationType="fade" transparent visible={open}>
        <Pressable onPress={() => setOpen(false)} style={styles.backdrop}>
          <View style={styles.menu}>
            <MenuItem
              active={language === 'ar'}
              isArabic={isArabic}
              label={t('common.arabic')}
              onPress={() => pick('ar')}
            />
            <MenuItem
              active={language === 'en'}
              isArabic={isArabic}
              label={t('common.english')}
              onPress={() => pick('en')}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({
  label,
  active,
  onPress,
  isArabic,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Text style={[textStyle(isArabic, 'body'), active ? styles.menuLabelActive : null]}>
        {label}
      </Text>
      {active ? <Check color={theme.colors.primary} size={16} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: { padding: 8 },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  menu: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
