/**
 * Phone OTP is not live yet. All enforcement and copy flow through here so
 * components stay dumb and a single env flag can activate behavior later.
 */

import { env } from "@/lib/config/env";

export type PhoneVerificationPolicy = {
  /** Whether the product currently requires a verified phone (OTP not implemented until enabled). */
  enforcementRequested: boolean;
  /** Short line for settings / profile UI. */
  hint: string;
  /** Shown when enforcement is on but phone missing or unverified. */
  warning?: string;
};

export function getPhoneVerificationPolicy(): PhoneVerificationPolicy {
  const enforcementRequested = env.enforcePhoneVerification;

  if (enforcementRequested) {
    return {
      enforcementRequested: true,
      hint: "A verified phone number is required for your account. SMS or WhatsApp verification will be available here soon.",
      warning: "Please add and verify your phone number to continue using all MASA features.",
    };
  }

  return {
    enforcementRequested: false,
    hint: "We may ask you to verify your phone by SMS or WhatsApp in the future for added security.",
  };
}

/** Server/client: use for conditional logic without importing env in many files. */
export function isPhoneVerificationEnforced(): boolean {
  return env.enforcePhoneVerification;
}
