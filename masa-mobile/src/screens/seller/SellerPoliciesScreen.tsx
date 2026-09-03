import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { getSellerStoreForUser, getSellerStoreFull } from '../../services/sellerDashboardService';
import { updateSellerPolicy } from '../../services/sellerWriteService';

function toHhMm(pgTime: string | null): string {
  if (!pgTime) return '14:00';
  const match = /^(\d{2}:\d{2})/.exec(pgTime);
  return match ? match[1] : pgTime;
}

/** Mirrors web `app/seller/policies`: returns/exchanges windows + same-day delivery. */
export function SellerPoliciesScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [returnsEnabled, setReturnsEnabled] = useState(true);
  const [exchangesEnabled, setExchangesEnabled] = useState(true);
  const [returnPeriodDays, setReturnPeriodDays] = useState('3');
  const [exchangePeriodDays, setExchangePeriodDays] = useState('3');
  const [customConditions, setCustomConditions] = useState('');
  const [sameDayEnabled, setSameDayEnabled] = useState(false);
  const [cutoffTime, setCutoffTime] = useState('14:00');
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
        setReturnsEnabled(full.returnsEnabled);
        setExchangesEnabled(full.exchangesEnabled);
        setReturnPeriodDays(String(full.returnPeriodDays));
        setExchangePeriodDays(String(full.exchangePeriodDays));
        setCustomConditions(full.policyCustomConditions ?? '');
        setSameDayEnabled(full.sameDayDeliveryEnabled);
        setCutoffTime(toHhMm(full.sameDayCutoffLocal));
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setMessage(null);
    const result = await updateSellerPolicy({
      returns_enabled: returnsEnabled,
      exchanges_enabled: exchangesEnabled,
      return_period_days: Number(returnPeriodDays) || 3,
      exchange_period_days: Number(exchangePeriodDays) || 3,
      policy_custom_conditions: customConditions,
      same_day_delivery_enabled: sameDayEnabled,
      same_day_cutoff_local: cutoffTime,
    });
    setSaving(false);
    setMessage(
      result.ok
        ? { type: 'ok', text: t('seller.policies.saved') }
        : { type: 'err', text: t(result.error ?? '') || result.error || '' },
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
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('seller.policies.title')}</Text>
        <Text style={textStyle(isArabic, 'body')}>{t('seller.policies.subtitle')}</Text>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.policies.returnsExchanges')}</Text>

          <CheckboxRow
            hint={t('seller.policies.returnsEnabledHint')}
            label={t('seller.policies.returnsEnabled')}
            onToggle={() => setReturnsEnabled((v) => !v)}
            value={returnsEnabled}
          />
          <Text style={styles.fieldLabel}>{t('seller.policies.returnPeriodDays')}</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setReturnPeriodDays}
            style={styles.input}
            value={returnPeriodDays}
          />

          <CheckboxRow
            hint={t('seller.policies.exchangesEnabledHint')}
            label={t('seller.policies.exchangesEnabled')}
            onToggle={() => setExchangesEnabled((v) => !v)}
            value={exchangesEnabled}
          />
          <Text style={styles.fieldLabel}>{t('seller.policies.exchangePeriodDays')}</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setExchangePeriodDays}
            style={styles.input}
            value={exchangePeriodDays}
          />
          <Text style={[textStyle(isArabic, 'caption'), styles.hint]}>{t('seller.policies.periodFromDelivery')}</Text>
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.policies.conditionsTitle')}</Text>
          <Text style={styles.fieldLabel}>{t('seller.policies.customConditions')}</Text>
          <TextInput
            multiline
            numberOfLines={4}
            onChangeText={setCustomConditions}
            placeholder={t('seller.policies.customConditionsPlaceholder')}
            placeholderTextColor={theme.colors.masaGray}
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
            value={customConditions}
          />
          <Text style={[textStyle(isArabic, 'caption'), styles.hint]}>{t('seller.policies.customConditionsHint')}</Text>
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.policies.sameDayTitle')}</Text>
          <CheckboxRow
            hint={t('seller.policies.sameDayHint')}
            label={t('seller.policies.sameDayEnabled')}
            onToggle={() => setSameDayEnabled((v) => !v)}
            value={sameDayEnabled}
          />
          <Text style={styles.fieldLabel}>{t('seller.policies.cutoffTime')}</Text>
          <TextInput
            onChangeText={setCutoffTime}
            placeholder="14:00"
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={cutoffTime}
          />
          <Text style={[textStyle(isArabic, 'caption'), styles.hint]}>{t('seller.policies.cutoffHint')}</Text>
        </MasaCard>

        {message ? (
          <Text style={message.type === 'err' ? styles.errorText : styles.okText}>{message.text}</Text>
        ) : null}

        <MasaButton
          disabled={saving}
          label={saving ? t('seller.policies.saving') : t('seller.policies.save')}
          onPress={() => void handleSave()}
        />
      </ScrollView>
    </SiteShell>
  );
}

function CheckboxRow({
  label,
  hint,
  value,
  onToggle,
}: {
  label: string;
  hint: string;
  value: boolean;
  onToggle: () => void;
}): React.JSX.Element {
  const { isArabic } = useSettings();
  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View style={[styles.checkbox, value ? styles.checkboxChecked : null]}>
        {value ? <Check color={theme.colors.white} size={14} /> : null}
      </View>
      <View style={styles.checkboxTextWrap}>
        <Text style={textStyle(isArabic, 'bodySm')}>{label}</Text>
        <Text style={textStyle(isArabic, 'caption')}>{hint}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    width: 20,
  },
  checkboxChecked: { backgroundColor: theme.colors.primary },
  checkboxRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  checkboxTextWrap: { flex: 1, gap: 2 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  errorText: { color: '#dc2626', fontSize: 13 },
  fieldLabel: { color: theme.colors.masaDark, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  hint: { marginBottom: 4 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: { marginTop: 60 },
  okText: { color: '#16A34A', fontSize: 13 },
  sectionTitle: { color: theme.colors.primary, fontSize: 16, marginBottom: 4 },
  textarea: { minHeight: 100 },
  title: { color: theme.colors.primary, fontSize: 24 },
});
