"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import {
  getNotifications,
  markNotificationRead as markRead,
  markAllNotificationsRead as markAllRead,
} from "@/lib/notifications";
import { NOTIFICATIONS_PAGE_SIZE } from "./constants";

export async function markNotificationReadAction(notificationId: string): Promise<boolean> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return false;
  const ok = await markRead(notificationId, user.id);
  if (ok) {
    revalidatePath("/notifications");
    revalidatePath("/");
    revalidatePath("/", "layout");
  }
  return ok;
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return;
  await markAllRead(user.id);
  revalidatePath("/notifications");
  revalidatePath("/");
  revalidatePath("/", "layout");
}

/** Next page for infinite-style loading (newest-first). */
export async function loadNotificationsPageAction(offset: number): Promise<{
  items: Awaited<ReturnType<typeof getNotifications>>;
  nextOffset: number;
  hasMore: boolean;
}> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { items: [], nextOffset: offset, hasMore: false };

  const items = await getNotifications(user.id, NOTIFICATIONS_PAGE_SIZE, offset);
  const hasMore = items.length === NOTIFICATIONS_PAGE_SIZE;
  return { items, nextOffset: offset + items.length, hasMore };
}
