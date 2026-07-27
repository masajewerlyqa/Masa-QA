# Stripe: test mode vs live (real) payments

## Why you see “Test mode” on Stripe Checkout

Stripe shows **Test mode** when your server uses a **test secret key**:

| Key prefix | Mode | Charges |
|------------|------|---------|
| `sk_test_...` | Test | Fake — use cards like `4242 4242 4242 4242` |
| `sk_live_...` | Live | **Real money** — real cards only |

Session IDs confirm this: `cs_test_...` = test, `cs_live_...` = live.

Your code is correct. Switch **environment variables** on the host (Vercel), not the card fields on the checkout form.

---

## Enable real payments (production)

### 1. Stripe Dashboard — activate live payments

1. [Stripe Dashboard](https://dashboard.stripe.com) → complete business verification if prompted.
2. Toggle **Test mode** OFF (top right) to view **Live** data.
3. **Developers → API keys** → copy **Secret key** (`sk_live_...`).  
   Never commit this key to git.

### 2. Vercel — production environment variables

Project → **Settings → Environment Variables** → **Production** only:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (not `sk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from a **live** webhook (below) |
| `NEXT_PUBLIC_SITE_URL` | Your real site, e.g. `https://masajewelry.com` |

Redeploy after saving.

> Production builds **reject** `sk_test_...` and return an error so test keys are not used for live traffic by mistake.

### 3. Live webhook (required for orders)

In Stripe (**Live mode**, test toggle OFF):

1. **Developers → Webhooks → Add endpoint**
2. URL: `https://YOUR-DOMAIN.com/api/webhooks/stripe`  
   (must match `NEXT_PUBLIC_SITE_URL` and be publicly reachable)
3. Events: `checkout.session.completed`, `checkout.session.async_payment_failed`, `payment_intent.payment_failed`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET` in Vercel (Production)

Use a **separate** webhook for test (`sk_test_` + test webhook secret) on Preview/local if needed.

### 4. DNS / success URL

After payment, Stripe redirects to:

`{NEXT_PUBLIC_SITE_URL}/success?session_id=...`

That domain must resolve (no `DNS_PROBE_FINISHED_NXDOMAIN`). Set `NEXT_PUBLIC_SITE_URL` to the domain that actually works in the browser.

---

## Local development (keep using test)

In `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from Stripe CLI or test webhook
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Use [Stripe test cards](https://docs.stripe.com/testing). Do **not** use live keys locally unless you intend to charge real cards.

---

## Quick checklist

- [ ] Vercel Production has `sk_live_...` and live `STRIPE_WEBHOOK_SECRET`
- [ ] Live webhook endpoint returns 200 in Stripe Dashboard
- [ ] `NEXT_PUBLIC_SITE_URL` is your real HTTPS domain
- [ ] Supabase migration `045_stripe_orders.sql` applied on production
- [ ] Small real charge test (then refund in Stripe if needed)
