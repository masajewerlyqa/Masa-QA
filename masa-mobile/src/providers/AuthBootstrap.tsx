import type { PropsWithChildren } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getSupabaseInitError, isSupabaseConfigured } from '../api/client';
import { theme } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

/** Blocks UI until persisted Supabase session is restored (prevents flash of logged-out state). */
export function AuthBootstrap({ children }: PropsWithChildren): React.JSX.Element {
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!isSupabaseConfigured()) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Configuration required</Text>
        <Text style={styles.errorBody}>{getSupabaseInitError()}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorBody: {
    color: theme.colors.masaGray,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
