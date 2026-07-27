import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

export type AuthCallbackParams = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  errorDescription: string | null;
};

const AUTH_CALLBACK_PATH = 'auth/callback';
const APP_SCHEME = 'masa';

/** Hostnames that must never be used as OAuth return targets in the mobile app. */
const BLOCKED_OAUTH_HOSTS = ['masajewelry.com', 'www.masajewelry.com', 'localhost'];

/**
 * Native-only redirect URI for Supabase OAuth / email links.
 * In Expo Go this MUST be an `exp://` URI (not `masa://`) or PKCE exchange fails.
 */
export function getOAuthRedirectUri(): string {
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    const expoUri = makeRedirectUri({
      scheme: getAppScheme(),
      path: AUTH_CALLBACK_PATH,
    });
    if (expoUri && isAllowedNativeRedirect(expoUri)) {
      return expoUri;
    }
  }

  const fromEnv = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI?.trim();
  if (fromEnv && isAllowedNativeRedirect(fromEnv)) {
    return fromEnv;
  }

  const fromMakeRedirect = makeRedirectUri({
    scheme: getAppScheme(),
    path: AUTH_CALLBACK_PATH,
  });
  if (fromMakeRedirect && isAllowedNativeRedirect(fromMakeRedirect)) {
    return fromMakeRedirect;
  }

  try {
    const fromLinking = Linking.createURL(AUTH_CALLBACK_PATH);
    if (fromLinking && isAllowedNativeRedirect(fromLinking)) {
      return fromLinking;
    }
  } catch {
    // fall through
  }

  return `${APP_SCHEME}://${AUTH_CALLBACK_PATH}`;
}

export function isAllowedNativeRedirect(uri: string): boolean {
  const lower = uri.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return false;
  }
  if (lower.startsWith(`${APP_SCHEME}://`) || lower.startsWith('exp://')) {
    return !BLOCKED_OAUTH_HOSTS.some((host) => lower.includes(host));
  }
  return false;
}

export function isWebsiteAuthUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return BLOCKED_OAUTH_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );
  } catch {
    return /masajewelry\.com/i.test(url);
  }
}

/**
 * Ensures Supabase authorize URL redirects back to the app, not the marketing site.
 */
export function patchSupabaseOAuthUrl(oauthUrl: string, redirectTo: string): string {
  try {
    const url = new URL(oauthUrl);
    url.searchParams.set('redirect_to', redirectTo);
    return url.toString();
  } catch {
    return oauthUrl;
  }
}

function readParam(
  params: Linking.QueryParams | null | undefined,
  key: string,
): string | null {
  const raw = params?.[key];
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) return raw[0];
  return null;
}

/** Parses `masa://auth/callback?code=...` or token hash params. */
export function parseAuthCallbackUrl(url: string): AuthCallbackParams {
  if (isWebsiteAuthUrl(url)) {
    return {
      code: null,
      accessToken: null,
      refreshToken: null,
      error: 'website_redirect',
      errorDescription:
        'Sign-in opened the website instead of the app. Add masa://auth/callback to Supabase redirect URLs.',
    };
  }

  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    return {
      code: null,
      accessToken: null,
      refreshToken: null,
      error: errorCode,
      errorDescription: readParam(params, 'error_description'),
    };
  }

  const codeFromQuery = readParam(params, 'code');
  const accessToken = readParam(params, 'access_token');
  const refreshToken = readParam(params, 'refresh_token');
  if (codeFromQuery || accessToken) {
    return {
      code: codeFromQuery,
      accessToken,
      refreshToken,
      error: readParam(params, 'error'),
      errorDescription: readParam(params, 'error_description'),
    };
  }

  const parsed = Linking.parse(url);
  const linkParams = parsed.queryParams;

  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    const hashParams = new URLSearchParams(url.slice(hashIndex + 1));
    const codeFromHash = hashParams.get('code');
    const tokenFromHash = hashParams.get('access_token');
    if (codeFromHash || tokenFromHash) {
      return {
        code: codeFromHash,
        accessToken: tokenFromHash,
        refreshToken: hashParams.get('refresh_token'),
        error: hashParams.get('error'),
        errorDescription: hashParams.get('error_description'),
      };
    }
  }

  return {
    code: readParam(linkParams, 'code'),
    accessToken: readParam(linkParams, 'access_token'),
    refreshToken: readParam(linkParams, 'refresh_token'),
    error: readParam(linkParams, 'error'),
    errorDescription: readParam(linkParams, 'error_description'),
  };
}

export function isAuthCallbackUrl(url: string): boolean {
  if (isWebsiteAuthUrl(url)) return false;
  if (/auth\/callback/i.test(url)) return true;
  if (/^masa:\/\/auth\//i.test(url)) return true;
  if (/^exp:\/\/.*auth\/callback/i.test(url)) return true;
  return false;
}

export function getAppScheme(): string {
  const rawScheme = Constants.expoConfig?.scheme;
  return Array.isArray(rawScheme) ? rawScheme[0] : rawScheme ?? APP_SCHEME;
}
