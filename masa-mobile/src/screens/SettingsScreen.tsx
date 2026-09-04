import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AlertTriangle, Check } from 'lucide-react-native';

import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { ScreenBackButton } from '../components/ScreenBackButton';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../hooks/useAuth';
import { goHome } from '../navigation/routes';
import { deleteOwnAccount } from '../services/accountDeletionService';
import { signOut } from '../services/authService';
import {
  getNewsletterOptIn,
  getProfileSummary,
  updateNewsletterOptIn,
  updateProfile,
} from '../services/profileService';

/** Matches web `/account/settings` mobile layout: personal details, preferences, account security. */
export function SettingsScreen(): React.JSX.Element {
  const { user } = useAuth();
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([getProfileSummary(), getNewsletterOptIn()]).then(([summary, optIn]) => {
      if (!mounted) return;
      setFullName(summary?.fullName ?? '');
      setPhone(summary?.phone ?? '');
      setEmail(summary?.email ?? user.email ?? '');
      setNewsletterOptIn(optIn);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  const saveProfile = async (): Promise<void> => {
    setProfileMessage(null);
    setSavingProfile(true);
    const result = await updateProfile({ fullName, phone });
    setSavingProfile(false);
    setProfileMessage(
      result.ok
        ? { type: 'ok', text: t('account.profileSaved') }
        : { type: 'err', text: result.error },
    );
  };

  const toggleNewsletter = async (): Promise<void> => {
    const next = !newsletterOptIn;
    setNewsletterOptIn(next);
    setNewsletterBusy(true);
    const result = await updateNewsletterOptIn(next);
    setNewsletterBusy(false);
    if (!result.ok) {
      setNewsletterOptIn(!next);
    }
  };

  const confirmWord = t('account.deleteAccount.confirmWord');
  const canDelete = deleteConfirm.trim().toUpperCase() === confirmWord.toUpperCase();

  const handleDeleteAccount = async (): Promise<void> => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setDeleteError(null);

    const result = await deleteOwnAccount();
    if (!result.ok) {
      setDeleteError(result.error || t('account.deleteAccount.error'));
      setDeleting(false);
      return;
    }

    // The server record is gone, so clear the local session before navigating
    // away; a stale token would only produce confusing errors on the next call.
    await signOut();
    goHome();
  };

  if (!user) {
    return (
      <SiteShell>
        <View style={styles.content}>
          <ScreenBackButton label={t('account.orders.backToAccount')} />
          <MasaCard>
            <Text style={textStyle(isArabic, 'body')}>{t('auth.login.noAccount')}</Text>
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  if (loading) {
    return (
      <SiteShell>
        <ActivityIndicator color={theme.colors.primary} style={styles.loading} />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <ScreenBackButton label={t('account.orders.backToAccount')} />
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('account.accountPage.settings')}</Text>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.personalDetails')}</Text>
          <Text style={textStyle(isArabic, 'caption')}>{t('account.personalDetailsHint')}</Text>

          <Text style={styles.fieldLabel}>{t('common.fullName')}</Text>
          <TextInput onChangeText={setFullName} style={styles.input} value={fullName} />

          <Text style={styles.fieldLabel}>{t('common.phone')}</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={setPhone}
            placeholder={t('account.phonePlaceholder')}
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={phone}
          />

          {profileMessage ? (
            <Text style={[styles.message, profileMessage.type === 'err' ? styles.messageErr : styles.messageOk]}>
              {profileMessage.text}
            </Text>
          ) : null}

          <MasaButton
            disabled={savingProfile}
            label={savingProfile ? t('common.saving') : t('common.saveChanges')}
            onPress={() => void saveProfile()}
          />
        </MasaCard>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.preferences')}</Text>
          <Text style={textStyle(isArabic, 'caption')}>{t('account.preferencesHint')}</Text>

          <Pressable
            disabled={newsletterBusy}
            onPress={() => void toggleNewsletter()}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, newsletterOptIn ? styles.checkboxChecked : null]}>
              {newsletterOptIn ? <Check color={theme.colors.white} size={14} /> : null}
            </View>
            <Text style={[textStyle(isArabic, 'bodySm'), styles.checkboxLabel]}>
              {t('account.newsletterOptIn')}
            </Text>
          </Pressable>
        </MasaCard>

        <MasaCard style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('account.accountSecurity')}</Text>
          <Text style={textStyle(isArabic, 'caption')}>{t('account.accountSecurityHint')}</Text>

          <View style={styles.field}>
            <Text style={textStyle(isArabic, 'caption')}>{t('account.emailStatus')}</Text>
            <Text style={textStyle(isArabic, 'bodySm')}>
              {user.email_confirmed_at ? t('common.verified') : t('common.notVerifiedYet')}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={textStyle(isArabic, 'caption')}>{t('account.signedInWithEmail')}</Text>
            <Text style={textStyle(isArabic, 'bodySm')}>{email}</Text>
          </View>
          <Text style={[textStyle(isArabic, 'caption'), styles.hint]}>{t('account.passwordResetHint')}</Text>
        </MasaCard>

        {/*
          Account deletion (Google Play requirement). Two steps on purpose: the
          panel must be opened AND the confirmation word typed, so a single tap
          can never destroy an account.
        */}
        <MasaCard style={styles.dangerCard}>
          <Text style={[styles.dangerTitle, { fontFamily: luxury }]}>
            {t('account.deleteAccount.title')}
          </Text>
          <Text style={textStyle(isArabic, 'caption')}>{t('account.deleteAccount.sectionHint')}</Text>

          {!deleteOpen ? (
            <MasaButton
              label={t('account.deleteAccount.buttonLabel')}
              onPress={() => setDeleteOpen(true)}
              style={styles.dangerBtn}
              variant="outline"
            />
          ) : (
            <View style={styles.dangerBody}>
              <View style={styles.warningBox}>
                <View style={styles.warningHeader}>
                  <AlertTriangle color="#b91c1c" size={16} />
                  <Text style={styles.warningTitle}>{t('account.deleteAccount.warningTitle')}</Text>
                </View>
                <Text style={styles.warningText}>{t('account.deleteAccount.warningBody')}</Text>
              </View>

              <Text style={styles.fieldLabel}>{t('account.deleteAccount.confirmPrompt')}</Text>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!deleting}
                onChangeText={setDeleteConfirm}
                placeholder={confirmWord}
                placeholderTextColor={theme.colors.masaGray}
                style={styles.input}
                value={deleteConfirm}
              />

              {deleteError ? <Text style={[styles.message, styles.messageErr]}>{deleteError}</Text> : null}

              <MasaButton
                disabled={!canDelete || deleting}
                label={
                  deleting
                    ? t('account.deleteAccount.deleting')
                    : t('account.deleteAccount.confirmCta')
                }
                onPress={() => void handleDeleteAccount()}
              />
              <MasaButton
                disabled={deleting}
                label={t('account.deleteAccount.cancel')}
                onPress={() => {
                  setDeleteOpen(false);
                  setDeleteConfirm('');
                  setDeleteError(null);
                }}
                variant="outline"
              />
            </View>
          )}
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: { flex: 1 },
  dangerBody: { gap: 8, marginTop: 4 },
  dangerBtn: { marginTop: 8 },
  dangerCard: { borderColor: '#fecaca', gap: 4 },
  dangerTitle: { color: '#b91c1c', fontSize: 16 },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  warningHeader: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  warningText: { color: '#7f1d1d', fontSize: 13, lineHeight: 20 },
  warningTitle: { color: '#b91c1c', fontSize: 13, fontWeight: '700' },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  content: {
    gap: 16,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 24,
  },
  field: { gap: 2, marginTop: 8 },
  fieldLabel: {
    color: theme.colors.masaDark,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  hint: { marginTop: 8 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: { marginTop: 60 },
  message: { fontSize: 13, marginTop: 8 },
  messageErr: { color: '#dc2626' },
  messageOk: { color: '#16A34A' },
  section: { gap: 4 },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  title: {
    color: theme.colors.primary,
    fontSize: 24,
  },
});
