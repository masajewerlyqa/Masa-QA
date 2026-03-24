import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getContactSubjectLabel } from "@/lib/contact/subjects";
import { maskEmailForLog, sendEmailWithRetry } from "@/lib/email/send-email";
import { contactSupportNotificationHtml, contactUserAcknowledgmentHtml } from "@/lib/email/templates";
import { contactFormBodySchema } from "@/lib/validations/contact";

/**
 * POST /api/contact — (1) From support@ → internal inbox (Reply-To = visitor),
 * (2) From noreply@ → acknowledgment to visitor only. Never use visitor as From.
 */
export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    console.error("[contact] invalid JSON body");
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactFormBodySchema.safeParse(json);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg =
      f.fullName?.[0] ||
      f.email?.[0] ||
      f.phone?.[0] ||
      f.subject?.[0] ||
      f.message?.[0] ||
      "Please check your details.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const d = parsed.data;
  const phone = d.phone?.trim() ? d.phone.trim() : null;
  const subjectLabel = getContactSubjectLabel(d.subject);

  const supportHtml = contactSupportNotificationHtml({
    fullName: d.fullName,
    email: d.email,
    phone,
    subjectLabel,
    message: d.message,
  });

  const inboxSubject = `[MASA Contact] ${subjectLabel}`;

  const supportResult = await sendEmailWithRetry({
    from: env.contactInboxFromEmail,
    to: env.contactSupportEmail,
    ...(env.contactSupportCcEmails.length > 0 ? { cc: env.contactSupportCcEmails } : {}),
    subject: inboxSubject,
    html: supportHtml,
    replyTo: d.email.trim(),
    tags: [{ name: "type", value: "contact_inquiry" }],
  });

  if (!supportResult.ok) {
    console.error("[contact] delivery failed", {
      flow: "contact_inquiry",
      error: supportResult.error,
      inbox: maskEmailForLog(env.contactSupportEmail),
      replyTo: maskEmailForLog(d.email.trim()),
      subject: inboxSubject,
    });
    return NextResponse.json(
      { ok: false, error: "We couldn’t send your message. Please try again in a moment." },
      { status: 503 }
    );
  }

  const userHtml = contactUserAcknowledgmentHtml(d.fullName);

  const userResult = await sendEmailWithRetry({
    from: env.contactAckFromEmail,
    to: d.email.trim(),
    subject: "We received your message — MASA",
    html: userHtml,
    tags: [{ name: "type", value: "contact_ack" }],
  });

  if (!userResult.ok) {
    console.error("[contact] user acknowledgment failed after inbox delivery", {
      flow: "contact_ack",
      error: userResult.error,
      to: maskEmailForLog(d.email.trim()),
    });
    return NextResponse.json(
      {
        ok: false,
        error:
          "Your message was received by our team, but we couldn’t send a confirmation email. If you need a confirmation, contact us again or check your spam folder.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
