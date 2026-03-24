# Checkout flow fix — order creation for COD and Bank Transfer

This document explains what was blocking order creation when customers chose **Cash on Delivery** or **Bank Transfer**, and what was changed to fix it.

---

## What was blocking order creation

### 1. **Form submission and `payment_method`**

The checkout form used a **native form action** (`<form action={createOrder}>`) with a **hidden input** whose value was bound to React state: `<input type="hidden" name="payment_method" value={paymentMethod} />`.

- When the user chose **Credit / Debit Card**, the card fields were in the DOM and the form submitted as expected.
- When the user chose **Cash on Delivery** or **Bank Transfer**, the card section was not rendered. In some cases (timing, serialization, or how Next.js builds `FormData` for server actions), the hidden input’s value was not reliably included in the payload received by the server action, or the form submission path differed so that the action did not receive a valid `payment_method`.

So the server could receive `formData.get("payment_method")` as empty or inconsistent, and any logic that depended on it (or that didn’t explicitly support COD/bank_transfer) could block or mis-handle the request. The fix ensures `payment_method` is **always** sent and normalized on both client and server.

### 2. **No error feedback on failure**

When `createOrder` returned `{ ok: false, error: "..." }` (e.g. validation or DB error), the form did not handle that return value. The user saw no message and had no way to know the order failed. So from the user’s perspective it looked like “order does not get created” with no explanation.

### 3. **Redirect vs return**

When the server action called `redirect()`, Next.js throws a special error. If the client did not distinguish that from a real error, it could have treated the redirect as a failure. The fix explicitly treats redirect throws as success (rethrow) and only shows errors when the action returns `{ ok: false }` or throws a non-redirect error.

---

## What was fixed

### 1. **CheckoutForm (`app/(site)/checkout/CheckoutForm.tsx`)**

- **Submit handler:** The form no longer uses `action={createOrder}`. It uses `onSubmit` with `e.preventDefault()`, builds `FormData` from the form, and **explicitly sets** `payment_method` from React state before calling the server action:
  - `formData.set("payment_method", VALID_PAYMENT_METHODS.has(paymentMethod) ? paymentMethod : "cod")`
- So **Cash on Delivery** and **Bank Transfer** always send a valid `payment_method` (`cod` or `bank_transfer`), and the server always receives it.
- **Error handling:** The result of `createOrder(formData)` is handled:
  - If `result?.ok === false`, the returned `error` message is shown in the UI.
  - If the promise rejects (e.g. server throw), the error is shown unless it is a Next.js redirect error (`NEXT_REDIRECT`), which is rethrown so the redirect still works.
- **Validation:** The form uses `noValidate` so we rely on server-side validation and can show the server’s error message.

### 2. **createOrder (`app/(site)/checkout/actions.ts`)**

- **Payment method:** The server normalizes `payment_method` from `FormData` and accepts `card`, `cod`, or `bank_transfer`. Any other or missing value defaults to `cod`, so COD and Bank Transfer are never blocked by an invalid or missing payment method.
- **Shipping validation:** Required fields (first name, last name, address, city, ZIP) are validated; ZIP must be at least 3 characters. Clear error messages are returned so the form can display them.
- **Order creation:** Unchanged: one `orders` row and multiple `order_items` rows are inserted; then cart is cleared, sellers are notified, paths are revalidated, and `redirect()` is called to the success page.
- **Seller visibility:** `revalidatePath("/seller/orders")` and `revalidatePath("/seller")` were added so that after an order is created, the seller’s orders list and dashboard show the new order without a manual refresh.

---

## Flow after the fix

1. User fills shipping fields and selects **Cash on Delivery** or **Bank Transfer**.
2. User clicks **Place Secure Order**.
3. `handleSubmit` runs: builds `FormData`, sets `payment_method` from state, calls `createOrder(formData)`.
4. Server validates shipping, normalizes `payment_method`, inserts `orders` and `order_items`, clears cart, notifies sellers, revalidates (including seller routes), and calls `redirect(/checkout/success?orderId=...)`.
5. If validation or DB fails, server returns `{ ok: false, error: "..." }` and the form shows that message.
6. If redirect is thrown, the client rethrows it so the app navigates to the success page; the buyer sees the confirmation, and the seller sees the new order under **seller/orders**.

---

## Summary

| Issue | Cause | Fix |
|-------|--------|-----|
| Order not created for COD / Bank Transfer | `payment_method` not reliably sent or normalized when form submitted via native action | Client always sets `payment_method` in `FormData` from state; server normalizes and defaults to `cod` |
| No feedback on failure | Form did not handle `createOrder` return value or thrown errors | Show returned error message; catch only non-redirect errors |
| Seller not seeing new order | Seller routes not revalidated after order creation | `revalidatePath("/seller/orders")` and `revalidatePath("/seller")` in `createOrder` |

Order creation now works for **Credit / Debit Card**, **Cash on Delivery**, and **Bank Transfer**, with correct validation, success redirect, cart clear, and seller order visibility.
