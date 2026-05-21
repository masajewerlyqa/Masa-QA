import { NextResponse } from "next/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { handleCreateCheckoutSession } from "@/lib/stripe/create-checkout-session";
import { stripeCheckoutBodySchema } from "@/lib/validations/stripe-checkout";

export const runtime = "nodejs";

/** @deprecated Prefer POST /api/create-checkout-session */
export async function POST(req: Request) {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in to checkout." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = stripeCheckoutBodySchema.safeParse(json);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg =
      f.items?.[0] ||
      parsed.error.issues[0]?.message ||
      "Please check your cart items.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  return handleCreateCheckoutSession({
    ...parsed.data,
    customerId: user.id,
  });
}
