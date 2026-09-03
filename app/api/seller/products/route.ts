import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { getSellerProductById, getSellerStore } from "@/lib/seller";
import {
  applyProductDiscount,
  createProduct,
  removeProductDiscount,
  softDeleteProduct,
  updateProduct,
  type DiscountPayload,
} from "@/app/seller/products/actions";
import type { ProductFormValues } from "@/lib/validations/product";

/**
 * Seller product writes for the mobile app.
 *
 * Every branch calls the exact same "use server" action the web product form
 * uses (app/seller/products/actions.ts), passing `actingUserId` from the
 * verified token instead of a cookie session -- see the comment on
 * `getCurrentUserWithProfileOrActing` in lib/auth.ts for why that bypass
 * exists. No product logic (slug generation, plan limits, dynamic pricing,
 * image ordering) is reimplemented here.
 */
export const dynamic = "force-dynamic";

type Body =
  | { action: "detail"; productId: string }
  | { action: "create"; formData: ProductFormValues; imageUrls?: string[] }
  | { action: "update"; productId: string; formData: ProductFormValues; imageUrls?: string[] }
  | { action: "delete"; productId: string }
  | { action: "discount"; productIds: string[]; payload: DiscountPayload }
  | { action: "removeDiscount"; productIds: string[] };

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
      case "detail": {
        const store = await getSellerStore({ actingUser: { id: auth.user.id } });
        if (!store) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });
        const product = await getSellerProductById(body.productId, store.id);
        if (!product) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
        return NextResponse.json({ ok: true, product });
      }
      case "create":
        return NextResponse.json(
          await createProduct(body.formData, body.imageUrls ?? [], options)
        );
      case "update":
        return NextResponse.json(
          await updateProduct(body.productId, body.formData, body.imageUrls ?? [], options)
        );
      case "delete":
        return NextResponse.json(await softDeleteProduct(body.productId, options));
      case "discount":
        return NextResponse.json(
          await applyProductDiscount(body.productIds, body.payload, options)
        );
      case "removeDiscount":
        return NextResponse.json(await removeProductDiscount(body.productIds, options));
      default:
        return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
    }
  } catch (e) {
    console.error("[api/seller/products] action failed", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
