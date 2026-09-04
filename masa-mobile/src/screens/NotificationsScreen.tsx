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
import { Bell, CheckCheck } from 'lucide-react-native';

import { MobileFooter } from '../components/MobileFooter';
import { MobileTopBar } from '../components/MobileTopBar';
import { MasaCard } from '../components/MasaCard';
import { PageContainer } from '../components/PageContainer';
import { fontFamily, theme } from '../constants/theme';
import { textStyle } from '../constants/typography';
import { useSettings } from '../context/SettingsContext';
import { goAdminDashboard, goOrderDetail, goSellerDashboard, goSellerOrderDetail } from '../navigation/routes';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  NOTIFICATIONS_PAGE_SIZE,
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

/** Mirrors web `notificationLink` (app/(site)/notifications/NotificationsList.tsx). */
function goToNotificationTarget(n: NotificationRow): void {
  const orderId = typeof n.data?.orderId === 'string' ? n.data.orderId : null;
  if ((n.type === 'order_status_updated' || n.type === 'order_placed') && orderId) {
    goOrderDetail(orderId);
    return;
  }
  if (n.type === 'new_order' && orderId) {
    goSellerOrderDetail(orderId);
    return;
  }
  if (n.type === 'new_seller_application') {
    // Mobile has no standalone application-list screen (web's /admin/seller-applications);
    // the dashboard's recent-applications list is the closest equivalent.
    goAdminDashboard();
    return;
  }
  if (n.type === 'seller_application_approved') {
    goSellerDashboard();
  }
}

function hasNotificationTarget(n: NotificationRow): boolean {
  const orderId = typeof n.data?.orderId === 'string' ? n.data.orderId : null;
  return (
    ((n.type === 'order_status_updated' || n.type === 'order_placed' || n.type === 'new_order') &&
      Boolean(orderId)) ||
    n.type === 'new_seller_application' ||
    n.type === 'seller_application_approved'
  );
}

export function NotificationsScreen(): React.JSX.Element {
  const { t, isArabic } = useSettings();
  const luxury = fontFamily(isArabic, 'luxury');
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshUnread = useNotificationStore((s) => s.refresh);

  const load = useCallback(async () => {
    const result = await getNotifications();
    if (result.ok) {
      setItems(result.notifications);
      setHasMore(result.notifications.length >= NOTIFICATIONS_PAGE_SIZE);
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

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const result = await getNotifications(NOTIFICATIONS_PAGE_SIZE, items.length);
    if (result.ok) {
      setItems((prev) => [...prev, ...result.notifications]);
      setHasMore(result.notifications.length >= NOTIFICATIONS_PAGE_SIZE);
    }
    setLoadingMore(false);
  }, [items.length]);

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

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: luxury }]}>
            {t('account.notifications.title')}
          </Text>
          <Text style={[textStyle(isArabic, 'body'), styles.headerSubtitle]}>
            {!loading && items.length === 0
              ? t('account.notifications.noneYet')
              : t('account.notifications.recentHint')}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <Pressable onPress={() => void handleMarkAllRead()} style={styles.markAllBtn}>
            <CheckCheck color={theme.colors.primary} size={16} />
            <Text style={styles.markAllText}>{t('account.notifications.markAllRead')}</Text>
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
            <Text style={[textStyle(isArabic, 'body'), styles.errorText]}>{error}</Text>
          </MasaCard>
        ) : items.length === 0 ? (
          <MasaCard style={styles.emptyCard}>
            <Bell color={theme.colors.masaGray} size={44} strokeWidth={1.5} style={styles.emptyIcon} />
            <Text style={[textStyle(isArabic, 'body'), styles.stateText]}>
              {t('account.notifications.noneYet')}
            </Text>
          </MasaCard>
        ) : (
          <>
            {items.map((item) => {
              const isUnread = !item.read_at;
              const canNavigate = hasNotificationTarget(item);
              return (
                <MasaCard
                  key={item.id}
                  style={isUnread ? { ...styles.card, ...styles.cardUnread } : styles.card}
                >
                  <Pressable
                    disabled={!canNavigate}
                    onPress={() => goToNotificationTarget(item)}
                    style={styles.row}
                  >
                    {isUnread ? <View style={styles.unreadDot} /> : <View style={styles.dotSpacer} />}
                    <View style={styles.textBlock}>
                      <Text
                        style={[
                          textStyle(isArabic, 'bodySm'),
                          isUnread ? styles.titleUnread : styles.titleRead,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {item.body ? (
                        <Text style={[textStyle(isArabic, 'caption'), styles.subtitle]}>{item.body}</Text>
                      ) : null}
                      <Text style={[textStyle(isArabic, 'caption'), styles.when]}>
                        {formatWhen(item.created_at, isArabic)}
                      </Text>
                    </View>
                    {isUnread ? (
                      <Pressable
                        hitSlop={8}
                        onPress={(e) => {
                          e.stopPropagation();
                          void handleMarkRead(item.id);
                        }}
                      >
                        <Text style={styles.markReadText}>{t('account.notifications.markRead')}</Text>
                      </Pressable>
                    ) : null}
                  </Pressable>
                </MasaCard>
              );
            })}

            {hasMore ? (
              <Pressable
                disabled={loadingMore}
                onPress={() => void loadMore()}
                style={styles.loadMoreBtn}
              >
                {loadingMore ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  <Text style={styles.loadMoreText}>{t('account.notifications.loadOlder')}</Text>
                )}
              </Pressable>
            ) : null}
          </>
        )}

        <MobileFooter />
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
  },
  cardUnread: {
    backgroundColor: theme.colors.masaLight,
  },
  content: {
    paddingTop: theme.spacing.xs,
  },
  dotSpacer: { width: 8 },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
    opacity: 0.5,
  },
  errorText: {
    color: theme.colors.foreground,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerSubtitle: {
    color: theme.colors.masaGray,
    marginTop: 4,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: 28,
  },
  loadMoreBtn: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
  },
  markAllBtn: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderColor: theme.colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
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
    color: theme.colors.masaGray,
    fontSize: theme.typography.sizes.caption,
    fontWeight: '600',
    marginLeft: 8,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
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
  titleRead: {
    color: theme.colors.masaGray,
    fontWeight: '500',
  },
  titleUnread: {
    color: theme.colors.masaDark,
    fontWeight: '600',
  },
  unreadDot: {
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  when: {
    color: theme.colors.masaGray,
    marginTop: 6,
  },
});
