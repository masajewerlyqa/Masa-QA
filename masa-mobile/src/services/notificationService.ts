import { getSupabase } from '../api/client';

/**
 * Real notifications, mirroring the web query in lib/notifications.ts.
 *
 * The screen previously rendered a hardcoded array with invented order numbers
 * and offers, so users were shown fabricated activity.
 *
 * User isolation is enforced by RLS, not by this file: the `notifications`
 * table allows SELECT and UPDATE only `USING (auth.uid() = user_id)`. The
 * `.eq('user_id', ...)` below is a query filter for correctness and paging, not
 * the security boundary -- a tampered client still cannot read another user's
 * rows. The mobile app uses the anon key only; no service role is involved.
 */

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResult =
  | { ok: true; notifications: NotificationRow[] }
  | { ok: false; error: string };

const PAGE_SIZE = 50;

export async function getNotifications(): Promise<NotificationsResult> {
  const supabase = getSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'Sign in to view your notifications.' };

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, data, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  // Surfaced rather than swallowed: a failed load must not look like "no
  // notifications", which is what the mock array effectively did.
  if (error) {
    console.error('[notifications] load failed:', error.message);
    return { ok: false, error: 'Could not load your notifications. Please try again.' };
  }

  return {
    ok: true,
    notifications: (data ?? []).map((r) => ({
      id: r.id as string,
      type: r.type as string,
      title: r.title as string,
      body: (r.body as string | null) ?? null,
      data: (r.data as Record<string, unknown> | null) ?? null,
      read_at: (r.read_at as string | null) ?? null,
      created_at: r.created_at as string,
    })),
  };
}

/**
 * Unread count for the top-bar badge. Uses a head-only count so the rows are
 * never transferred just to size a badge.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = getSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    console.error('[notifications] unread count failed:', error.message);
    return 0;
  }
  return count ?? 0;
}

/**
 * Live updates for the signed-in user's notifications.
 *
 * The filter pins the stream to this user's rows, and RLS on the table is the
 * real boundary behind it -- a tampered filter still cannot deliver another
 * user's rows. Returns an unsubscribe function; callers must invoke it on
 * unmount and on logout so the socket does not outlive the session.
 *
 * Requires `notifications` to be in the `supabase_realtime` publication. If it
 * is not, this simply never fires and the screen still works via pull-to-refresh.
 */
export async function subscribeToNotifications(onChange: () => void): Promise<() => void> {
  const supabase = getSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return () => undefined;

  const channel = supabase
    .channel(`notifications:${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT for new, UPDATE for read_at changes
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Marks one notification read. RLS already restricts the update to the
 * caller's rows; user_id is filtered explicitly too so this stays correct even
 * if RLS is ever relaxed or bypassed by a future change, matching the web path
 * in lib/notifications.ts.
 */
export async function markNotificationRead(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    console.error('[notifications] mark read failed:', error.message);
    return false;
  }
  return true;
}

/** Marks every unread notification read for the signed-in user. */
export async function markAllNotificationsRead(): Promise<boolean> {
  const supabase = getSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) {
    console.error('[notifications] mark all read failed:', error.message);
    return false;
  }
  return true;
}
