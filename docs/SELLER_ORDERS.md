# Seller order management

Sellers can view and manage only orders that contain at least one product from their store. Orders list, order detail, and status updates use real Supabase data.

## Behavior

- **Orders list** (`/seller/orders`): Shows all orders that have at least one line item from the seller’s store. Columns: Order ID (link to detail), Customer, Items (summary of this store’s products in the order), Amount (order total), Status, Date.
- **Order detail** (`/seller/orders/[id]`): Shows the same order with:
  - **Items (your store)**: Only the line items for products belonging to the seller’s store (product name, qty, unit price, total).
  - **Customer**: Name and email from profile.
  - **Summary**: Your items subtotal, shipping, tax, order total (order total is the full order amount).
  - **Shipping address** and **Notes** when present.
  - **Status**: Dropdown to update order status (pending → confirmed → processing → shipped → delivered / cancelled).
- **Status update**: Allowed statuses are `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`. Changing the status in the dropdown runs a server action and revalidates the orders list and detail pages.

## RLS (migration 009)

- **orders**: Sellers can SELECT and UPDATE orders that have at least one `order_items` row whose `product_id` belongs to a store the seller owns or is a member of.
- **order_items**: Sellers can SELECT order items for products in their store(s), so they can build the order detail view.

Apply the migration so sellers can read and update these orders:

```bash
npx supabase db push
# or apply supabase/migrations/009_seller_orders_rls.sql in the Supabase SQL Editor
```

## How to test seller order management locally

1. **Apply migration 009**  
   Ensure `009_seller_orders_rls.sql` is applied so sellers can SELECT/UPDATE orders and SELECT order_items for their store products.

2. **Create test data (if needed)**  
   - At least one **seller** with an approved application and a **store** with `status = 'active'`.  
   - At least one **product** in that store with `status = 'active'`.  
   - At least one **customer** (profile with role `customer`).  
   - One **order** for that customer containing at least one **order_item** for the store’s product:
     - In Supabase: Table `orders` — insert a row with `customer_id` = the customer’s profile id, `status` = `'pending'`, `subtotal`, `shipping_cost`, `tax`, `total` as needed.  
     - Table `order_items` — insert a row with `order_id`, `product_id` (your store’s product), `quantity`, `unit_price`, `total_price`.

3. **Log in as the seller**  
   Use the same user that owns (or is a member of) the store.

4. **Orders list**  
   - Open `/seller/orders`.  
   - You should see the order you created (only orders that include at least one of your store’s products).  
   - Click the order ID link (e.g. first 8 chars of UUID) to open the order detail page.

5. **Order detail**  
   - On `/seller/orders/[id]` you should see: Items (your store) table, customer info, summary, and the status dropdown.  
   - Change the status (e.g. to `confirmed` or `shipped`) and confirm the dropdown updates and the list/detail stay in sync after refresh.

6. **Isolation**  
   - Create another store (different seller) and an order that only contains products from that other store.  
   - Log in as the first seller: that order must **not** appear in `/seller/orders`.  
   - Log in as the other seller: only their orders should appear.

7. **Dashboard overview**  
   - On `/seller` the “Recent Orders” tab should show the same orders as the orders list, with order IDs linking to `/seller/orders/[id]`.

## Files involved

| File | Purpose |
|------|--------|
| `supabase/migrations/009_seller_orders_rls.sql` | RLS so sellers can view/update orders containing their store products and view related order_items. |
| `lib/seller.ts` | `getSellerOrders(storeId)`, `getSellerOrderById(orderId, storeId)`. |
| `lib/seller-types.ts` | `SellerOrderDetail` type for order detail page. |
| `app/seller/orders/page.tsx` | Orders list; order ID links to detail. |
| `app/seller/orders/[id]/page.tsx` | Order detail; items (your store), customer, summary, address, notes, status dropdown. |
| `app/seller/orders/actions.ts` | `updateOrderStatus(orderId, newStatus)` server action. |
| `components/seller/OrderStatusSelect.tsx` | Client dropdown that calls `updateOrderStatus` and keeps UI in sync. |
