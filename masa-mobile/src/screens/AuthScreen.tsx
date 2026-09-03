import { useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SocialAuthButtonsMobile } from '../components/auth/SocialAuthButtonsMobile';
import { MasaButton } from '../components/MasaButton';
import { MasaCard } from '../components/MasaCard';
import { SiteShell } from '../components/layout/SiteShell';
import { MOBILE_CONTENT_PADDING_X, MOBILE_SCROLL_BOTTOM_PADDING } from '../constants/layout';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { navigateAfterAuth } from '../lib/sellerNavigation';
import type { RootStackParamList } from '../navigation/types';
import { goSellerPlans } from '../navigation/routes';
import { getSupabase } from '../api/client';
import {
  clearPreRegistrationSellerPlan,
  getPreRegistrationSellerPlan,
} from '../services/pendingSellerPlanStorage';
import type { SellerPlanId } from '../constants/sellerPlans';
import {
  completeAuthFlow,
  signInWithPassword,
  signUpWithEmail,
  type RegistrationIntent,
} from '../services/authService';

/** Matches web `/login` + social auth + email form */
export function AuthScreen(): React.JSX.Element {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Auth'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
  const { isArabic, t, language } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');

  const initialMode = route.params?.mode ?? 'signin';
  const signupIntent: RegistrationIntent | undefined =
    route.params?.intent === 'seller' ? 'seller' : route.params?.intent === 'buyer' ? 'buyer' : undefined;

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [intent, setIntent] = useState<RegistrationIntent>(signupIntent ?? 'buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SellerPlanId | null>(null);

  useEffect(() => {
    if (route.params?.mode) setMode(route.params.mode);
    if (route.params?.intent) setIntent(route.params.intent === 'seller' ? 'seller' : 'buyer');
  }, [route.params?.mode, route.params?.intent]);

  useFocusEffect(
    useCallback(() => {
      if (mode !== 'signup' || intent !== 'seller') return;
      void getPreRegistrationSellerPlan().then(setSelectedPlan);
    }, [mode, intent]),
  );

  const isSignIn = mode === 'signin';
  const brand = t('common.brand');
  const authLang = language === 'ar' ? 'ar' : 'en';

  const finishAuth = async (): Promise<void> => {
    const { data } = await getSupabase().auth.getUser();
    const user = data.user;
    if (!user) return;
    const { role } = await completeAuthFlow(user, isSignIn ? undefined : intent);
    navigateAfterAuth(role, isSignIn ? undefined : intent);
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);
    setMessage(null);

    if (!isSignIn && intent === 'seller' && !selectedPlan) {
      setMessage(t('auth.register.sellerPlanRequired'));
      setIsSubmitting(false);
      goSellerPlans();
      return;
    }

    if (isSignIn) {
      const result = await signInWithPassword(email.trim(), password, authLang);
      if (result.error || result.message) {
        setMessage(result.message ?? result.error?.message ?? t('common.somethingWentWrong'));
        setIsSubmitting(false);
        return;
      }
      await finishAuth();
    } else {
      const result = await signUpWithEmail(email.trim(), password, {
        intent,
        language: authLang,
      });
      if (result.error || result.message) {
        setMessage(result.message ?? result.error?.message ?? t('common.somethingWentWrong'));
        setIsSubmitting(false);
        return;
      }
      if (result.needsEmailConfirmation) {
        setMessage(
          isArabic
            ? 'تحقق من بريدك الإلكتروني لتأكيد الحساب، ثم سجّل الدخول.'
            : 'Check your inbox to verify your email, then sign in.',
        );
        setIsSubmitting(false);
        return;
      }
      await finishAuth();
    }

    setIsSubmitting(false);
  };

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MasaCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontFamily: luxury }]}>
              {isSignIn
                ? isArabic
                  ? 'مرحباً بعودتك'
                  : 'Welcome back'
                : intent === 'seller' && selectedPlan
                  ? t('auth.register.createAccountToApplySeller')
                  : isArabic
                    ? 'إنشاء حساب'
                    : 'Create account'}
            </Text>
            <Text style={textStyle(isArabic, 'body')}>
              {isSignIn
                ? isArabic
                  ? `سجّل الدخول إلى حسابك في ${brand}`
                  : `Sign in to your ${brand} account`
                : isArabic
                  ? `انضم إلى ${brand}`
                  : `Join ${brand}`}
            </Text>
          </View>

          <SocialAuthButtonsMobile
            isArabic={isArabic}
            signupIntent={isSignIn ? undefined : intent}
            onSuccess={() => void finishAuth()}
            onError={(msg) => setMessage(msg)}
            disabled={isSubmitting}
          />

          {!isSignIn ? (
            <View style={styles.pathRow}>
              <MasaButton
                label={isArabic ? 'متابعة كمشتري' : 'Continue as buyer'}
                onPress={() => {
                  void clearPreRegistrationSellerPlan();
                  setSelectedPlan(null);
                  setIntent('buyer');
                }}
                variant={intent === 'buyer' ? 'primary' : 'outline'}
              />
              <MasaButton
                label={t('auth.register.continueAsSeller')}
                onPress={() => {
                  setIntent('seller');
                  goSellerPlans();
                }}
                variant={intent === 'seller' ? 'primary' : 'outline'}
              />
            </View>
          ) : null}

          {!isSignIn && intent === 'seller' && selectedPlan ? (
            <View style={styles.planChip}>
              <Text style={textStyle(isArabic, 'bodySm')}>
                {t('auth.register.selectedPlanLabel')}:{' '}
                {selectedPlan === 'basic'
                  ? t('sellerOnboarding.basicName')
                  : t('sellerOnboarding.premiumName')}
              </Text>
              <Text onPress={() => goSellerPlans()} style={styles.changePlanLink}>
                {isArabic ? 'تغيير الخطة' : 'Change plan'}
              </Text>
            </View>
          ) : null}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>
              {isArabic ? 'أو عبر البريد الإلكتروني' : 'or email'}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {message ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{message}</Text>
            </View>
          ) : null}

          <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>{t('common.email')}</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.masaGray}
            style={styles.input}
            value={email}
          />

          <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>
            {isArabic ? 'كلمة المرور' : 'Password'}
          </Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.masaGray}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <MasaButton
            disabled={isSubmitting}
            label={
              isSubmitting
                ? isArabic
                  ? 'يرجى الانتظار...'
                  : 'Please wait...'
                : isSignIn
                  ? isArabic
                    ? 'تسجيل الدخول'
                    : 'Sign In'
                  : isArabic
                    ? 'إنشاء حساب'
                    : 'Create Account'
            }
            onPress={() => void handleSubmit()}
          />

          <MasaButton
            label={
              isSignIn
                ? isArabic
                  ? 'ليس لديك حساب؟ سجّل الآن'
                  : 'Need an account? Sign Up'
                : isArabic
                  ? 'لديك حساب؟ سجّل الدخول'
                  : 'Already have an account? Sign In'
            }
            onPress={() => {
              setMode(isSignIn ? 'signup' : 'signin');
              setMessage(null);
            }}
            variant="ghost"
          />

          {navigation.canGoBack() ? (
            <MasaButton
              label={isArabic ? 'إلغاء' : 'Cancel'}
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          ) : null}
        </MasaCard>
      </ScrollView>
    </SiteShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 400,
    paddingBottom: MOBILE_SCROLL_BOTTOM_PADDING,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    paddingTop: 48,
  },
  card: {
    gap: 16,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  pathRow: { gap: 12 },
  planChip: {
    alignItems: 'center',
    backgroundColor: theme.colors.masaLight,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  changePlanLink: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  dividerLine: {
    backgroundColor: theme.colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: theme.colors.masaGray,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  label: {
    color: theme.colors.masaDark,
    marginBottom: 6,
  },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
});
