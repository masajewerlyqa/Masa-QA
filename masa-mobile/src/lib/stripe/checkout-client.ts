import { siteFetchJsonAuthed, sitePostJsonAuthed } from '../../api/siteApi';
import type { CartItemWithProduct } from '../../services/cartService';

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

export function toCheckoutLineItems(items: CartItemWithProduct[]): CheckoutLineItem[] {
  return items.map((item) => ({
    name: item.product.name,
    price:
      item.product.priceUsd ??
      (Number.parseFloat(item.product.price.replace(/[^0-9.]/g, '')) || 0),
    quantity: item.quantity,
    productId: item.product.id,
  }));
}

export type CreateCheckoutSessionResponse =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error?: string };

export async function createCheckoutSession(
  items: CheckoutLineItem[],
  shipping: CheckoutShippingPayload,
  options?: { promoCode?: string; customerId?: string },
): Promise<CreateCheckoutSessionResponse> {
  const res = await sitePostJsonAuthed<CreateCheckoutSessionResponse>(
    '/api/create-checkout-session',
    {
      items,
      shipping,
      promoCode: options?.promoCode,
      customerId: options?.customerId,
      clientPlatform: 'mobile',
    },
  );

  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  const data = res.data;
  if (!data.ok) {
    return {
      ok: false,
      error:
        ('error' in data && typeof data.error === 'string' && data.error) ||
        'Could not start checkout.',
    };
  }

  return data;
}

export type VerifySessionResponse = {
  ok: boolean;
  status?: string;
  orderId?: string;
  orderNumber?: string;
  error?: string;
};

export async function verifyCheckoutSession(sessionId: string): Promise<VerifySessionResponse> {
  const res = await siteFetchJsonAuthed<VerifySessionResponse>(
    `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`,
  );
  if (!res.ok) {
    return { ok: false, error: res.error };
  }
  return res.data;
}
