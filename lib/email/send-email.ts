import "server-only";

import { env } from "@/lib/config/env";

/** HTTP statuses worth retrying for Resend. */
const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504]);

/** Redact recipient for logs (PII-safe). */
export function maskEmailForLog(to: string): string {
  const at = to.indexOf("@");
  if (at < 1) return "[invalid]";
  const local = to.slice(0, at);
  const domain = to.slice(at + 1);
  const safeLocal = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${safeLocal}@${domain}`;
}

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Overrides `RESEND_FROM_EMAIL` for this send (address must be verified in Resend). */
  from?: string;
  /** When set, Resend sets Reply-To so replies go to this address (e.g. contact form user email). */
  replyTo?: string;
  /** Additional recipients (e.g. Gmail backup when Microsoft 365 delays the primary To). */
  cc?: string[];
  tags?: { name: string; value: string }[];
};

export type SendEmailResult =
  | { ok: true; resendId?: string }
  | { ok: false; error: string; retryable?: boolean };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Minimal HTML → plain text for clients without HTML support. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Single attempt — use sendEmailWithRetry from transactional paths.
 * Uses Resend HTTPS API only (no SMTP).
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = env.resendApiKey;
  const from = params.from ?? env.resendFromEmail;
  const textBody = params.text ?? htmlToPlainText(params.html);

  if (!apiKey) {
    console.warn("[email] skipped — RESEND_API_KEY not set", {
      subject: params.subject,
      to: maskEmailForLog(params.to),
    });
    return { ok: false, error: "RESEND_API_KEY not configured", retryable: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        ...(params.cc?.length ? { cc: params.cc } : {}),
        subject: params.subject,
        html: params.html,
        text: textBody,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        tags: params.tags,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      const msg = typeof body?.message === "string" ? body.message : res.statusText;
      const retryable = RETRYABLE.has(res.status);
      console.error("[email] Resend request failed", {
        subject: params.subject,
        to: maskEmailForLog(params.to),
        ...(params.replyTo ? { replyTo: maskEmailForLog(params.replyTo) } : {}),
        status: res.status,
        message: msg,
      });
      return { ok: false, error: msg, retryable };
    }

    const resendId = typeof body.id === "string" ? body.id : undefined;
    console.info("[email] Resend accepted", {
      subject: params.subject,
      to: maskEmailForLog(params.to),
      ...(params.cc?.length ? { cc: params.cc.map((a) => maskEmailForLog(a)) } : {}),
      resendId,
      ...(params.replyTo ? { replyTo: maskEmailForLog(params.replyTo) } : {}),
    });
    return { ok: true, resendId };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "send failed";
    console.error("[email] network or unexpected error", {
      subject: params.subject,
      to: maskEmailForLog(params.to),
      ...(params.replyTo ? { replyTo: maskEmailForLog(params.replyTo) } : {}),
      message: msg,
    });
    return { ok: false, error: msg, retryable: true };
  }
}

/**
 * Retries transient Resend / network failures (small backoff).
 * Idempotent templates should be used at call sites for business-critical sends.
 */
export async function sendEmailWithRetry(params: SendEmailParams, attempts = 3): Promise<SendEmailResult> {
  let last: SendEmailResult = { ok: false, error: "unknown" };

  for (let i = 0; i < attempts; i++) {
    last = await sendEmail(params);
    if (last.ok) return last;

    const canRetry = last.retryable !== false && i < attempts - 1;
    if (canRetry) {
      const delay = 400 * Math.pow(2, i);
      console.warn(`[email] retry ${i + 1}/${attempts - 1} in ${delay}ms —`, last.error);
      await sleep(delay);
    } else {
      break;
    }
  }

  console.error("[email] exhausted retries", {
    subject: params.subject,
    to: maskEmailForLog(params.to),
    ...(params.replyTo ? { replyTo: maskEmailForLog(params.replyTo) } : {}),
    lastError: last.error,
  });
  return last;
}
