import { z } from "zod";

/** Delivery snapshot stored on Stripe session metadata (compact JSON, max ~500 chars). */
export const stripeCheckoutShippingSchema = z.object({
  firstName: z.string().trim().min(1).max(200),
  deliveryPhone: z.string().trim().min(1).max(40),
  country: z.string().trim().min(1).max(80),
  deliveryCityArea: z.string().trim().min(1).max(200),
  deliveryBuildingType: z.string().trim().max(80).optional().nullable(),
  deliveryZoneNo: z.string().trim().max(40).optional().nullable(),
  deliveryStreetNo: z.string().trim().max(40).optional().nullable(),
  deliveryBuildingNo: z.string().trim().max(40).optional().nullable(),
  deliveryFloorNo: z.string().trim().max(40).optional().nullable(),
  deliveryApartmentNo: z.string().trim().max(40).optional().nullable(),
  deliveryLandmark: z.string().trim().max(500).optional().nullable(),
  deliveryLat: z.number().finite(),
  deliveryLng: z.number().finite(),
  deliveryMapUrl: z.string().trim().max(500).optional().nullable(),
});

export type StripeCheckoutShipping = z.infer<typeof stripeCheckoutShippingSchema>;

type CompactShipping = {
  fn: string;
  ph: string;
  co: string;
  ca: string;
  bt?: string | null;
  zn?: string | null;
  st?: string | null;
  bn?: string | null;
  fl?: string | null;
  ap?: string | null;
  lm?: string | null;
  lat: number;
  lng: number;
  mu?: string | null;
};

export function serializeShippingForMetadata(shipping: StripeCheckoutShipping): string {
  const compact: CompactShipping = {
    fn: shipping.firstName,
    ph: shipping.deliveryPhone,
    co: shipping.country,
    ca: shipping.deliveryCityArea,
    bt: shipping.deliveryBuildingType ?? null,
    zn: shipping.deliveryZoneNo ?? null,
    st: shipping.deliveryStreetNo ?? null,
    bn: shipping.deliveryBuildingNo ?? null,
    fl: shipping.deliveryFloorNo ?? null,
    ap: shipping.deliveryApartmentNo ?? null,
    lm: shipping.deliveryLandmark ?? null,
    lat: shipping.deliveryLat,
    lng: shipping.deliveryLng,
    mu: shipping.deliveryMapUrl ?? null,
  };
  return JSON.stringify(compact);
}

export function parseShippingFromMetadata(raw: string | null | undefined): StripeCheckoutShipping | null {
  if (!raw?.trim()) return null;
  try {
    const c = JSON.parse(raw) as CompactShipping;
    const parsed = stripeCheckoutShippingSchema.safeParse({
      firstName: c.fn,
      deliveryPhone: c.ph,
      country: c.co,
      deliveryCityArea: c.ca,
      deliveryBuildingType: c.bt ?? null,
      deliveryZoneNo: c.zn ?? null,
      deliveryStreetNo: c.st ?? null,
      deliveryBuildingNo: c.bn ?? null,
      deliveryFloorNo: c.fl ?? null,
      deliveryApartmentNo: c.ap ?? null,
      deliveryLandmark: c.lm ?? null,
      deliveryLat: c.lat,
      deliveryLng: c.lng,
      deliveryMapUrl: c.mu ?? null,
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function shippingToOrderFields(shipping: StripeCheckoutShipping) {
  const shipping_address = {
    firstName: shipping.firstName,
    phone: shipping.deliveryPhone,
    country: shipping.country,
    cityArea: shipping.deliveryCityArea,
    buildingType: shipping.deliveryBuildingType,
    zoneNo: shipping.deliveryZoneNo,
    streetNo: shipping.deliveryStreetNo,
    buildingNo: shipping.deliveryBuildingNo,
    floorNo: shipping.deliveryFloorNo,
    apartmentNo: shipping.deliveryApartmentNo,
    landmark: shipping.deliveryLandmark,
    lat: shipping.deliveryLat,
    lng: shipping.deliveryLng,
    mapUrl: shipping.deliveryMapUrl,
  };
  return {
    shipping_address,
    notes: shipping.deliveryLandmark ?? null,
    delivery_country: shipping.country,
    delivery_city_area: shipping.deliveryCityArea,
    delivery_building_type: shipping.deliveryBuildingType ?? null,
    delivery_zone_no: shipping.deliveryZoneNo ?? null,
    delivery_street_no: shipping.deliveryStreetNo ?? null,
    delivery_building_no: shipping.deliveryBuildingNo ?? null,
    delivery_floor_no: shipping.deliveryFloorNo ?? null,
    delivery_apartment_no: shipping.deliveryApartmentNo ?? null,
    delivery_landmark: shipping.deliveryLandmark ?? null,
    delivery_phone: shipping.deliveryPhone,
    delivery_lat: shipping.deliveryLat,
    delivery_lng: shipping.deliveryLng,
    delivery_map_url: shipping.deliveryMapUrl ?? null,
  };
}
