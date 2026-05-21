# Stripe production deployment

## Environment

| Variable | Production |
|----------|------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` from Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the live webhook endpoint |
| `NEXT_PUBLIC_SITE_URL` | `https://masajewlery.com` (dev uses localhost) |

## Webhook (required)

**URL:** `https://masajewlery.com/api/webhooks/stripe`

**Events:**

- `checkout.session.completed` — creates Supabase order with `status = paid`
- `checkout.session.async_payment_failed` — logged; no order
- `payment_intent.payment_failed` — logged; no order

Orders are **never** created from `/success` or client APIs. Only `checkout.session.completed` with **`payment_status === paid`** triggers fulfillment.

The webhook verifies:

- Stripe signature (`STRIPE_WEBHOOK_SECRET`)
- Event pre-check: `session.status === complete` and `session.payment_status === paid` (the event alone is not enough)
- Re-fetch session + `PaymentIntent.status === succeeded` (required)
- Idempotency via `orders.stripe_checkout_session_id`
- DB product prices match Stripe `amount_subtotal`
- Idempotency via `orders.stripe_checkout_session_id`

## Checkout flow

1. Signed-in buyer calls `POST /api/create-checkout-session` (session required).
2. Server loads prices from Supabase (client prices must match DB).
3. Stripe Checkout redirect; success URL includes `?session_id={CHECKOUT_SESSION_ID}`.
4. `/success` polls `GET /api/stripe/verify-session` until the webhook order exists.
5. Failed cards: no order; user may land on `/payment/failed` if verification fails.

## Pre-launch checklist

- [ ] Run migration `045_stripe_orders.sql` on production Supabase
- [ ] Live Stripe keys in Vercel/host env
- [ ] Webhook endpoint live and returning 200
- [ ] Test card payment end-to-end; confirm order in Supabase with `status = paid`
- [ ] Test declined card; confirm **no** order row created
