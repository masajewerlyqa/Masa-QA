/**
 * Bank-transfer details for seller plan payments.
 *
 * Read from the environment, never committed. Bank details change (new
 * account, new bank) and baking them into the repo would both put them in git
 * history permanently and require a redeploy to correct them.
 *
 * An IBAN already encodes the account number, so it is the only account
 * identifier shown. A card number must never be used here: it would be
 * published to every applicant and is not how transfers are received.
 */

import type { SellerPlanId } from "@/lib/seller-plans";
import { SELLER_PLAN_LIMITS } from "@/lib/seller-plans";

export type BankTransferDetails = {
  bankName: string;
  accountName: string;
  iban: string;
};

/**
 * Returns null when unconfigured so callers can show a "contact support"
 * fallback rather than rendering an empty, unusable instruction page.
 */
export function getBankTransferDetails(): BankTransferDetails | null {
  const bankName = process.env.MASA_BANK_NAME?.trim();
  const accountName = process.env.MASA_BANK_ACCOUNT_NAME?.trim();
  const iban = process.env.MASA_BANK_IBAN?.trim();

  if (!bankName || !accountName || !iban) return null;

  return { bankName, accountName, iban };
}

/** Grouped in fours, the way banks print them, so it can be transcribed. */
export function formatIban(iban: string): string {
  const compact = iban.replace(/[\s-]/g, "").toUpperCase();
  return compact.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Reference the seller quotes on the transfer so an admin can match an
 * incoming payment to an application. Derived from the application id, so it
 * is stable across retries and unique without extra bookkeeping.
 */
export function buildPaymentReference(applicationId: string): string {
  const compact = applicationId.replace(/-/g, "").toUpperCase();
  return `MASA-${compact.slice(0, 8)}`;
}

/** One-time registration fee for the plan. Not a recurring subscription. */
export function getPlanAmountQar(planId: SellerPlanId): number {
  return SELLER_PLAN_LIMITS[planId].registrationFeeQar;
}
