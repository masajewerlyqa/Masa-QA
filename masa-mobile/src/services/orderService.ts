import { sitePostJsonAuthed } from '../api/siteApi';

/**
 * Order placement.
 *
 * Posts to the same endpoint the web checkout uses so promo, commission,
 * stock and confirmation email behave identically on both clients. Nothing is
 * charged here: both methods are collected by the courier at delivery, so the
 * order is created unpaid.
 */

export const DELIVERY_PAYMENT_METHODS = ['cash_on_delivery', 'card_on_delivery'] as const;
export type DeliveryPaymentMethod = (typeof DELIVERY_PAYMENT_METHODS)[number];

export type OrderShippingPayload = {
  firstName: string;
  deliveryPhone: string;
  country: string;
  deliveryCityArea: string;
  deliveryBuildingType: string | null;
  deliveryZoneNo: string | null;
  deliveryStreetNo: string | null;
  deliveryBuildingNo: string | null;
  deliveryFloorNo: string | null;
  deliveryApartmentNo: string | null;
  deliveryLandmark: string | null;
  deliveryLat: number;
  deliveryLng: number;
  deliveryMapUrl: string | null;
};

export type PlaceOrderResponse = { ok: true; orderId: string } | { ok: false; error?: string };

export async function placeOrder(args: {
  paymentMethod: DeliveryPaymentMethod;
  shipping: OrderShippingPayload;
  promoCode?: string;
}): Promise<PlaceOrderResponse> {
  const result = await sitePostJsonAuthed<{ ok: boolean; orderId?: string; error?: string }>(
    '/api/orders/create',
    {
      paymentMethod: args.paymentMethod,
      promoCode: args.promoCode,
      shipping: args.shipping,
    },
  );

  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  const data = result.data;
  if (!data?.ok || !data.orderId) {
    return { ok: false, error: data?.error };
  }
  return { ok: true, orderId: data.orderId };
}
