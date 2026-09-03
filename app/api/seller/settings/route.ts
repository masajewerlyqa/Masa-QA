import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import {
  requestSellerPlanUpgradeAction,
  updateStoreSettings,
  type StoreSettingsPayload,
} from "@/app/seller/settings/actions";

/** Seller store settings writes for the mobile app. */
export const dynamic = "force-dynamic";

type Body =
  | { action: "update"; payload: StoreSettingsPayload }
  | { action: "requestUpgrade" };

export async function POST(request: Request) {
  const auth = await requireRole(request, ["seller"]);
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const options = { actingUserId: auth.user.id };

  try {
    switch (body.action) {
      case "update":
        return NextResponse.json(await updateStoreSettings(body.payload, options));
      case "requestUpgrade":
        return NextResponse.json(await requestSellerPlanUpgradeAction(options));
      default:
        return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    console.error("[api/seller/settings] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
