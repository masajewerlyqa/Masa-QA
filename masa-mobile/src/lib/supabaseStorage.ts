import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SupportedStorage } from '@supabase/supabase-js';

const CHUNK_SIZE = 2000; // stay safely below the 2 048-byte SecureStore limit
const CHUNK_COUNT_SUFFIX = '__chunk_count';

/* ------------------------------------------------------------------ */
/*  Chunked SecureStore helpers                                       */
/* ------------------------------------------------------------------ */

function chunkKey(key: string, index: number): string {
  return `${key}__chunk_${index}`;
}

async function secureSet(key: string, value: string): Promise<void> {
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    await SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);
    return;
  }

  const chunks = Math.ceil(value.length / CHUNK_SIZE);
  const writes: Promise<void>[] = [];
  for (let i = 0; i < chunks; i++) {
    writes.push(
      SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)),
    );
  }
  writes.push(SecureStore.setItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`, String(chunks)));
  await Promise.all(writes);
}

async function secureGet(key: string): Promise<string | null> {
  const countStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

  if (countStr === null) {
    return SecureStore.getItemAsync(key);
  }

  const count = Number(countStr);
  if (!Number.isFinite(count) || count <= 0) return null;

  const reads = Array.from({ length: count }, (_, i) =>
    SecureStore.getItemAsync(chunkKey(key, i)),
  );
  const parts = await Promise.all(reads);

  if (parts.some((p) => p === null)) return null;
  return parts.join('');
}

async function secureRemove(key: string): Promise<void> {
  const countStr = await SecureStore.getItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`);

  if (countStr !== null) {
    const count = Number(countStr);
    const deletes: Promise<void>[] = [];
    for (let i = 0; i < count; i++) {
      deletes.push(SecureStore.deleteItemAsync(chunkKey(key, i)));
    }
    deletes.push(SecureStore.deleteItemAsync(`${key}${CHUNK_COUNT_SUFFIX}`));
    await Promise.all(deletes);
  }

  await SecureStore.deleteItemAsync(key);
}

/* ------------------------------------------------------------------ */
/*  SupportedStorage adapter                                          */
/* ------------------------------------------------------------------ */

export const supabaseAuthStorage: SupportedStorage = {
  getItem: (key: string) => secureGet(key),
  setItem: (key: string, value: string) => secureSet(key, value),
  removeItem: (key: string) => secureRemove(key),
};

/* ------------------------------------------------------------------ */
/*  One-time AsyncStorage → SecureStore migration                     */
/* ------------------------------------------------------------------ */

const MIGRATION_FLAG = '__supabase_secure_migrated';

/**
 * Call once at app startup (before Supabase restores its session).
 * Moves any auth data stored in plain AsyncStorage into SecureStore,
 * then deletes the AsyncStorage copies.
 */
export async function migrateToSecureStore(): Promise<void> {
  try {
    const alreadyMigrated = await SecureStore.getItemAsync(MIGRATION_FLAG);
    if (alreadyMigrated === '1') return;

    const keys = await AsyncStorage.getAllKeys();
    const authKeys = keys.filter(
      (k) => k.startsWith('sb-') || k.includes('supabase') || k.includes('pkce'),
    );

    if (authKeys.length > 0) {
      const entries = await AsyncStorage.multiGet(authKeys);
      for (const [key, value] of entries) {
        if (key && value) {
          await secureSet(key, value);
        }
      }
      await AsyncStorage.multiRemove(authKeys);
    }

    await SecureStore.setItemAsync(MIGRATION_FLAG, '1');
  } catch (err) {
    if (__DEV__) console.warn('[supabaseStorage] migration failed, will retry next launch:', err);
  }
}
