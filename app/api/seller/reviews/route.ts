import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { updateReviewStatus } from "@/app/seller/reviews/actions";

/** Seller product-review moderation writes for the mobile app. */
export const dynamic = "force-dynamic";

type Body = { reviewId: string; status: "approved" | "rejected" };

export async function POST(request: Request) {
  const auth = await requireRole(request, ["seller"]);
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!body.reviewId || (body.status !== "approved" && body.status !== "rejected")) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await updateReviewStatus(body.reviewId, body.status, {
      actingUserId: auth.user.id,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[api/seller/reviews] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
