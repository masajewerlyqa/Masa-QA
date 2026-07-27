import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/request-user";
import { handleCreateCheckoutSession } from "@/lib/stripe/create-checkout-session";
import { stripeCheckoutBodySchema } from "@/lib/validations/stripe-checkout";
import { checkRateLimit, getRateLimitKey, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/create-checkout-session — authenticated; prices validated server-side from DB.
 */
export async function POST(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in to checkout." }, { status: 401 });
  }

  const rl = checkRateLimit(`checkout:${getRateLimitKey(req)}`, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
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

  if (parsed.data.customerId && parsed.data.customerId !== user.id) {
    return NextResponse.json({ ok: false, error: "Invalid checkout session." }, { status: 403 });
  }

  return handleCreateCheckoutSession({
    ...parsed.data,
    customerId: user.id,
  });
}
