import { create } from 'zustand';

import {
  getUnreadNotificationCount,
  subscribeToNotifications,
} from '../services/notificationService';

/**
 * Shared unread count.
 *
 * Single source of truth so the top-bar bell and the Notifications screen never
 * disagree: marking one read updates both. The count always comes from the
 * database (`read_at IS NULL`) and is never derived from local guesses.
 */
type NotificationState = {
  unreadCount: number;
  /** Set while a realtime channel is open, so we never open a second one. */
  isSubscribed: boolean;
  refresh: () => Promise<void>;
  /** Clears on logout so a signed-out user never sees the previous user's count. */
  reset: () => void;
  /** Opens the realtime channel; returns the cleanup function. */
  start: () => Promise<() => void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  isSubscribed: false,

  reset: () => set({ unreadCount: 0 }),

  refresh: async () => {
    const count = await getUnreadNotificationCount();
    set({ unreadCount: count });
  },

  start: async () => {
    await get().refresh();

    if (get().isSubscribed) return () => undefined;
    set({ isSubscribed: true });

    // Covers both a new notification arriving and one being marked read.
    const unsubscribe = await subscribeToNotifications(() => {
      void get().refresh();
    });

    return () => {
      unsubscribe();
      set({ isSubscribed: false });
    };
  },
}));
