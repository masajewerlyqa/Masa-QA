import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { ScreenBackButton } from '../../components/ScreenBackButton';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { getSellerStoreForUser, getSellerStoreFull } from '../../services/sellerDashboardService';
import { requestSellerPlanUpgrade, updateSellerStoreSettings } from '../../services/sellerWriteService';

/** Mirrors web `app/seller/settings`: store profile + contact + social links. */
export function SellerSettingsScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
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
        setName(full.name);
        setSlug(full.slug);
        setDescription(full.description ?? '');
        setLocation(full.location ?? '');
        setContactEmail(full.contactEmail ?? '');
        setContactPhone(full.contactPhone ?? '');
        setWebsite(full.socialLinks?.website ?? '');
        setInstagram(full.socialLinks?.instagram ?? '');
        setFacebook(full.socialLinks?.facebook ?? '');
        setLogoUrl(full.logoUrl);
        setBannerUrl(full.bannerUrl);
        setLatitude(full.latitude);
        setLongitude(full.longitude);
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
    const result = await updateSellerStoreSettings({
      name,
      slug,
      description,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      location,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      website,
      facebook,
      instagram,
      linkedin: '',
      latitude,
      longitude,
    });
    setSaving(false);
    setMessage(
      result.ok
        ? { type: 'ok', text: t('seller.settings.saved') }
        : { type: 'err', text: result.error ?? t('seller.settings.failedToSave') },
    );
  };

  const handleUpgrade = async (): Promise<void> => {
    setUpgrading(true);
    const result = await requestSellerPlanUpgrade();
    setUpgrading(false);
    setMessage(
      result.ok
        ? { type: 'ok', text: t('seller.settings.upgradeSent') }
        : { type: 'err', text: t('seller.settings.upgradeFailed') },
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
        <Text style={[styles.title, { fontFamily: luxury }]}>{t('seller.settings.title')}</Text>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.settings.storeProfile')}</Text>

          <Field label={t('seller.settings.storeName')}>
            <TextInput onChangeText={setName} style={styles.input} value={name} />
          </Field>
          <Field label={t('seller.settings.urlSlug')}>
            <TextInput
              autoCapitalize="none"
              onChangeText={setSlug}
              placeholder={t('seller.settings.urlSlugPlaceholder')}
              placeholderTextColor={theme.colors.masaGray}
              style={styles.input}
              value={slug}
            />
          </Field>
          <Field label={t('seller.settings.descriptionLabel')}>
            <TextInput
              multiline
              numberOfLines={4}
              onChangeText={setDescription}
              style={[styles.input, styles.textarea]}
              textAlignVertical="top"
              value={description}
            />
          </Field>
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.settings.contactLocation')}</Text>
          <Field label={t('seller.settings.locationText')}>
            <TextInput
              onChangeText={setLocation}
              placeholder={t('seller.settings.locationPlaceholder')}
              placeholderTextColor={theme.colors.masaGray}
              style={styles.input}
              value={location}
            />
          </Field>
          <Field label={t('seller.settings.contactEmail')}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setContactEmail}
              style={styles.input}
              value={contactEmail}
            />
          </Field>
          <Field label={t('seller.settings.contactPhone')}>
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setContactPhone}
              style={styles.input}
              value={contactPhone}
            />
          </Field>
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.settings.socialLinks')}</Text>
          <Field label={t('seller.settings.website')}>
            <TextInput autoCapitalize="none" onChangeText={setWebsite} style={styles.input} value={website} />
          </Field>
          <Field label={t('seller.settings.instagram')}>
            <TextInput autoCapitalize="none" onChangeText={setInstagram} style={styles.input} value={instagram} />
          </Field>
          <Field label={t('seller.settings.facebook')}>
            <TextInput autoCapitalize="none" onChangeText={setFacebook} style={styles.input} value={facebook} />
          </Field>
        </MasaCard>

        <MasaCard style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: luxury }]}>{t('seller.settings.subscriptionPlan')}</Text>
          <Text style={styles.hint}>{t('seller.settings.subscriptionPlanDesc')}</Text>
          <MasaButton
            disabled={upgrading}
            label={upgrading ? t('common.saving') : t('seller.settings.requestUpgrade')}
            onPress={() => void handleUpgrade()}
            variant="outline"
          />
        </MasaCard>

        {message ? (
          <Text style={message.type === 'err' ? styles.errorText : styles.okText}>{message.text}</Text>
        ) : null}

        <MasaButton
          disabled={saving}
          label={saving ? t('common.saving') : t('common.saveChanges')}
          onPress={() => void handleSave()}
        />
      </ScrollView>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
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
  errorText: { color: '#dc2626', fontSize: 13 },
  fieldLabel: { color: theme.colors.masaDark, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  hint: { color: theme.colors.masaGray, fontSize: 13, marginBottom: 8 },
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
  okText: { color: '#16A34A', fontSize: 13 },
  sectionTitle: { color: theme.colors.primary, fontSize: 16, marginBottom: 4 },
  textarea: { minHeight: 100 },
  title: { color: theme.colors.primary, fontSize: 24 },
});
