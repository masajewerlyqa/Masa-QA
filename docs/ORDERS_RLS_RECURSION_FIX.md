# Orders RLS infinite recursion fix

## Error

`infinite recursion detected in policy for relation orders` (PostgreSQL 42P17)

This occurred during checkout when inserting into `orders` and then into `order_items`.

---

## Which policy caused the recursion

The recursion was caused by the **orders** SELECT policy **"Sellers can view orders containing their store products"** (from migration `009_seller_orders_rls.sql`), in combination with the **order_items** SELECT policy **"Sellers can view order items for their store products"** and the **order_items** INSERT policy **"Order items insert with order"**.

### Why it recurses

1. **Checkout inserts an order**, then inserts rows into **order_items**. The **order_items** INSERT policy is:
   - `WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid()))`
   So Postgres must evaluate a **SELECT on `orders`** to allow the insert.

2. For **any** SELECT on `orders`, **all** SELECT policies on `orders` are evaluated (they are OR’d). One of them is **"Sellers can view orders containing their store products"**:
   - `USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM public.order_items oi JOIN public.products p ... WHERE oi.order_id = orders.id ...))`
   So Postgres runs a **SELECT on `order_items`** (and products) to evaluate this policy.

3. For that SELECT on **order_items**, **all** SELECT policies on `order_items` are evaluated. One of them is **"Sellers can view order items for their store products"**:
   - `USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()) OR ...)`
   So Postgres runs a **SELECT on `orders`** again.

4. That brings us back to step 2: evaluating SELECT on `orders` again, which again queries `order_items`, which again queries `orders` → **infinite recursion**.

So the cycle is: **orders** (SELECT) → **order_items** (SELECT) → **orders** (SELECT) → …

The policy that **introduces** the cycle is the **orders** policy that reads **order_items**. The **order_items** policy that reads **orders** completes the loop. The recursion is triggered as soon as we need to check `orders` (e.g. when inserting into `order_items` or when a seller/customer reads data).

---

## Fix (migration `014_orders_rls_fix_recursion.sql`)

### 1. SECURITY DEFINER helpers

Two functions run with **SECURITY DEFINER** and a fixed `search_path`, so they read `orders` / `order_items` **without** going through RLS. That breaks the cycle.

- **`order_belongs_to_customer(p_order_id uuid, p_user_id uuid)`**  
  Returns true if the order’s `customer_id` equals `p_user_id`. Used whenever we need “is this order owned by this user?” without triggering orders RLS (e.g. in order_items INSERT and in order_items SELECT for customers).

- **`order_has_products_from_seller(p_order_id uuid, p_seller_uid uuid)`**  
  Returns true if the order has at least one `order_items` row whose product belongs to a store the seller owns or is a member of. Used in **orders** SELECT and UPDATE for sellers so we never evaluate a policy that itself selects from `order_items` under RLS.

### 2. Policy changes

| Table       | Policy name                                              | Change |
|------------|-----------------------------------------------------------|--------|
| `orders`   | Sellers can view orders containing their store products   | `USING` no longer queries `order_items`; use `order_has_products_from_seller(id, auth.uid())` instead. |
| `orders`   | Sellers can update orders containing their store products | Same: use `order_has_products_from_seller(id, auth.uid())`. |
| `order_items` | Order items viewable with order                        | `USING` no longer `EXISTS (SELECT ... FROM orders ...)`; use `order_belongs_to_customer(order_id, auth.uid())`. |
| `order_items` | Order items insert with order                         | `WITH CHECK` no longer `EXISTS (SELECT ... FROM orders ...)`; use `order_belongs_to_customer(order_id, auth.uid())`. |
| `order_items` | Sellers can view order items for their store products  | First branch no longer `EXISTS (SELECT ... FROM orders ...)`; use `order_belongs_to_customer(order_id, auth.uid())`. Second branch (product in seller’s store) still only touches `products` and `stores`/`is_store_member`, so no recursion. |

Behavior is unchanged from a security perspective:

- Customers can insert and read only their own orders; they can read only their own order_items (via “viewable with order” and “order belongs to customer”).
- Sellers can read/update only orders that contain products from their store(s), and can read only those order_items (via the seller order_items policy).
- Admins can read all orders (unchanged; uses `current_user_role()`).
- Checkout can insert an order and its order_items because the insert checks use the definer helpers and no longer create an orders → order_items → orders RLS cycle.

---

## How to apply

Run the migration in Supabase (SQL Editor or `supabase db push`):

```bash
# If using Supabase CLI
supabase db push
```

Or run the contents of `supabase/migrations/014_orders_rls_fix_recursion.sql` in the Supabase Dashboard → SQL Editor.
