import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { getAdminPromoCodes, type AdminPromoRow } from '../../services/adminDataService';
import {
  createAdminPromoCode,
  deleteAdminPromoCode,
  updateAdminPromoActive,
} from '../../services/adminWriteService';

/** Mirrors web `app/admin/promo`: create form + full promo code list. */
export function AdminPromoScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [rows, setRows] = useState<AdminPromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');
  const [usageLimit, setUsageLimit] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await getAdminPromoCodes();
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setRows(res.rows);
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await load();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  const handleCreate = async (): Promise<void> => {
    const trimmedCode = code.trim().toUpperCase();
    const numValue = Number(value);
    if (!trimmedCode) {
      setCreateError(t('admin.promo.code'));
      return;
    }
    if (!Number.isFinite(numValue) || numValue <= 0 || (type === 'percentage' && numValue > 100)) {
      setCreateError(t('admin.promo.value'));
      return;
    }
    setCreating(true);
    setCreateError(null);
    const result = await createAdminPromoCode({
      code: trimmedCode,
      type,
      value: numValue,
      min_order_amount: Number(minOrder) || 0,
      usage_limit: usageLimit.trim() ? Number(usageLimit) : null,
      active: true,
    });
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.error ?? t('admin.promo.failedCreate'));
      return;
    }
    setCode('');
    setValue('');
    setMinOrder('0');
    setUsageLimit('');
    await load();
  };

  const toggleActive = async (row: AdminPromoRow): Promise<void> => {
    setBusyId(row.id);
    const result = await updateAdminPromoActive(row.id, !row.active);
    setBusyId(null);
    if (!result.ok) {
      Alert.alert(isArabic ? 'خطأ' : 'Error', result.error ?? '');
      return;
    }
    await load();
  };

  const handleDelete = (row: AdminPromoRow): void => {
    Alert.alert(
      t('admin.promo.delete'),
      t('admin.promo.deleteConfirm').replace('{code}', row.code),
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: t('admin.promo.delete'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusyId(row.id);
              const result = await deleteAdminPromoCode(row.id);
              setBusyId(null);
              if (!result.ok) {
                Alert.alert(isArabic ? 'خطأ' : 'Error', result.error ?? '');
                return;
              }
              await load();
            })();
          },
        },
      ],
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
        <ScreenBackButton label={t('admin.overview.platformOverview')} />
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('admin.promo.title')}</Text>
        <Text style={textStyle(isArabic, 'body')}>{t('admin.promo.subtitle')}</Text>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('admin.promo.create')}</Text>

          <Text style={styles.fieldLabel}>{t('admin.promo.code')}</Text>
          <TextInput
            autoCapitalize="characters"
            onChangeText={setCode}
            placeholder="SUMMER10"
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={code}
          />

          <Text style={styles.fieldLabel}>{t('admin.promo.type')}</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => setType('percentage')}
              style={[styles.chip, type === 'percentage' ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, type === 'percentage' ? styles.chipTextActive : null]}>
                {t('admin.promo.percentage')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('fixed')}
              style={[styles.chip, type === 'fixed' ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, type === 'fixed' ? styles.chipTextActive : null]}>
                {t('admin.promo.fixedAmount')}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>{t('admin.promo.value')}</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setValue}
            placeholder={type === 'percentage' ? '10' : '25'}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={value}
          />

          <Text style={styles.fieldLabel}>{t('admin.promo.minOrder')}</Text>
          <TextInput
            keyboardType="decimal-pad"
            onChangeText={setMinOrder}
            style={styles.input}
            value={minOrder}
          />

          <Text style={styles.fieldLabel}>{t('admin.promo.usageLimitOptional')}</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setUsageLimit}
            placeholder={t('admin.promo.unlimited')}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={usageLimit}
          />

          {createError ? <Text style={styles.errorText}>{createError}</Text> : null}

          <MasaButton
            disabled={creating}
            label={creating ? t('admin.promo.creating') : t('admin.promo.create')}
            onPress={() => void handleCreate()}
          />
        </MasaCard>

        {error ? (
          <MasaCard style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </MasaCard>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('admin.promo.allPromoCodes').replace('{count}', String(rows.length))}
          </Text>
          {rows.length === 0 ? (
            <Text style={textStyle(isArabic, 'body')}>{t('admin.promo.noPromoYet')}</Text>
          ) : (
            rows.map((row) => (
              <MasaCard key={row.id} style={styles.promoCard}>
                <View style={styles.promoHeader}>
                  <Text style={styles.promoCode}>{row.code}</Text>
                  <Text style={styles.promoValue}>
                    {row.type === 'percentage' ? `${row.value}%` : `${row.value} QAR`}
                  </Text>
                </View>
                <Text style={textStyle(isArabic, 'caption')}>
                  {row.store_name ?? t('admin.promo.platformWide')} · {t('admin.promo.used')}: {row.used_count}
                  {row.usage_limit != null ? `/${row.usage_limit}` : ''}
                </Text>
                <View style={styles.promoActions}>
                  <Pressable onPress={() => void toggleActive(row)} style={styles.toggleRow}>
                    <View style={[styles.checkbox, row.active ? styles.checkboxChecked : null]}>
                      {row.active ? <Check color={theme.colors.white} size={12} /> : null}
                    </View>
                    <Text style={textStyle(isArabic, 'caption')}>
                      {row.active ? t('admin.promo.deactivate') : t('admin.promo.activate')}
                    </Text>
                  </Pressable>
                  <Pressable disabled={busyId === row.id} onPress={() => handleDelete(row)}>
                    <Text style={styles.deleteText}>{t('admin.promo.delete')}</Text>
                  </Pressable>
                </View>
              </MasaCard>
            ))
          )}
        </View>
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  checkboxChecked: { backgroundColor: theme.colors.primary },
  chip: {
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chipText: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: theme.colors.white },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  deleteText: { color: '#dc2626', fontSize: 13, fontWeight: '600' },
  errorCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 4 },
  fieldLabel: { color: theme.colors.masaDark, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: { marginTop: 60 },
  promoActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  promoCard: { gap: 4, marginBottom: 10 },
  promoCode: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  promoValue: { color: theme.colors.masaDark, fontSize: 14, fontWeight: '600' },
  section: { gap: 4 },
  sectionLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sectionTitle: { color: theme.colors.primary, fontSize: 16, marginBottom: 4 },
  title: { color: theme.colors.primary, fontSize: 24 },
  toggleRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
});
