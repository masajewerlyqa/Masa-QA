import { CHECKOUT_PROMO_CODE_STORAGE_KEY } from "@/lib/checkout-promo-storage";

/** Client-side cart cache (guest cart or Stripe checkout flow). */
export const CART_LOCAL_STORAGE_KEY = "masa-cart";

/** Removes cart and checkout promo data from browser storage. */
export function clearCartLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_LOCAL_STORAGE_KEY);
    sessionStorage.removeItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}
