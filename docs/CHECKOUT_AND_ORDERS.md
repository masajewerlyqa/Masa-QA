# Checkout and order creation

Buyers can complete checkout with a shipping address, create an order and order items in Supabase, clear the cart, and see an order confirmation page.

## Flow

1. **Cart** – User adds products to cart (see [WISHLIST_AND_CART.md](./WISHLIST_AND_CART.md)).
2. **Checkout** – User goes to `/checkout`. Page shows:
   - **Shipping form**: First name, last name, address, city, state, ZIP, country (default US), optional notes.
   - **Payment** – Placeholder (no payment integration); message explains that payment will be collected separately.
   - **Order summary** – Cart items and totals (subtotal, shipping, tax, total). “Edit cart” links back to `/cart`.
3. **Place order** – On “Place Secure Order”:
   - Server action validates user and cart.
   - Validates required shipping fields (firstName, lastName, address, city, zip).
   - Inserts one row into **orders** (customer_id, status `pending`, subtotal, shipping_cost, tax, total, shipping_address JSONB, notes).
   - Inserts one row per cart line into **order_items** (order_id, product_id, quantity, unit_price from product price, total_price).
   - Clears all **cart_items** for the user’s cart.
   - Revalidates cart and layout (so navbar cart count updates).
   - Redirects to `/checkout/success?orderId=<uuid>`.
4. **Confirmation** – Success page loads the order for the current customer, shows thank-you message, order id, shipping address, order summary (items and totals), and links to “Continue shopping” and “Back to home”.

## Data

- **orders**: customer_id, status, subtotal, shipping_cost, tax, total, shipping_address (JSONB: firstName, lastName, address, city, state, zip, country), notes.
- **order_items**: order_id, product_id, quantity, unit_price, total_price (snapshot at order time).
- **Cart**: All items for the user are deleted after a successful order (same cart as in 010_carts).

## Files

| File | Purpose |
|------|--------|
| `lib/customer.ts` | `clearCart(userId)`, `getCustomerOrder(orderId, userId)`, types `CustomerOrder`, `CustomerOrderItem`. |
| `app/(site)/checkout/actions.ts` | `createOrder(formData)` – validate, create order, create order_items, clear cart, redirect to success. |
| `app/(site)/checkout/page.tsx` | Server: load cart, redirect if empty or not logged in; render CheckoutForm + order summary. |
| `app/(site)/checkout/CheckoutForm.tsx` | Client: shipping form + payment placeholder; form action = createOrder; submit button with useFormStatus. |
| `app/(site)/checkout/success/page.tsx` | Server: read orderId from searchParams, getCustomerOrder, show confirmation or notFound. |

## How to test the full buyer purchase flow locally

1. **DB and auth**
   - Migrations applied (including 010_carts). Supabase env vars in `.env.local`.
   - At least one **public product** (active, from an active store) and a **customer** (or any) account.

2. **Log in as a buyer** (customer or any role that can use the site).

3. **Add to cart**
   - Open Discover or a product page. Add one or more products to the cart (e.g. “Add to Cart” or “Quick Add”).
   - Open `/cart`. Confirm items and quantities. Optionally change quantity or remove an item.

4. **Go to checkout**
   - From cart, click “Proceed to Checkout” (or open `/checkout`).
   - Confirm you see the same order summary and the shipping form.

5. **Place order**
   - Fill required shipping fields: First name, Last name, Address, City, ZIP. Optionally State, Country, Order notes.
   - Click “Place Secure Order”. Button should show “Placing order...” then redirect.

6. **Confirmation page**
   - You should land on `/checkout/success?orderId=...`.
   - Check: thank-you message, order id, shipping address, list of items with quantities and prices, subtotal/shipping/tax/total.
   - Navbar cart count should be 0.

7. **Verify in Supabase**
   - **orders**: One new row with your customer_id, status `pending`, totals and shipping_address.
   - **order_items**: One row per product in the order (order_id, product_id, quantity, unit_price, total_price).
   - **cart_items**: No rows left for your user (cart cleared).

8. **Seller view**
   - Log in as the seller who owns the store for those products. Open `/seller/orders`. The new order should appear. Open it and confirm items and status.

9. **Edge cases**
   - Visit `/checkout` with an empty cart: should redirect to `/cart`.
   - Visit `/checkout` logged out: should redirect to login.
   - Visit `/checkout/success` without `orderId` or with another user’s orderId: 404.
   - Submit checkout with missing required shipping fields: no redirect; fix and resubmit.
