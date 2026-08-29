import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { MasaButton } from '../../components/MasaButton';
import { MasaCard } from '../../components/MasaCard';
import { SiteShell } from '../../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../../constants/layout';
import { sellerApplicationStatusCopy } from '../../constants/sellerApplicationStatus';
import { parseSellerPlanId } from '../../constants/sellerPlans';
import { resolveSiteUrl } from '../../config/env';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import { goSellerApplicationSuccess, goSellerPlans } from '../../lib/sellerNavigation';
import type { RootStackParamList } from '../../navigation/types';
import {
  finalizeSellerApplication,
  getPendingSellerPlan,
  getSellerApplication,
  pickLicenseFile,
  pickLogoImage,
} from '../../services/sellerApplicationService';
import { sellerApplicationFormSchema } from '../../lib/validations/sellerApplication';

export function SellerApplicationScreen(): React.JSX.Element {
  const route = useRoute<RouteProp<RootStackParamList, 'SellerApplication'>>();
  const { isArabic, t } = useSettings();
  const { user } = useAuth();
  const luxury = fontFamily(isArabic, 'luxury');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [brandStoreName, setBrandStoreName] = useState('');
  const [contactFullName, setContactFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [logoName, setLogoName] = useState<string | null>(null);
  const [licenseName, setLicenseName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const [app, plan] = await Promise.all([getSellerApplication(), getPendingSellerPlan()]);
      if (!mounted) return;
      if (app || route.params?.view === 'existing') {
        setExistingStatus(app?.status ?? 'pending');
      }
      setSelectedPlan(plan);
      const meta = user.user_metadata;
      if (typeof meta?.full_name === 'string') setContactFullName(meta.full_name);
      if (user.email) setEmail(user.email);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [user, route.params?.view]);

  const handleSubmit = async (): Promise<void> => {
    setError(null);
    const formValues = {
      brand_store_name: brandStoreName.trim(),
      contact_full_name: contactFullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      store_location: storeLocation.trim(),
      store_description: storeDescription.trim(),
      website: website.trim() || undefined,
      facebook: facebook.trim() || undefined,
      instagram: instagram.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
    };

    const parsed = sellerApplicationFormSchema.safeParse(formValues);
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join('; '));
      return;
    }

    const license = await pickLicenseFile();
    if (!license) {
      setError(
        isArabic
          ? 'يرجى رفع السجل التجاري أو الشهادة التجارية.'
          : 'Please upload your business certificate or commercial license.',
      );
      return;
    }

    setSubmitting(true);
    try {
      const logo = await pickLogoImage();
      const result = await finalizeSellerApplication(parsed.data, license, logo);
      if (!result.ok) {
        if (result.code === 'SELECT_PLAN_FIRST') {
          setError(t('sellerOnboarding.selectPlanFirstError'));
        } else {
          setError(result.error);
        }
        return;
      }
      goSellerApplicationSuccess(result.planId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SiteShell>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </SiteShell>
    );
  }

  if (existingStatus) {
    const statusCopy = sellerApplicationStatusCopy(existingStatus, isArabic);
    return (
      <SiteShell>
        <View style={styles.centered}>
          <MasaCard style={styles.card}>
            <Text style={[styles.title, { fontFamily: luxury }]}>
              {isArabic ? 'طلب البائع' : 'Seller application'}
            </Text>
            <Text style={textStyle(isArabic, 'bodySm')}>
              {isArabic ? 'الحالة:' : 'Status:'}{' '}
              <Text style={{ fontWeight: '600' }}>{statusCopy.label}</Text>
            </Text>
            <Text style={textStyle(isArabic, 'body')}>{statusCopy.detail}</Text>
            {statusCopy.needsAction ? (
              // Proof upload lives on the site; sending them there beats leaving
              // them on a dead end with no way to finish paying.
              <MasaButton
                label={isArabic ? 'إكمال الدفع' : 'Complete payment'}
                onPress={() => {
                  void Linking.openURL(`${resolveSiteUrl()}/apply/payment`);
                }}
              />
            ) : null}
            <MasaButton
              label={isArabic ? 'العودة للرئيسية' : 'Back to home'}
              onPress={() => goSellerPlans()}
              variant="outline"
            />
          </MasaCard>
        </View>
      </SiteShell>
    );
  }

  const planLabel =
    parseSellerPlanId(selectedPlan) === 'premium'
      ? t('sellerOnboarding.premiumName')
      : t('sellerOnboarding.basicName');

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MasaCard style={styles.card}>
          <Text style={[styles.title, { fontFamily: luxury }]}>
            {isArabic ? 'طلب البائع' : 'Seller application'}
          </Text>
          {selectedPlan ? (
            <Text style={textStyle(isArabic, 'bodySm')}>
              {t('sellerOnboarding.formPlanSummary')}: {planLabel}{' '}
              <Text onPress={() => goSellerPlans()} style={styles.changePlan}>
                {t('sellerOnboarding.formChangePlan')}
              </Text>
            </Text>
          ) : null}
          <Text style={textStyle(isArabic, 'body')}>
            {isArabic
              ? 'أكمل النموذج أدناه وسنراجع طلبك ثم نعاود التواصل.'
              : 'Complete the form below. We will review your application and get back to you.'}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Field isArabic={isArabic} label={isArabic ? 'اسم العلامة / المتجر' : 'Brand / store name'}>
            <TextInput onChangeText={setBrandStoreName} style={styles.input} value={brandStoreName} />
          </Field>
          <Field isArabic={isArabic} label={isArabic ? 'اسم جهة الاتصال' : 'Contact person'}>
            <TextInput onChangeText={setContactFullName} style={styles.input} value={contactFullName} />
          </Field>
          <Field isArabic={isArabic} label={t('common.email')}>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              style={styles.input}
              value={email}
            />
          </Field>
          <Field isArabic={isArabic} label={t('common.phone')}>
            <TextInput onChangeText={setPhone} style={styles.input} value={phone} />
          </Field>
          <Field isArabic={isArabic} label={isArabic ? 'موقع المتجر' : 'Store location'}>
            <TextInput onChangeText={setStoreLocation} style={styles.input} value={storeLocation} />
          </Field>
          <Field isArabic={isArabic} label={isArabic ? 'وصف المتجر' : 'Store description'}>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setStoreDescription}
              style={[styles.input, styles.textArea]}
              value={storeDescription}
            />
          </Field>
          <Field isArabic={isArabic} label="Website">
            <TextInput autoCapitalize="none" onChangeText={setWebsite} style={styles.input} value={website} />
          </Field>

          <MasaButton
            label={logoName ?? (isArabic ? 'رفع الشعار (اختياري)' : 'Upload logo (optional)')}
            onPress={() => {
              void pickLogoImage().then((f) => f && setLogoName(f.name));
            }}
            variant="outline"
          />
          <MasaButton
            label={
              licenseName ??
              (isArabic ? 'رفع الرخصة / الشهادة *' : 'Upload license / certificate *')
            }
            onPress={() => {
              void pickLicenseFile().then((f) => f && setLicenseName(f.name));
            }}
            variant="outline"
          />

          <MasaButton
            disabled={submitting}
            label={
              submitting
                ? isArabic
                  ? 'جارٍ الإرسال...'
                  : 'Submitting...'
                : isArabic
                  ? 'إرسال الطلب'
                  : 'Submit application'
            }
            onPress={() => void handleSubmit()}
          />
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

function Field({
  label,
  children,
  isArabic,
}: {
  label: string;
  children: React.ReactNode;
  isArabic: boolean;
}): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={textStyle(isArabic, 'bodySm')}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: MOBILE_CONTENT_PADDING_X,
  },
  card: { gap: 12 },
  title: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  changePlan: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  field: { gap: 6 },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 12,
  },
  errorText: { color: '#991b1b', fontSize: 14 },
});
