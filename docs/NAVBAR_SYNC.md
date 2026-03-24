# Navbar and layout UI synchronization

This document describes the state management and refresh logic that keeps the navbar (cart count, wishlist count, auth/account state) in sync after cart, wishlist, and auth actions.

---

## 1. What was wrong

- **Cart count:** After add/remove/update cart, the navbar cart badge did not update until a full page refresh.
- **Wishlist count:** After add/remove wishlist, the navbar wishlist badge did not update until refresh.
- **Auth state:** After sign out, the navbar still showed the old account (dropdown, email) until refresh.

**Cause:** The site layout (`app/(site)/layout.tsx`) is a **server component** that fetches `user`, `profile`, `wishlistCount`, `cartCount`, and `notificationCount` once per request. When a client component runs a server action (e.g. add to cart), Next.js was only revalidating **page** caches. The **layout** segment was still served from cache, so the navbar kept showing old counts and auth until a full document load.

---

## 2. What was fixed

### Layout revalidation

All server actions that change data used by the layout now call:

```ts
revalidatePath("/", "layout");
```

in addition to existing `revalidatePath("/")` (and other paths). In Next.js App Router, `revalidatePath(path, "layout")` invalidates the layout and all segments below that path, so the next RSC refetch re-runs the layout and gets fresh `getCurrentUserWithProfile()`, `getWishlistCount()`, and `getCartCount()`.

**Files updated:**

- **`app/(site)/cart/actions.ts`**  
  `addToCart`, `updateCartQuantity`, and `removeFromCart` now call `revalidatePath("/", "layout")` so the layout (and navbar cart count) is invalidated after any cart change.

- **`app/(site)/wishlist/actions.ts`**  
  `addToWishlist` and `removeFromWishlist` now call `revalidatePath("/", "layout")` so the navbar wishlist count updates after add/remove.

- **`app/(site)/checkout/actions.ts`**  
  `createOrder` (which clears the cart) now calls `revalidatePath("/", "layout")` so the navbar cart count updates after checkout.

- **`app/(site)/notifications/actions.ts`**  
  `markNotificationReadAction` and `markAllNotificationsReadAction` now call `revalidatePath("/", "layout")` so the navbar notification badge updates when the user marks notifications as read.

### Client-side refresh after actions

Client components that call these actions already call `router.refresh()` on success (e.g. `AddToCartButton`, `WishlistHeartButton`, `CartItemRow`). That triggers a refetch of the current route’s RSC tree. With the layout cache invalidated by the server action, this refetch now gets a **new** layout payload with updated counts and user. No change was required in these components; the fix was layout revalidation on the server.

### Sign out and stale account UI

Sign out is **client-only** (Supabase `signOut()` in the browser). There is no server action, so no `revalidatePath` runs. Doing only `router.refresh()` or `router.push("/")` could still show a cached layout with the old user.

**Fix:** In `components/auth/NavbarAuth.tsx`, sign out now performs a **full navigation** after clearing the session:

```ts
await supabase.auth.signOut();
window.location.href = "/";
```

That forces a new document load. The browser sends a request **without** the auth cookie, so the server renders the layout with `user = null` and the navbar shows the signed-out state (Sign in link) with no stale account info.

---

## 3. Flow summary

| Action | Server | Client | Result |
|--------|--------|--------|--------|
| Add/remove/update cart | `revalidatePath("/", "layout")` in cart actions | `router.refresh()` on success (existing) | Layout refetched → navbar cart count updates |
| Add/remove wishlist | `revalidatePath("/", "layout")` in wishlist actions | `router.refresh()` on success (existing) | Layout refetched → navbar wishlist count updates |
| Checkout (order created, cart cleared) | `revalidatePath("/", "layout")` in checkout action | Server `redirect()` to success page | New page load uses fresh layout → cart count 0 |
| Mark notification(s) read | `revalidatePath("/", "layout")` in notification actions | `router.refresh()` in notification UI (existing) | Layout refetched → navbar notification count updates |
| Sign out | No server action | `window.location.href = "/"` after `signOut()` | Full load without cookie → navbar shows signed-out state |

---

## 4. Login and register

After **login** and **register**, the navbar already updates because:

- **Login:** `LoginForm` calls `router.refresh()` then `router.push(redirectPath)`. The navigation fetches the new route’s RSC payload with the auth cookie set, so the layout runs with the new user and counts.
- **Register:** Same pattern with `router.refresh()` and `router.push(...)`.

No change was required there; only layout revalidation and sign-out behavior were updated.
