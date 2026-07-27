import type { AuthError, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { getSupabase } from '../api/client';
import {
  CUSTOMER_TERMS_VERSION,
  MERCHANT_TERMS_VERSION,
} from '../constants/legalVersions';
import { normalizeAuthError, type AuthLanguage } from '../lib/authErrorMessages';
import {
  getOAuthRedirectUri,
  isWebsiteAuthUrl,
  parseAuthCallbackUrl,
  patchSupabaseOAuthUrl,
} from '../lib/oauthRedirect';
import { signInWithGoogleNative, signInWithGoogleExpoAuthSession } from './googleAuthService';
import {
  runOAuthCallbackExchange,
  setBrowserOAuthInFlight,
} from './oauthCallbackCoordinator';
import { useAuthStore } from '../stores/authStore';
import {
  applyRegistrationIntentToProfile,
  resolveProfileRole,
  waitForUserProfile,
} from './profileAuthService';
import {
  consumePreRegistrationSellerPlan,
  getPreRegistrationSellerPlan,
} from './pendingSellerPlanStorage';
import type { SellerPlanId } from '../constants/sellerPlans';

const PENDING_OAUTH_INTENT_KEY = 'masa-pending-oauth-intent';

async function stashOAuthIntent(intent: RegistrationIntent): Promise<void> {
  await AsyncStorage.setItem(PENDING_OAUTH_INTENT_KEY, intent);
}

async function consumeOAuthIntent(): Promise<RegistrationIntent | null> {
  const value = await AsyncStorage.getItem(PENDING_OAUTH_INTENT_KEY);
  await AsyncStorage.removeItem(PENDING_OAUTH_INTENT_KEY);
  if (value === 'buyer' || value === 'seller') return value;
  return null;
}

WebBrowser.maybeCompleteAuthSession();

export type AuthResult = {
  user: User | null;
  error: AuthError | null;
  message?: string;
  /** True when Supabase requires email confirmation before a session exists. */
  needsEmailConfirmation?: boolean;
};

export type RegistrationIntent = 'buyer' | 'seller';

export type OAuthProvider = 'google' | 'apple';

function buildSignUpMetadata(
  intent: RegistrationIntent,
  options: { fullName?: string; phone?: string } = {},
  pendingSellerPlan?: SellerPlanId | null,
): Record<string, unknown> {
  const acceptedAt = new Date().toISOString();
  const registration_intent = intent === 'seller' ? 'seller' : 'buyer';

  const base: Record<string, unknown> = {
    full_name: options.fullName?.trim() || '',
    phone: options.phone?.trim() || '',
    newsletter_opt_in: false,
    registration_intent,
    signup_channel: 'email',
  };

  if (intent === 'buyer') {
    return {
      ...base,
      customer_terms_accepted: 'true',
      customer_terms_version: CUSTOMER_TERMS_VERSION,
      customer_terms_accepted_at: acceptedAt,
    };
  }

  return {
    ...base,
    merchant_terms_accepted: 'true',
    merchant_terms_version: MERCHANT_TERMS_VERSION,
    merchant_terms_accepted_at: acceptedAt,
    pending_seller_plan: pendingSellerPlan,
  };
}

function toAuthError(message: string, status = 400): AuthError {
  return { message, name: 'AuthError', status } as AuthError;
}

export async function signInWithPassword(
  email: string,
  password: string,
  language: AuthLanguage = 'en',
): Promise<AuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !password) {
    return {
      user: null,
      error: toAuthError('Email and password are required.'),
      message:
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Please enter your email and password.',
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return {
      user: null,
      error: toAuthError('Invalid email'),
      message:
        language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email address.',
    };
  }

  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: trimmed,
    password,
  });

  if (error) {
    return {
      user: null,
      error,
      message: normalizeAuthError(error.message, language),
    };
  }

  return { user: data.user, error: null };
}

export type SignUpOptions = {
  fullName?: string;
  phone?: string;
  intent?: RegistrationIntent;
  language?: AuthLanguage;
};

export async function signUpWithEmail(
  email: string,
  password: string,
  options: SignUpOptions = {},
): Promise<AuthResult> {
  const language = options.language ?? 'en';
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !password) {
    return {
      user: null,
      error: toAuthError('Email and password are required.'),
      message:
        language === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Please enter your email and password.',
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return {
      user: null,
      error: toAuthError('Invalid email'),
      message:
        language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email address.',
    };
  }

  if (password.length < 8) {
    return {
      user: null,
      error: toAuthError('Password too short'),
      message: normalizeAuthError('Password should be at least 8 characters', language),
    };
  }

  const intent = options.intent ?? 'buyer';
  const redirectTo = getOAuthRedirectUri();

  let pendingSellerPlan: SellerPlanId | null = null;
  if (intent === 'seller') {
    pendingSellerPlan = await getPreRegistrationSellerPlan();
    if (!pendingSellerPlan) {
      return {
        user: null,
        error: toAuthError('Seller plan required'),
        message:
          language === 'ar'
            ? 'يرجى اختيار خطة بائع قبل إنشاء الحساب.'
            : 'Please choose a seller plan before creating your account.',
      };
    }
  }

  const { data, error } = await getSupabase().auth.signUp({
    email: trimmed,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: buildSignUpMetadata(intent, options, pendingSellerPlan),
    },
  });

  if (error) {
    const raw = error.message ?? '';
    if (raw.includes('CUSTOMER_TERMS_REQUIRED')) {
      return {
        user: null,
        error,
        message:
          language === 'ar'
            ? 'يلزم قبول شروط العميل لإنشاء حساب مشتري.'
            : 'Customer terms acceptance is required for buyer registration.',
      };
    }
    if (raw.includes('MERCHANT_TERMS_REQUIRED')) {
      return {
        user: null,
        error,
        message:
          language === 'ar'
            ? 'يلزم قبول شروط التاجر لإنشاء حساب بائع.'
            : 'Merchant terms acceptance is required for seller registration.',
      };
    }
    return {
      user: null,
      error,
      message: normalizeAuthError(error.message, language),
    };
  }

  const sessionMissing = !data.session;
  if (intent === 'seller' && data.user) {
    await consumePreRegistrationSellerPlan();
  }
  return {
    user: data.user,
    error: null,
    needsEmailConfirmation: sessionMissing && Boolean(data.user),
  };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await getSupabase().auth.signOut();
  return { error };
}

export async function refreshAuthSession(): Promise<void> {
  const { data } = await getSupabase().auth.getSession();
  useAuthStore.getState().setSession(data.session);
}

export async function createSessionFromCallbackUrl(
  url: string,
  language: AuthLanguage = 'en',
): Promise<AuthResult> {
  return runOAuthCallbackExchange(url, () => performSessionFromCallbackUrl(url, language));
}

async function performSessionFromCallbackUrl(
  url: string,
  language: AuthLanguage = 'en',
): Promise<AuthResult> {
  const { code, accessToken, refreshToken, error: oauthError, errorDescription } =
    parseAuthCallbackUrl(url);

  if (oauthError) {
    const msg = errorDescription ?? oauthError;
    const isWebsite =
      oauthError === 'website_redirect' ||
      (language === 'ar'
        ? 'فتح الموقع'
        : msg.toLowerCase().includes('website'));
    return {
      user: null,
      error: toAuthError(msg),
      message: isWebsite
        ? language === 'ar'
          ? 'تم فتح موقع ماسا بدلاً من التطبيق. أضف masa://auth/callback في إعدادات Supabase ثم أعد المحاولة.'
          : 'Sign-in opened the website instead of the app. Add masa://auth/callback to Supabase redirect URLs, then try again.'
        : normalizeAuthError(msg, language),
    };
  }

  const client = getSupabase();
  let user = null;

  if (code) {
    const { data: existingSession } = await client.auth.getSession();
    if (existingSession.session?.user) {
      user = existingSession.session.user;
    } else {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (error) {
        return {
          user: null,
          error,
          message: normalizeAuthError(error.message, language),
        };
      }
      user = data.user;
    }
  } else if (accessToken && refreshToken) {
    const { data, error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      return {
        user: null,
        error,
        message: normalizeAuthError(error.message, language),
      };
    }
    user = data.user;
  } else {
    return {
      user: null,
      error: toAuthError('Missing auth code'),
      message:
        language === 'ar'
          ? 'تعذر إكمال تسجيل الدخول. حاول مرة أخرى.'
          : 'Could not complete sign-in. Please try again.',
    };
  }

  const pendingIntent = await consumeOAuthIntent();
  if (user && pendingIntent === 'seller') {
    await applyRegistrationIntentToProfile(user.id, pendingIntent);
  }

  return { user, error: null };
}

export async function signInWithOAuth(
  provider: Exclude<OAuthProvider, 'apple'>,
  intent?: RegistrationIntent,
  language: AuthLanguage = 'en',
): Promise<AuthResult> {
  if (provider === 'google') {
    const expoResult = await signInWithGoogleExpoAuthSession(intent, language);
    if (expoResult) {
      return expoResult;
    }

    const nativeResult = await signInWithGoogleNative(intent, language);
    if (nativeResult) {
      return nativeResult;
    }
  }

  const redirectTo = getOAuthRedirectUri();
  if (intent === 'seller') {
    await stashOAuthIntent(intent);
  } else {
    await AsyncStorage.removeItem(PENDING_OAUTH_INTENT_KEY);
  }

  const { data, error } = await getSupabase().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return {
      user: null,
      error,
      message: normalizeAuthError(error.message, language),
    };
  }

  if (!data?.url) {
    return {
      user: null,
      error: toAuthError('No OAuth URL'),
      message:
        language === 'ar'
          ? 'تعذر بدء تسجيل الدخول. تحقق من إعدادات Google في Supabase.'
          : 'Could not start sign-in. Enable Google in Supabase and add masa://auth/callback to redirect URLs.',
    };
  }

  const authUrl = patchSupabaseOAuthUrl(data.url, redirectTo);

  if (__DEV__) {
    console.log('[Auth] OAuth redirectTo:', redirectTo);
  }

  setBrowserOAuthInFlight(true);
  try {
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo, {
      showInRecents: true,
      preferEphemeralSession: false,
    });

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return {
        user: null,
        error: toAuthError('OAuth cancelled'),
        message:
          language === 'ar'
            ? 'تم إلغاء تسجيل الدخول.'
            : 'Sign-in was cancelled.',
      };
    }

    if (result.type !== 'success' || !result.url) {
      return {
        user: null,
        error: toAuthError('OAuth failed'),
        message: normalizeAuthError(null, language),
      };
    }

    if (isWebsiteAuthUrl(result.url)) {
      return {
        user: null,
        error: toAuthError('Website redirect'),
        message:
          language === 'ar'
            ? 'تم تحويلك إلى موقع ماسا. أضف masa://auth/callback في Supabase → Authentication → URL Configuration.'
            : 'You were sent to the MASA website. Add masa://auth/callback in Supabase → Authentication → URL Configuration.',
      };
    }

    return createSessionFromCallbackUrl(result.url, language);
  } finally {
    setBrowserOAuthInFlight(false);
  }
}

export async function signInWithApple(
  intent?: RegistrationIntent,
  language: AuthLanguage = 'en',
): Promise<AuthResult> {
  if (Platform.OS !== 'ios') {
    return {
      user: null,
      error: toAuthError('Apple Sign In unavailable'),
      message:
        language === 'ar'
          ? 'تسجيل الدخول عبر Apple متاح على iOS فقط.'
          : 'Apple Sign In is only available on iOS.',
    };
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return {
      user: null,
      error: toAuthError('Apple Sign In unavailable'),
      message:
        language === 'ar'
          ? 'تسجيل الدخول عبر Apple غير متاح على هذا الجهاز.'
          : 'Apple Sign In is not available on this device.',
    };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return {
        user: null,
        error: toAuthError('Missing Apple identity token'),
        message: normalizeAuthError(null, language),
      };
    }

    const { data, error } = await getSupabase().auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      return {
        user: null,
        error,
        message: normalizeAuthError(error.message, language),
      };
    }

    const user = data.user;
    if (user) {
      if (credential.fullName) {
        const parts = [
          credential.fullName.givenName,
          credential.fullName.familyName,
        ].filter(Boolean);
        if (parts.length) {
          await getSupabase().auth.updateUser({
            data: { full_name: parts.join(' ') },
          });
        }
      }
      if (intent === 'seller') {
        await applyRegistrationIntentToProfile(user.id, intent);
      }
      await waitForUserProfile(user.id, 4, 300);
    }

    return { user: data.user, error: null };
  } catch (e) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      (e as { code: string }).code === 'ERR_REQUEST_CANCELED'
    ) {
      return {
        user: null,
        error: toAuthError('Apple cancelled'),
        message:
          language === 'ar' ? 'تم إلغاء تسجيل الدخول.' : 'Sign-in was cancelled.',
      };
    }
    const msg = e instanceof Error ? e.message : 'Apple sign-in failed';
    return {
      user: null,
      error: toAuthError(msg),
      message: normalizeAuthError(msg, language),
    };
  }
}

export async function completeAuthFlow(
  user: User,
  intent?: RegistrationIntent,
): Promise<{ role: Awaited<ReturnType<typeof resolveProfileRole>> }> {
  if (intent) {
    await applyRegistrationIntentToProfile(user.id, intent);
  }
  const role = await resolveProfileRole(user);
  await refreshAuthSession();
  return { role };
}
