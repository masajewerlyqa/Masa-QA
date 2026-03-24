# Buyer order history and order details

Buyers can see only their own orders. Order history lists all orders; the order detail page shows status, items, summary, and shipping address.

## Behavior

- **Access**: Buyer must be logged in. Orders are scoped by `customer_id = auth.uid()` (RLS and server helpers).
- **Order history** (`/account/orders`):
  - Lists all orders for the current user, newest first.
  - Columns: Order (link to detail), Date, Status (badge), Total, View link.
  - Empty state if no orders.
- **Order details** (`/account/orders/[id]`):
  - Single order for the current user; 404 if not found or not theirs.
  - **Status badge** at the top (pending, confirmed, processing, shipped, delivered, cancelled).
  - **Items table**: product name, quantity, unit price, total per line.
  - **Summary**: subtotal, shipping, tax, total.
  - **Shipping address**: formatted from stored JSONB.
  - **Notes** (if present).
- **Account page** (`/account`): “Order history” button links to `/account/orders`.

## Data

- **List**: `getCustomerOrders(userId)` returns `{ id, status, total, created_at }[]` from `orders` where `customer_id = userId`, ordered by `created_at` desc.
- **Detail**: `getCustomerOrder(orderId, userId)` returns full order plus items (with product names) for that customer; used by both confirmation and order detail page.

## Files

| File | Purpose |
|------|--------|
| `lib/customer.ts` | `getCustomerOrders(userId)`, `CustomerOrderRow` type; existing `getCustomerOrder(orderId, userId)` for detail. |
| `app/(site)/account/orders/page.tsx` | Order history: table with order link, date, status badge, total, view link. |
| `app/(site)/account/orders/[id]/page.tsx` | Order detail: status badge, items table, summary card, shipping address, notes. |
| `app/(site)/account/page.tsx` | “Order history” button linking to `/account/orders`. |

## How to test buyer order history locally

1. **Prerequisites**
   - Migrations applied. At least one order placed as a buyer (complete checkout with a customer account).

2. **Log in as the buyer** who placed the order(s).

3. **Order history**
   - Open `/account` and click “Order history”, or go directly to `/account/orders`.
   - You should see a table of your orders: order id (truncated, link), date, status badge, total, and “View” link.
   - If you have no orders, the empty state message appears.

4. **Order detail**
   - Click an order id or “View” for one order.
   - You should land on `/account/orders/[id]`.
   - Check: status badge at top, “Items” table (product names, qty, unit price, total), “Summary” (subtotal, shipping, tax, total), “Shipping address” block, and “Notes” if you had entered any.
   - Use “Back to order history” to return to the list.

5. **Isolation**
   - Log in as a different user who has no orders (or use an order id from another user). Visit `/account/orders` – only that user’s orders appear. Visit `/account/orders/[other-user-order-id]` – 404.

6. **Status badge**
   - Status is shown as a badge (e.g. pending, shipped, delivered, cancelled). If you change an order’s status in Supabase (e.g. seller updates it), refresh the buyer order detail page and the badge should match.
