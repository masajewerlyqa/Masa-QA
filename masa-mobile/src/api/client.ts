import 'react-native-url-polyfill/auto';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import { getEnvStatus } from '../config/env';
import { migrateToSecureStore, supabaseAuthStorage } from '../lib/supabaseStorage';

const AUTH_STORAGE_KEY = 'masa-supabase-auth';

let supabaseInstance: SupabaseClient | null = null;
let initError: string | null = null;
let migrationDone = false;

/**
 * Run once before the first Supabase client is used. Moves any
 * plain-text auth tokens from AsyncStorage into SecureStore.
 */
export async function ensureSecureStoreMigration(): Promise<void> {
  if (migrationDone) return;
  await migrateToSecureStore();
  migrationDone = true;
}

function createSupabaseClient(): SupabaseClient {
  const { supabase, supabaseError } = getEnvStatus();
  if (!supabase) {
    throw new Error(
      supabaseError ??
        'Missing EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in masa-mobile/.env',
    );
  }

  return createClient(supabase.url, supabase.anonKey, {
    auth: {
      storage: supabaseAuthStorage,
      storageKey: AUTH_STORAGE_KEY,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
}

/** Single shared Supabase client (same project as web). Lazy-init so missing env shows UI instead of crashing at import. */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  if (initError) throw new Error(initError);
  try {
    supabaseInstance = createSupabaseClient();
    return supabaseInstance;
  } catch (e) {
    initError = e instanceof Error ? e.message : 'Failed to initialize Supabase.';
    throw new Error(initError);
  }
}

/** @deprecated Use getSupabase() — kept for existing imports. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export function getSupabaseInitError(): string | null {
  const { supabaseError } = getEnvStatus();
  return supabaseError ?? initError;
}

export function isSupabaseConfigured(): boolean {
  return getEnvStatus().supabase != null;
}
