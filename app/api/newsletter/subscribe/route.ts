import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { sendEmailWithRetry } from "@/lib/email/send-email";
import { newsletterSubscriptionConfirmationHtml } from "@/lib/email/templates";
import { createServiceClient } from "@/lib/supabase/service";
import { newsletterSubscribeBodySchema } from "@/lib/validations/newsletter";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = newsletterSubscribeBodySchema.safeParse(json);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg = f.email?.[0] || f.source?.[0] || "Please enter a valid email address.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const source = parsed.data.source?.trim() || null;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, source }, { onConflict: "email", ignoreDuplicates: false });

    if (error) {
      console.error("[newsletter] upsert failed", { message: error.message, code: error.code });
      return NextResponse.json(
        { ok: false, error: "We could not subscribe you right now. Please try again." },
        { status: 503 }
      );
    }

    const confirmationHtml = newsletterSubscriptionConfirmationHtml();
    const emailResult = await sendEmailWithRetry({
      from: env.contactAckFromEmail,
      to: email,
      subject: "You are subscribed — MASA Newsletter",
      html: confirmationHtml,
      tags: [{ name: "type", value: "newsletter_subscribe_confirmation" }],
    });

    if (!emailResult.ok) {
      console.error("[newsletter] confirmation email failed", { error: emailResult.error });
      return NextResponse.json(
        {
          ok: false,
          error:
            "You are subscribed, but we could not send your confirmation email right now. Please check again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter] unexpected error", {
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { ok: false, error: "We could not subscribe you right now. Please try again." },
      { status: 503 }
    );
  }
}
