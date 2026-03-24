import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { sendWelcomeEmailIfEligible } from "@/lib/auth/welcome-email";

/**
 * POST /api/auth/welcome — idempotent welcome email (once per account).
 * Requires authenticated session.
 */
export async function POST() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const result = await sendWelcomeEmailIfEligible(user.id, user.email, profile?.full_name ?? null);
  return NextResponse.json({ ok: true, ...result });
}
