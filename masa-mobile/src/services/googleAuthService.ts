import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { AuthRequest, ResponseType } from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '../api/client';
import type { AuthLanguage } from '../lib/authErrorMessages';
import { normalizeAuthError } from '../lib/authErrorMessages';
import { getAppScheme } from '../lib/oauthRedirect';
import type { AuthError, User } from '@supabase/supabase-js';

import { applyRegistrationIntentToProfile } from './profileAuthService';

type AuthResult = {
  user: User | null;
  error: AuthError | null;
  message?: string;
};

type RegistrationIntent = 'buyer' | 'seller';

type GoogleSigninModule = typeof import('@react-native-google-signin/google-signin').GoogleSignin;

let configured = false;

function getWebClientId(): string | null {
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || null;
}

function configureGoogleSignIn(GoogleSignin: GoogleSigninModule): boolean {
  const webClientId = getWebClientId();
  if (!webClientId) return false;
  if (configured) return true;

  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
    ...(Platform.OS === 'ios' && process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      ? { iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.trim() }
      : {}),
  });
  configured = true;
  return true;
}

function toAuthError(message: string, status = 400) {
  return { message, name: 'AuthError', status } as import('@supabase/supabase-js').AuthError;
}

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Google Sign-In for Expo Go via expo-auth-session + Supabase signInWithIdToken.
 * Avoids Supabase browser PKCE (which fails when redirect URI / storage mismatch).
 */
export async function signInWithGoogleExpoAuthSession(
  intent?: RegistrationIntent,
  language: AuthLanguage = 'en',
): Promise<AuthResult | null> {
  const clientId = getWebClientId();
  if (!clientId || Constants.appOwnership !== 'expo') {
    return null;
  }

  WebBrowser.maybeCompleteAuthSession();

  const redirectUri = makeRedirectUri({
    scheme: getAppScheme(),
    path: 'auth/callback',
  });

  const request = new AuthRequest({
    clientId,
    scopes: ['openid', 'profile', 'email'],
    redirectUri,
    responseType: ResponseType.IdToken,
    usePKCE: false,
  });

  const result = await request.promptAsync(GOOGLE_DISCOVERY);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return {
      user: null,
      error: toAuthError('Google cancelled'),
      message: language === 'ar' ? 'تم إلغاء تسجيل الدخول.' : 'Sign-in was cancelled.',
    };
  }

  if (result.type !== 'success') {
    return null;
  }

  const idToken =
    typeof result.params?.id_token === 'string'
      ? result.params.id_token
      : typeof (result.params as { idToken?: string })?.idToken === 'string'
        ? (result.params as { idToken: string }).idToken
        : null;

  if (!idToken) {
    return null;
  }

  const { data, error } = await getSupabase().auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    return {
      user: null,
      error,
      message: normalizeAuthError(error.message, language),
    };
  }

  if (data.user && intent === 'seller') {
    await applyRegistrationIntentToProfile(data.user.id, intent);
  }

  return { user: data.user, error: null };
}

/**
 * Native Google Sign-In (no browser, no website).
 * Returns null when the native module is unavailable so OAuth browser flow can run.
 */
export async function signInWithGoogleNative(
  intent?: RegistrationIntent,
  language: AuthLanguage = 'en',
): Promise<AuthResult | null> {
  if (!getWebClientId() || Constants.appOwnership === 'expo') {
    return null;
  }

  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    if (!configureGoogleSignIn(GoogleSignin)) {
      return null;
    }

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;
    if (!idToken) {
      return {
        user: null,
        error: toAuthError('Missing Google ID token'),
        message: normalizeAuthError(null, language),
      };
    }

    const { data, error } = await getSupabase().auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return {
        user: null,
        error,
        message: normalizeAuthError(error.message, language),
      };
    }

    if (data.user && intent === 'seller') {
      await applyRegistrationIntentToProfile(data.user.id, intent);
    }

    return { user: data.user, error: null };
  } catch (e) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : '';
    if (code === 'SIGN_IN_CANCELLED' || code === '-5' || code === '12501') {
      return {
        user: null,
        error: toAuthError('Google cancelled'),
        message:
          language === 'ar' ? 'تم إلغاء تسجيل الدخول.' : 'Sign-in was cancelled.',
      };
    }

    if (__DEV__) {
      console.warn('[GoogleAuth] native sign-in unavailable, using in-app OAuth:', e);
    }
    return null;
  }
}
