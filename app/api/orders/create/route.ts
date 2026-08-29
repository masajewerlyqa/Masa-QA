import { NextResponse } from "next/server";
import { createOrder } from "@/app/(site)/checkout/actions";
import { getUserFromRequest } from "@/lib/auth/request-user";
import { isDeliveryPaymentMethod } from "@/lib/orders/payment-methods";

/**
 * Order creation for the mobile app.
 *
 * Deliberately a thin shim over the same `createOrder` the web checkout uses,
 * rather than its own implementation: promo validation, commission, stock and
 * confirmation email all live there, and duplicating them is how the two
 * clients would quietly drift apart.
 *
 * Nothing is charged here. Both payment methods are collected by the courier,
 * so the order is created with payment_status "pending".
 */
export const dynamic = "force-dynamic";

type CreateOrderBody = {
  paymentMethod?: unknown;
  promoCode?: unknown;
  shipping?: Record<string, unknown>;
};

/** Mirrors the field names createOrder reads off the checkout form. */
const SHIPPING_FIELDS: Record<string, string> = {
  firstName: "firstName",
  deliveryPhone: "delivery_phone",
  country: "country",
  deliveryCityArea: "delivery_city_area",
  deliveryBuildingType: "delivery_building_type",
  deliveryZoneNo: "delivery_zone_no",
  deliveryStreetNo: "delivery_street_no",
  deliveryBuildingNo: "delivery_building_no",
  deliveryFloorNo: "delivery_floor_no",
  deliveryApartmentNo: "delivery_apartment_no",
  deliveryLandmark: "delivery_landmark",
  deliveryLat: "delivery_lat",
  deliveryLng: "delivery_lng",
  deliveryMapUrl: "delivery_map_url",
};

export async function POST(request: Request) {
  // The bearer token is verified here; createOrder then resolves the same
  // session itself and scopes the cart to it, so a caller cannot place an
  // order against somebody else's cart.
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in to place an order" }, { status: 401 });
  }

  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  if (!isDeliveryPaymentMethod(body.paymentMethod)) {
    return NextResponse.json(
      { ok: false, error: "Please choose how you would like to pay on delivery." },
      { status: 400 }
    );
  }

  const formData = new FormData();
  formData.set("payment_method", body.paymentMethod);
  if (typeof body.promoCode === "string" && body.promoCode.trim()) {
    formData.set("promo_code", body.promoCode.trim());
  }

  const shipping = body.shipping ?? {};
  for (const [key, field] of Object.entries(SHIPPING_FIELDS)) {
    const value = shipping[key];
    if (value != null && value !== "") {
      formData.set(field, String(value));
    }
  }

  const result = await createOrder(formData, { redirect: false });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, orderId: result.orderId });
}
