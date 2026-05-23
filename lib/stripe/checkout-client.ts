/** Line item sent to POST /api/create-checkout-session */
export type CheckoutLineItem = {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
};

export type CheckoutShippingPayload = {
  firstName: string;
  deliveryPhone: string;
  country: string;
  deliveryCityArea: string;
  deliveryBuildingType?: string | null;
  deliveryZoneNo?: string | null;
  deliveryStreetNo?: string | null;
  deliveryBuildingNo?: string | null;
  deliveryFloorNo?: string | null;
  deliveryApartmentNo?: string | null;
  deliveryLandmark?: string | null;
  deliveryLat: number;
  deliveryLng: number;
  deliveryMapUrl?: string | null;
};

/** Cart row shape from getCartWithProducts (client or server). */
export type CartProductLine = {
  quantity: number;
  product: { id: string; title: string; price: number };
};

export function toCheckoutLineItems(items: CartProductLine[]): CheckoutLineItem[] {
  return items.map((item) => ({
    name: item.product.title,
    price: item.product.price,
    quantity: item.quantity,
    productId: item.product.id,
  }));
}

export type CreateCheckoutSessionRequest = {
  items: CheckoutLineItem[];
  shipping: CheckoutShippingPayload;
  promoCode?: string;
};

export type CreateCheckoutSessionResponse =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error?: string };

export async function createCheckoutSession(
  items: CheckoutLineItem[],
  shipping: CheckoutShippingPayload,
  options?: { promoCode?: string }
): Promise<CreateCheckoutSessionResponse> {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      shipping,
      promoCode: options?.promoCode,
    } satisfies CreateCheckoutSessionRequest),
  });

  const data = (await res.json()) as CreateCheckoutSessionResponse;
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error:
        ("error" in data && typeof data.error === "string" && data.error) ||
        "Could not start checkout. Please try again.",
    };
  }
  return data;
}
