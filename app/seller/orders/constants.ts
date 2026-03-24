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

export type TrackingInfo = {
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
};
