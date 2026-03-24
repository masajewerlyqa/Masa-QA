# Checkout & payments — placeholder architecture

The checkout UI is **payment-ready** but does **not** process real payments. Orders are created as today; no card data is sent to any processor.

## Current behavior

- **Payment method selection:** Credit/Debit Card, Cash on Delivery, Bank Transfer (placeholder).
- **Card fields:** When "Credit / Debit Card" is selected, the form shows cardholder name, card number, expiry, and CVV. These are **not** validated or sent to a payment provider; they are part of the form for UI/UX only.
- **Order creation:** Same as before: shipping data is required; `createOrder` creates the order and redirects to success. `payment_method` (and any card fields) are available in the action but not persisted or charged.

## How to add real payment integration later

1. **Choose a provider**  
   Common options: **Stripe** (Elements or Payment Element), **Braintree**, or your PSP’s SDK.

2. **Server-side: collect payment before creating the order**
   - In `createOrder` (or a dedicated “create payment intent” action), when `payment_method === "card"`:
     - Create a PaymentIntent / charge (or equivalent) with the provider using **server-side API only** (never log or store raw card numbers).
     - If your flow uses client-side tokens (e.g. Stripe.js), the client sends a **token or PaymentMethod ID** to the server; the server then charges that and creates the order only after success.
   - For **Cash on Delivery** and **Bank Transfer**, keep current behavior: create the order and optionally store `payment_method` for reporting.

3. **Client-side: secure card entry**
   - Replace the current placeholder card inputs with the provider’s hosted fields or Elements (e.g. Stripe Elements). The browser sends card data only to the provider; your app never touches raw PAN/CVV.
   - Keep the same payment method selection UI (Card / COD / Bank Transfer); when Card is selected, show the provider’s component instead of the placeholder fields.

4. **Optional: persist payment method**
   - Add a `payment_method` (and optionally `payment_intent_id` or similar) column to `orders` if you need to display or reconcile by method.

5. **Flow summary**
   - **Card:** Client collects card via provider’s UI → server creates charge/payment intent → on success, server creates order and redirects to success (same as now).
   - **COD / Bank transfer:** Server creates order as today; no charge. Optionally store `payment_method` for reporting.

This keeps the existing MASA checkout UX and order creation flow intact while making it clear that the current implementation is a placeholder ready for a real payment integration.
