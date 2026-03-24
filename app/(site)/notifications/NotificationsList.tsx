"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  loadNotificationsPageAction,
} from "./actions";
import { NOTIFICATIONS_PAGE_SIZE } from "./constants";
import { useDebouncedRefresh } from "@/lib/hooks/useDebouncedRefresh";
import type { NotificationRow } from "@/lib/notifications";
import { useI18n } from "@/components/useI18n";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Link for notification type (e.g. order -> order detail). Order may have changed — page still resolves safely. */
function notificationLink(n: NotificationRow): string | null {
  if (
    (n.type === "order_status_updated" || n.type === "order_placed") &&
    n.data?.orderId &&
    typeof n.data.orderId === "string"
  ) {
    return `/account/orders/${n.data.orderId}`;
  }
  if (n.type === "new_order" && n.data?.orderId && typeof n.data.orderId === "string") {
    return `/seller/orders/${n.data.orderId}`;
  }
  if (n.type === "new_seller_application") {
    return "/admin/seller-applications";
  }
  if (n.type === "seller_application_approved") {
    return "/seller";
  }
  return null;
}

export function NotificationsList({ initialNotifications }: { initialNotifications: NotificationRow[] }) {
  const { isArabic, t } = useI18n();
  const [items, setItems] = useState(initialNotifications);
  const [offset, setOffset] = useState(initialNotifications.length);
  const [hasMore, setHasMore] = useState(initialNotifications.length >= NOTIFICATIONS_PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedRefresh = useDebouncedRefresh(350);

  const unreadCount = items.filter((n) => !n.read_at).length;

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      debouncedRefresh();
    });
  }

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n))
      );
      debouncedRefresh();
    });
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const { items: next, nextOffset, hasMore: more } = await loadNotificationsPageAction(offset);
      setItems((prev) => [...prev, ...next]);
      setOffset(nextOffset);
      setHasMore(more);
    } finally {
      setLoadingMore(false);
    }
  }

  if (items.length === 0 && !loadingMore) {
    return (
      <Card className="border-primary/10 shadow-sm">
        <CardContent className="py-12 text-center text-masa-gray font-sans">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t("account.notifications.noneYet")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="font-sans"
          >
            <CheckCheck className={`w-4 h-4 ${isArabic ? "ml-2" : "mr-2"}`} />
            {t("account.notifications.markAllRead")}
          </Button>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((n) => {
          const href = notificationLink(n);
          const isUnread = !n.read_at;
          const textBlock = (
            <div className="flex-1 min-w-0">
              <p className={`font-sans font-medium ${isUnread ? "text-masa-dark" : "text-masa-gray"}`}>
                {n.title}
              </p>
              {n.body && <p className="text-sm text-masa-gray font-sans mt-0.5">{n.body}</p>}
              <p className="text-xs text-masa-gray font-sans mt-2">{formatDate(n.created_at)}</p>
            </div>
          );

          return (
            <li key={n.id}>
              <Card className={`border-primary/10 shadow-sm transition-colors ${isUnread ? "bg-masa-light/50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {isUnread && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" aria-hidden />
                    )}
                    {href ? (
                      <Link href={href} className="flex-1 min-w-0 hover:opacity-90" prefetch={false}>
                        {textBlock}
                      </Link>
                    ) : (
                      textBlock
                    )}
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-masa-gray"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkRead(n.id);
                        }}
                        disabled={isPending}
                      >
                        {t("account.notifications.markRead")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-sans border-primary/20"
            onClick={() => loadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className={`w-4 h-4 animate-spin ${isArabic ? "ml-2" : "mr-2"}`} />
                {t("account.notifications.loading")}
              </>
            ) : (
              t("account.notifications.loadOlder")
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
