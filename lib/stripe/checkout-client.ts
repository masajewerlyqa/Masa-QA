/** Line item sent to POST /api/create-checkout-session */
export type CheckoutLineItem = {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
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
  customerId?: string;
};

export type CreateCheckoutSessionResponse =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error?: string };

export async function createCheckoutSession(
  items: CheckoutLineItem[],
  customerId?: string
): Promise<CreateCheckoutSessionResponse> {
  const res = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, customerId } satisfies CreateCheckoutSessionRequest),
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
