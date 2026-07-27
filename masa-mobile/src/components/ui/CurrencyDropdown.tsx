import { Check, CircleDollarSign } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { AppCurrency } from '../../stores/settingsStore';

type CurrencyDropdownProps = {
  onSelected?: () => void;
  triggerColor?: string;
};

function currencyLabels(isArabic: boolean): Record<AppCurrency, string> {
  return {
    USD: 'USD $',
    QAR: isArabic ? 'ر.ق' : 'QAR',
  };
}

export function CurrencyDropdown({
  onSelected,
  triggerColor = theme.colors.masaDark,
}: CurrencyDropdownProps): React.JSX.Element {
  const { currency, setCurrency, isArabic } = useSettings();
  const [open, setOpen] = useState(false);
  const labels = currencyLabels(isArabic);

  function pick(next: AppCurrency): void {
    setCurrency(next);
    setOpen(false);
    onSelected?.();
  }

  return (
    <>
      <Pressable
        accessibilityLabel={isArabic ? 'اختيار العملة' : 'Select currency'}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <CircleDollarSign color={triggerColor} size={20} />
      </Pressable>

      <Modal animationType="fade" transparent visible={open}>
        <Pressable onPress={() => setOpen(false)} style={styles.backdrop}>
          <View style={styles.menu}>
            {(['USD', 'QAR'] as const).map((code) => (
              <Pressable key={code} onPress={() => pick(code)} style={styles.menuItem}>
                <Text
                  style={[
                    textStyle(isArabic, 'body'),
                    currency === code ? styles.menuLabelActive : null,
                  ]}
                >
                  {labels[code]}
                </Text>
                {currency === code ? <Check color={theme.colors.primary} size={16} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
