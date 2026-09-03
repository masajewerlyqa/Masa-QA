import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { updateSellerStorePolicy, type StorePolicyFormPayload } from "@/app/seller/policies/actions";

/** Seller store policy (returns/exchanges/same-day) writes for the mobile app. */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireRole(request, ["seller"]);
  if (!auth.ok) return auth.response;

  let payload: StorePolicyFormPayload;
  try {
    payload = (await request.json()) as StorePolicyFormPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await updateSellerStorePolicy(payload, { actingUserId: auth.user.id });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[api/seller/policies] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
