/**
 * Order-related constants and types.
 * Kept in a separate file so "use server" actions.ts can export only async functions.
 */

export const SHIPPING_COMPANIES = [
  "DHL",
  "FedEx",
  "UPS",
  "Aramex",
  "USPS",
  "TNT",
  "EMS",
  "Saudi Post",
  "SMSA Express",
  "Other",
] as const;

export type OrderActionResult = { ok: boolean; error?: string };

/** Min length for seller cancellation message to buyer. */
export const SELLER_CANCELLATION_REASON_MIN_LEN = 10;
export const SELLER_CANCELLATION_REASON_MAX_LEN = 2000;

export type TrackingInfo = {
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
};
