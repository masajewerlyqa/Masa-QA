/**
 * Client-safe auth types and helpers.
 * Safe to import from Client Components and any code that cannot use next/headers.
 * Do NOT import this file from lib/auth.ts if that would create a cycle.
 */

/** Minimal session user from Supabase Auth (aligned with server getCurrentUserWithProfile). */
export type SessionUser = {
  id: string;
  email?: string;
  /** ISO timestamp when Supabase confirmed the email; OAuth users typically have this set. */
  emailConfirmedAt: string | null;
};

export type Profile = {
  id: string;
  role: "admin" | "seller" | "pending_seller" | "customer";
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  /** Set when verified via OTP; null until then (OTP flow not enforced yet). */
  phone_verified_at: string | null;
  /** Marketing / newsletter opt-in from signup or settings; default false. */
  newsletter_opt_in: boolean;
  /** Email + UI locale preference (`en` | `ar`); default en until set. */
  preferred_language?: "en" | "ar";
  /** Draft plan during Become a Seller; cleared after application is submitted. */
  pending_seller_plan?: "basic" | "premium" | null;
};

/**
 * Returns the redirect path for a given role after login/register.
 */
export function getRedirectPathForRole(role: Profile["role"]): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "seller":
      return "/seller";
    case "pending_seller":
      return "/apply";
    case "customer":
    default:
      return "/account";
  }
}

/**
 * Returns the dashboard path for a given role (used in nav menu).
 */
export function getDashboardPathForRole(role: Profile["role"]): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "seller":
      return "/seller";
    case "pending_seller":
      return "/apply";
    case "customer":
    default:
      return "/account";
  }
}
