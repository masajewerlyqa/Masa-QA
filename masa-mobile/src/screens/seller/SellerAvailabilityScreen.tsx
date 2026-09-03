import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { getSellerStoreForUser, getSellerStoreFull } from '../../services/sellerDashboardService';
import { saveSellerAvailability } from '../../services/sellerWriteService';

function toHhMm(pgTime: string | null): string | null {
  if (!pgTime) return null;
  const match = /^(\d{2}:\d{2})/.exec(pgTime);
  return match ? match[1] : pgTime;
}

const DAYS = [
  { value: 0, key: 'sun' },
  { value: 1, key: 'mon' },
  { value: 2, key: 'tue' },
  { value: 3, key: 'wed' },
  { value: 4, key: 'thu' },
  { value: 5, key: 'fri' },
  { value: 6, key: 'sat' },
] as const;

/** Mirrors web `app/seller/availability`: working days + opening/closing hours. */
export function SellerAvailabilityScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('18:00');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const res = await getSellerStoreForUser();
      if (!res.ok || !res.store) {
        if (mounted) setLoading(false);
        return;
      }
      const full = await getSellerStoreFull(res.store.id);
      if (!mounted) return;
      if (full) {
        setWorkingDays(full.workingDays);
        setOpeningTime(toHhMm(full.openingTimeLocal) ?? '09:00');
        setClosingTime(toHhMm(full.closingTimeLocal) ?? '18:00');
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleDay = (value: number): void => {
    setWorkingDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort(),
    );
  };

  const handleSave = async (): Promise<void> => {
    if (workingDays.length === 0) {
      setMessage({ type: 'err', text: isArabic ? 'اختر يوم عمل واحداً على الأقل.' : 'Select at least one working day.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await saveSellerAvailability({
      working_days: workingDays,
      opening_time: openingTime,
      closing_time: closingTime,
      business_timezone: 'Asia/Qatar',
    });
    setSaving(false);
    setMessage(
      result.ok
        ? { type: 'ok', text: t('seller.availability.saveSuccess') }
        : { type: 'err', text: result.error ?? '' },
    );
  };

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={t('seller.availability.backToDashboard')} />
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('seller.availability.title')}</Text>
        <Text style={textStyle(isArabic, 'body')}>{t('seller.availability.subtitle')}</Text>

        <MasaCard style={styles.card}>
          <Text style={styles.fieldLabel}>{t('seller.availability.workingDays')}</Text>
          <View style={styles.dayRow}>
            {DAYS.map((d) => (
              <Pressable
                key={d.value}
                onPress={() => toggleDay(d.value)}
                style={[styles.dayChip, workingDays.includes(d.value) ? styles.dayChipActive : null]}
              >
                <Text
                  style={[styles.dayChipText, workingDays.includes(d.value) ? styles.dayChipTextActive : null]}
                >
                  {t(`seller.availability.days.${d.key}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t('seller.availability.openingTime')}</Text>
          <TextInput
            onChangeText={setOpeningTime}
            placeholder="09:00"
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={openingTime}
          />

          <Text style={styles.fieldLabel}>{t('seller.availability.closingTime')}</Text>
          <TextInput
            onChangeText={setClosingTime}
            placeholder="18:00"
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={closingTime}
          />

          {message ? (
            <Text style={message.type === 'err' ? styles.errorText : styles.okText}>{message.text}</Text>
          ) : null}

          <MasaButton
            disabled={saving}
            label={saving ? t('seller.availability.saving') : t('seller.availability.saveSchedule')}
            onPress={() => void handleSave()}
          />
        </MasaCard>

        <Text style={[textStyle(isArabic, 'caption'), styles.note]}>{t('seller.availability.timezoneNote')}</Text>
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  dayChip: {
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayChipText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  dayChipTextActive: { color: theme.colors.white },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  fieldLabel: { color: theme.colors.masaDark, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: { marginTop: 60 },
  note: { marginBottom: 8 },
  okText: { color: '#16A34A', fontSize: 13, marginBottom: 8 },
  title: { color: theme.colors.primary, fontSize: 24 },
});
