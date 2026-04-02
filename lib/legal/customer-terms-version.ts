/**
 * Customer Terms & Conditions — version string stored in `profiles.accepted_terms_version`.
 * Bump this when legal content changes materially; ship a DB note or migration if you need server-side enforcement of a specific version.
 */
/** Bump when customer T&Cs text changes (see `customer-terms-sections.ts`). */
export const CUSTOMER_TERMS_VERSION = "2026-04-04";

export type LegalDocumentId = "customer_terms" | "privacy_policy" | "seller_terms";
