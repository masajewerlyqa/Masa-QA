import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MobileFooter } from '../components/MobileFooter';
import { MobileTopBar } from '../components/MobileTopBar';
import { MasaCard } from '../components/MasaCard';
import { PageContainer } from '../components/PageContainer';
import { SectionHeader } from '../components/SectionHeader';
import { theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  type NotificationRow,
} from '../services/notificationService';
import { useNotificationStore } from '../stores/notificationStore';

/** Locale-aware date, so Arabic users do not get an English timestamp. */
function formatWhen(iso: string, isArabic: boolean): string {
  try {
    return new Date(iso).toLocaleString(isArabic ? 'ar' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

export function NotificationsScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshUnread = useNotificationStore((s) => s.refresh);

  const load = useCallback(async () => {
    const result = await getNotifications();
    if (result.ok) {
      setItems(result.notifications);
      setError(null);
    } else {
      // Distinct from "no notifications" -- a failure must never render as empty.
      setError(result.error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await load();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [load]);

  // Live refresh while the screen is open. Cleaned up on unmount so the channel
  // never outlives the screen or a logout.
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      const stop = await subscribeToNotifications(() => {
        void load();
      });
      if (cancelled) stop();
      else unsubscribe = stop;
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const unreadCount = items.filter((n) => !n.read_at).length;

  const handleMarkRead = useCallback(async (id: string) => {
    // Optimistic: the row is already visible and the write is RLS-scoped.
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? now } : n)));
    const ok = await markNotificationRead(id);
    if (!ok) setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: null } : n)));
    // Keeps the top-bar bell in step with this screen.
    void refreshUnread();
  }, [refreshUnread]);

  const handleMarkAllRead = useCallback(async () => {
    const ok = await markAllNotificationsRead();
    if (ok) {
      const now = new Date().toISOString();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
      void refreshUnread();
    }
  }, [refreshUnread]);

  return (
    <PageContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[theme.colors.primary]}
            onRefresh={() => void onRefresh()}
            refreshing={refreshing}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <MobileTopBar />
        <SectionHeader
          subtitle={t('account.notifications.recentHint')}
          title={t('account.notifications.title')}
        />

        {unreadCount > 0 ? (
          <Pressable onPress={() => void handleMarkAllRead()} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>
              {t('account.notifications.markAllRead')} ({unreadCount})
            </Text>
          </Pressable>
        ) : null}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={[textStyle(isArabic, 'body'), styles.stateText]}>
              {t('account.notifications.loading')}
            </Text>
          </View>
        ) : error ? (
          <MasaCard style={styles.card}>
            <View style={styles.row}>
              <Ionicons color={theme.colors.primary} name="alert-circle-outline" size={18} />
              <View style={styles.textBlock}>
                <Text style={[textStyle(isArabic, 'body'), styles.title]}>{error}</Text>
              </View>
            </View>
          </MasaCard>
        ) : items.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons
              color={theme.colors.masaGray}
              name="notifications-off-outline"
              size={32}
            />
            <Text style={[textStyle(isArabic, 'body'), styles.stateText]}>
              {t('account.notifications.noneYet')}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <MasaCard key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Ionicons
                  color={item.read_at ? theme.colors.masaGray : theme.colors.primary}
                  name={item.read_at ? 'notifications-outline' : 'notifications'}
                  size={18}
                />
                <View style={styles.textBlock}>
                  <Text style={[textStyle(isArabic, 'cardTitle'), styles.title]}>{item.title}</Text>
                  {item.body ? (
                    <Text style={[textStyle(isArabic, 'body'), styles.subtitle]}>{item.body}</Text>
                  ) : null}
                  <Text style={[textStyle(isArabic, 'caption'), styles.when]}>
                    {formatWhen(item.created_at, isArabic)}
                  </Text>
                  {!item.read_at ? (
                    <Pressable onPress={() => void handleMarkRead(item.id)}>
                      <Text style={styles.markReadText}>{t('account.notifications.markRead')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </MasaCard>
          ))
        )}

        <MobileFooter />
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  content: {
    paddingTop: theme.spacing.xs,
  },
  markAllBtn: {
    alignSelf: 'flex-start',
    borderColor: theme.colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  markAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
  },
  markReadText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    marginTop: 6,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  stateBox: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  stateText: {
    color: theme.colors.masaGray,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.masaGray,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: theme.colors.foreground,
    fontWeight: '600',
  },
  when: {
    color: theme.colors.masaGray,
    marginTop: 4,
  },
});
