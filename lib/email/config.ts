/**
 * Transactional email — site URL and from-address.
 * @see lib/config/env.ts for full env expectations.
 */

import { env } from "@/lib/config/env";

export function getSiteUrl(): string {
  return env.siteUrl;
}

export function getFromEmail(): string {
  return env.resendFromEmail;
}
