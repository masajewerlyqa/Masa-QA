import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Production site used when dev localhost is unreachable from a device. */
const DEFAULT_PRODUCTION_SITE = 'https://masajewelry.com';

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export type EnvStatus = {
  supabase: SupabaseEnv | null;
  siteUrl: string | null;
  supabaseError: string | null;
  siteUrlError: string | null;
};

function readSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Resolves EXPO_PUBLIC_SITE_URL for physical devices and emulators.
 * localhost/127.0.0.1 in .env is rewritten to the Expo dev host or Android emulator bridge.
 */
export function resolveSiteUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_SITE_URL?.trim();
  const production =
    process.env.EXPO_PUBLIC_SITE_URL_PRODUCTION?.trim() || DEFAULT_PRODUCTION_SITE;

  if (!raw) {
    return production.replace(/\/$/, '');
  }

  try {
    const parsed = new URL(raw);
    const isLocal =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (!isLocal) {
      return raw.replace(/\/$/, '');
    }

    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
    const protocol = parsed.protocol;

    const hostUri = Constants.expoConfig?.hostUri;
    const lanHost = hostUri?.split(':')[0];
    if (lanHost && lanHost !== 'localhost' && lanHost !== '127.0.0.1') {
      return `${protocol}//${lanHost}:${port}`;
    }

    if (Platform.OS === 'android') {
      return `${protocol}//10.0.2.2:${port}`;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      return raw.replace(/\/$/, '');
    }

    return raw.replace(/\/$/, '');
  } catch {
    return raw.replace(/\/$/, '');
  }
}

export function getEnvStatus(): EnvStatus {
  const supabase = readSupabaseEnv();
  const siteUrl = resolveSiteUrl();

  return {
    supabase,
    siteUrl,
    supabaseError: supabase
      ? null
      : 'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in masa-mobile/.env',
    siteUrlError: siteUrl
      ? null
      : 'Missing EXPO_PUBLIC_SITE_URL (Next.js site for market prices & contact API).',
  };
}
