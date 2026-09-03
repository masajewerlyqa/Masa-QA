import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import type { RootStackParamList } from '../../navigation/types';
import {
  approveSellerApplication,
  getAdminApplicationDetail,
  rejectSellerApplication,
  type AdminApplicationDetail,
} from '../../services/adminWriteService';

/** Mirrors web `app/admin/seller-applications/[id]`: application review + approve/reject. */
export function AdminApplicationDetailScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'AdminApplicationDetail'>>();
  const { applicationId } = route.params;
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<AdminApplicationDetail | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const res = await getAdminApplicationDetail(applicationId);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setApp(res.application);
    setProofUrl(res.proofUrl);
    setLogoUrl(res.logoUrl);
    setLicenseUrl(res.licenseUrl);
  }, [applicationId]);

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

  const handleApprove = async (): Promise<void> => {
    setBusy('approve');
    const result = await approveSellerApplication(applicationId);
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? t('seller.reviews.failedApprove'));
      return;
    }
    await load();
  };

  const handleReject = async (): Promise<void> => {
    if (!showReason) {
      setShowReason(true);
      return;
    }
    setBusy('reject');
    const result = await rejectSellerApplication(applicationId, reason);
    setBusy(null);
    if (!result.ok) {
      setError(result.error ?? t('seller.reviews.failedReject'));
      return;
    }
    await load();
  };

  const formatDate = (iso: string | null): string => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} size="large" style={styles.loading} />
      </SiteShell>
    );
  }

  if (!app) {
    return (
      <SiteShell>
        <View style={styles.content}>
          <ScreenBackButton label={t('admin.applications.backToApplications')} />
          <MasaCard>
            <Text style={textStyle(isArabic, 'body')}>{error}</Text>
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  const canReview = app.status === 'payment_proof_submitted' || app.status === 'under_review' || app.status === 'pending';

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={t('admin.applications.backToApplications')} />

        <View style={styles.headerRow}>
          <Text style={[styles.title, { fontFamily: luxury }]}>{app.business_name}</Text>
          <OrderStatusBadge status={app.status} />
        </View>

        {error ? (
          <MasaCard style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </MasaCard>
        ) : null}

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('admin.applications.contactBusiness')}</Text>
          <Row label={t('admin.applications.brandStoreName')} value={app.business_name} />
          <Row label={t('admin.applications.contactPerson')} value={app.contact_full_name ?? '—'} />
          <Row label={t('admin.applications.email')} value={app.contact_email} />
          <Row label={t('common.phone')} value={app.contact_phone ?? '—'} />
          <Row label={t('admin.applications.storeLocation')} value={app.store_location ?? '—'} />
          {app.business_description ? (
            <View style={styles.descBlock}>
              <Text style={styles.rowLabel}>{t('admin.applications.storeDescription')}</Text>
              <Text style={textStyle(isArabic, 'body')}>{app.business_description}</Text>
            </View>
          ) : null}
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('admin.applications.applicantAccount')}</Text>
          <Row label={t('admin.applications.profileName')} value={app.profiles?.full_name ?? '—'} />
          <Row label={t('admin.applications.profileEmail')} value={app.profiles?.email ?? '—'} />
        </MasaCard>

        {logoUrl || licenseUrl || proofUrl ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('admin.applications.logoCertificate')}</Text>
            {logoUrl ? <Image resizeMode="contain" source={{ uri: logoUrl }} style={styles.logoImg} /> : null}
            {licenseUrl ? (
              <Pressable onPress={() => void Linking.openURL(licenseUrl)}>
                <Text style={styles.link}>{t('admin.applications.viewDownloadCertificate')}</Text>
              </Pressable>
            ) : null}
            {proofUrl ? (
              <Pressable onPress={() => void Linking.openURL(proofUrl)}>
                <Text style={styles.link}>{isArabic ? 'عرض إثبات الدفع' : 'View payment proof'}</Text>
              </Pressable>
            ) : null}
          </MasaCard>
        ) : null}

        {app.payment_reference || app.payment_amount_qar != null ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>
              {isArabic ? 'تفاصيل الدفع' : 'Payment details'}
            </Text>
            <Row label={isArabic ? 'المرجع' : 'Reference'} value={app.payment_reference ?? '—'} />
            <Row
              label={isArabic ? 'المبلغ' : 'Amount'}
              value={app.payment_amount_qar != null ? `${app.payment_amount_qar} QAR` : '—'}
            />
            <Row label={isArabic ? 'تاريخ الإرسال' : 'Submitted'} value={formatDate(app.payment_proof_submitted_at)} />
          </MasaCard>
        ) : null}

        {app.review_notes || app.rejection_reason ? (
          <MasaCard style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('admin.applications.review')}</Text>
            <Row label={t('admin.applications.reviewedAt')} value={formatDate(app.reviewed_at)} />
            <Row label={t('admin.applications.reviewedBy')} value={app.reviewer?.full_name ?? '—'} />
            <Text style={textStyle(isArabic, 'body')}>
              {app.rejection_reason ?? app.review_notes}
            </Text>
          </MasaCard>
        ) : null}

        {canReview ? (
          <MasaCard style={styles.card}>
            <View style={styles.actionRow}>
              <MasaButton
                disabled={busy !== null}
                label={busy === 'approve' ? '…' : t('seller.reviews.approve')}
                onPress={() => void handleApprove()}
                style={styles.actionBtn}
              />
              <MasaButton
                disabled={busy !== null}
                label={busy === 'reject' ? '…' : t('seller.reviews.reject')}
                onPress={() => void handleReject()}
                style={styles.actionBtn}
                variant="outline"
              />
            </View>
            {showReason ? (
              <TextInput
                multiline
                numberOfLines={3}
                onChangeText={setReason}
                placeholder={
                  isArabic
                    ? 'مثال: مبلغ التحويل لا يطابق رسوم التسجيل.'
                    : 'e.g. The transfer amount does not match the registration fee.'
                }
                placeholderTextColor={theme.colors.masaGray}
                style={[styles.input, styles.textarea]}
                value={reason}
              />
            ) : null}
          </MasaCard>
        ) : null}
      </ScrollView>
    </SiteShell>
  );
}

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBtn: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 8 },
  card: { gap: 6 },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  descBlock: { gap: 4, marginTop: 6 },
  errorCard: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  errorText: { color: '#dc2626', fontSize: 13 },
  headerRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  link: { color: theme.colors.primary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  loading: { marginTop: 60 },
  logoImg: { borderRadius: 8, height: 64, marginBottom: 4, width: 120 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { color: theme.colors.masaGray, flex: 1, fontSize: 13 },
  rowValue: { color: theme.colors.masaDark, flex: 2, fontSize: 13, fontWeight: '600', textAlign: 'right' },
  sectionTitle: { color: theme.colors.primary, fontSize: 16 },
  textarea: { minHeight: 70 },
  title: { color: theme.colors.primary, flex: 1, fontSize: 20, marginRight: 8 },
});
