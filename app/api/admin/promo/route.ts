import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-role";
import { createPromoCode, deletePromoCode, updatePromoActive } from "@/app/admin/promo/actions";

/**
 * Admin promo-code create/update/delete for the mobile app. Listing goes
 * through /api/admin/overview (section: "promo") instead, so there is one
 * read path, not two.
 *
 * `createPromoCode` takes `FormData` because the web form posts one directly;
 * rather than reimplement its validation (code format, percentage/fixed
 * bounds, usage limit), this route builds an equivalent FormData from the
 * JSON body and calls the same action.
 */
export const dynamic = "force-dynamic";

type CreatePayload = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  store_id?: string | null;
  min_order_amount?: number;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  active?: boolean;
};

type Body =
  | { action: "create"; payload: CreatePayload }
  | { action: "updateActive"; promoId: string; active: boolean }
  | { action: "delete"; promoId: string };

function toFormData(payload: CreatePayload): FormData {
  const fd = new FormData();
  fd.set("code", payload.code);
  fd.set("type", payload.type);
  fd.set("value", String(payload.value));
  if (payload.store_id) fd.set("store_id", payload.store_id);
  if (payload.min_order_amount != null) fd.set("min_order_amount", String(payload.min_order_amount));
  if (payload.usage_limit != null) fd.set("usage_limit", String(payload.usage_limit));
  if (payload.starts_at) fd.set("starts_at", payload.starts_at);
  if (payload.expires_at) fd.set("expires_at", payload.expires_at);
  if (payload.active) fd.set("active", "true");
  return fd;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
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
      case "create":
        return NextResponse.json(await createPromoCode(toFormData(body.payload), options));
      case "updateActive":
        return NextResponse.json(await updatePromoActive(body.promoId, body.active, options));
      case "delete":
        return NextResponse.json(await deletePromoCode(body.promoId, options));
      default:
        return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    console.error("[api/admin/promo] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
