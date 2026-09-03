import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { saveStoreAvailabilityAction } from "@/app/seller/availability/actions";

/**
 * Seller availability (working days/hours) writes for the mobile app.
 *
 * The body is passed through unvalidated to `saveStoreAvailabilityAction`,
 * which parses it with `storeHoursFormSchema` itself -- duplicating that
 * validation here would be exactly the kind of drift the actingUserId bypass
 * is meant to avoid.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireRole(request, ["seller"]);
  if (!auth.ok) return auth.response;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await saveStoreAvailabilityAction(raw, { actingUserId: auth.user.id });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[api/seller/availability] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
