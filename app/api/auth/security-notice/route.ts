import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { sendPasswordChangedNotice } from "@/lib/email/transactional";
import { resolveEmailLanguage } from "@/lib/email/email-language";

/**
 * POST body: { kind: "password_changed" } — sends security email when password is updated.
 * Trust boundary: requires valid Supabase session (same as other /api/auth/* routes).
 */
export async function POST(request: Request) {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { kind?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* ignore */
  }

  if (body.kind === "password_changed") {
    const mailResult = await sendPasswordChangedNotice(
      user.email,
      resolveEmailLanguage(profile?.preferred_language)
    );
    if (!mailResult.ok) {
      console.warn("[security-notice] password changed email failed:", mailResult.error);
    }
  }

  return NextResponse.json({ ok: true });
}
