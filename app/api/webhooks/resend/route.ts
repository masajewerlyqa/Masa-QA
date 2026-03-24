import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { env } from "@/lib/config/env";
import { maskEmailForLog } from "@/lib/email/send-email";

type ResendWebhookPayload = {
  type?: string;
  data?: {
    email_id?: string;
    subject?: string;
    to?: string[];
    from?: string;
    bounce?: {
      type?: string;
      subType?: string;
      message?: string;
    };
    [key: string]: unknown;
  };
};

/**
 * POST /api/webhooks/resend — Resend (Svix) webhooks for delivery outcomes.
 * Configure in Resend: Webhooks → URL = `${NEXT_PUBLIC_SITE_URL}/api/webhooks/resend`
 * Events: at least `email.bounced`, optionally `email.delivery_delayed`, `email.delivered`.
 *
 * Logs safe summaries (masked addresses). Set RESEND_WEBHOOK_SECRET from the webhook in Resend.
 */
export async function POST(req: Request) {
  const secret = env.resendWebhookSecret;
  if (!secret) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await req.text();

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  let evt: ResendWebhookPayload;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendWebhookPayload;
  } catch (e) {
    console.error("[resend-webhook] signature verification failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const type = evt.type ?? "unknown";
  const data = evt.data ?? {};

  if (type === "email.bounced") {
    const bounce = data.bounce;
    const to = data.to;
    console.error("[resend-webhook] email.bounced", {
      emailId: data.email_id,
      subject: data.subject,
      to: Array.isArray(to) ? to.map((t) => maskEmailForLog(t)) : undefined,
      bounceType: bounce?.type,
      bounceSubType: bounce?.subType,
      bounceMessage: bounce?.message,
    });
  } else if (type === "email.delivery_delayed") {
    const to = data.to;
    console.warn("[resend-webhook] email.delivery_delayed", {
      emailId: data.email_id,
      subject: data.subject,
      to: Array.isArray(to) ? to.map((t) => maskEmailForLog(t)) : undefined,
    });
  } else if (type === "email.delivered") {
    const to = data.to;
    console.info("[resend-webhook] email.delivered", {
      emailId: data.email_id,
      to: Array.isArray(to) ? to.map((t) => maskEmailForLog(t)) : undefined,
    });
  } else {
    console.info("[resend-webhook]", type, { emailId: data.email_id });
  }

  return NextResponse.json({ received: true });
}
