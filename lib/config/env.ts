/**
 * Centralized environment expectations for MASA server and client.
 * Import from server code only unless using NEXT_PUBLIC_* (safe for client).
 */

function normalizeFromEmail(raw: string | undefined): string {
  if (!raw?.trim()) return "MASA <hello@mail.masajewelry.com>";
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Strip optional quotes; use `fallback` when unset (per-purpose From addresses). */
function normalizeFromEmailOr(raw: string | undefined, fallback: string): string {
  if (!raw?.trim()) return fallback;
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export const env = {
  /** Public site URL — auth redirects, email links, OG (transactional templates use this). */
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (typeof process.env.VERCEL_URL === "string"
      ? `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
      : "http://localhost:3000"),

  isProduction: process.env.NODE_ENV === "production",

  /** Resend API key — all app transactional mail uses the Resend HTTP API (no SMTP). */
  resendApiKey: process.env.RESEND_API_KEY?.trim() || null,

  /** Svix signing secret from Resend → Webhooks (for POST /api/webhooks/resend). */
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET?.trim() || null,

  /** Sender for Resend `from` (verified domain in Resend). */
  resendFromEmail: normalizeFromEmail(process.env.RESEND_FROM_EMAIL),

  /** Internal contact notification recipient (support inbox). Reply-To = visitor. */
  contactSupportEmail: (process.env.CONTACT_SUPPORT_EMAIL?.trim() || "support@masajewelry.com").toLowerCase(),

  /** From address for that internal contact email (appears as support@ in inbox). Must be verified in Resend. */
  contactInboxFromEmail: normalizeFromEmailOr(
    process.env.CONTACT_INBOX_FROM_EMAIL,
    "MASA <support@masajewelry.com>"
  ),

  /** From address for “we received your message” to the visitor only (noreply). Must be verified in Resend. */
  contactAckFromEmail: normalizeFromEmailOr(process.env.CONTACT_ACK_FROM_EMAIL, "MASA <noreply@masajewelry.com>"),

  /**
   * Extra CC addresses for contact notifications (comma-separated). Use a non-M365 inbox (e.g. Gmail) if
   * `support@…` delivery is delayed with SMTP 421 to Microsoft.
   */
  contactSupportCcEmails: (process.env.CONTACT_SUPPORT_CC ?? "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

  /**
   * When true, UI and future gates should treat phone verification as mandatory.
   * OTP flows are not implemented yet; this only drives messaging and future checks.
   */
  enforcePhoneVerification: process.env.NEXT_PUBLIC_ENFORCE_PHONE_VERIFICATION === "true",
} as const;
