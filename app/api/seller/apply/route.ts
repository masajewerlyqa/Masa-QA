import { NextResponse } from "next/server";
import { finalizeSellerApplicationAction } from "@/app/(site)/apply/actions";
import { getUserFromRequest } from "@/lib/auth/request-user";

/**
 * Seller application submission for the mobile app.
 *
 * A thin shim over the same action the web form calls. Mobile previously wrote
 * to seller_applications directly, which meant it set status 'pending' and
 * skipped the payment reference, amount snapshot and instructions email
 * entirely -- a mobile applicant could never reach the payment step. Routing
 * both clients through one action keeps that from drifting again.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in to continue" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // The action resolves the session itself, so it applies to the caller only.
  const result = await finalizeSellerApplicationAction(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, code: result.code },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, planId: result.planId });
}
