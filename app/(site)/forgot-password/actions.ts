"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/email/config";

export type ForgotPasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Sends Supabase password reset email (configure template in Supabase dashboard).
 */
export async function requestPasswordReset(email: string): Promise<ForgotPasswordResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, error: "Enter a valid email address" };
  }

  const supabase = await createClient();
  const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
    redirectTo,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
