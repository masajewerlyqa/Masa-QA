import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { sendWelcomeEmail } from "@/lib/email/transactional";

/**
 * Sends the premium welcome email at most once per profile (welcome_email_sent_at).
 * Safe to call after email signup (session), OAuth callback, or email confirmation callback.
 */
export async function sendWelcomeEmailIfEligible(
  userId: string,
  email: string,
  fullNameFallback: string | null
): Promise<{ sent: boolean; skipped: boolean }> {
  const service = createServiceClient();
  const { data: row, error } = await service
    .from("profiles")
    .select("welcome_email_sent_at, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[welcome-email] profile read:", error.message);
  }

  if (row && "welcome_email_sent_at" in row && row.welcome_email_sent_at) {
    return { sent: false, skipped: true };
  }

  const fullName = fullNameFallback ?? (row as { full_name?: string | null })?.full_name ?? null;

  const sendResult = await sendWelcomeEmail(email, fullName);
  if (!sendResult.ok) {
    console.warn("[welcome-email] send failed (welcome_email_sent_at not updated):", sendResult.error);
    return { sent: false, skipped: false };
  }

  const { error: upErr } = await service
    .from("profiles")
    .update({
      welcome_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (upErr) {
    console.warn("[welcome-email] could not set welcome_email_sent_at (migration 030?):", upErr.message);
  }

  return { sent: true, skipped: false };
}
