import { sitePostJsonAuthed } from '../api/siteApi';

/**
 * Permanent account deletion (Google Play requirement).
 *
 * Calls the same `/api/account/delete` route the website uses. The route
 * derives the account to delete from the verified Bearer token, so no user id
 * is sent from here -- there is nothing in this request a tampered client could
 * change to delete a different account. Deleting `auth.users` needs the service
 * role, which must never ship in the app bundle, so this cannot be done with a
 * direct Supabase call.
 */
export async function deleteOwnAccount(): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = await sitePostJsonAuthed<{ ok: boolean; error?: string }>(
    '/api/account/delete',
    {},
  );

  if (!result.ok) return { ok: false, error: result.error };
  if (!result.data?.ok) {
    return { ok: false, error: result.data?.error ?? 'Something went wrong. Please try again.' };
  }
  return { ok: true };
}
