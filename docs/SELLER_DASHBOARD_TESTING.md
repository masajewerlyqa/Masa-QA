# Seller dashboard – testing with real Supabase data

The seller dashboard is wired to Supabase. Sellers only see data for their own store(s).

---

## Prerequisites

- Seller with an approved application and at least one store (e.g. run **supabase/seed-seller-dev.sql** for seller@masa.com).
- Log in as that seller and open **/seller**.

---

## 1. Overview (`/seller`)

**What it uses:** Store name, stats (product count, order count, total revenue, avg order value), revenue-by-month chart, recent products, recent orders.

**How to test:**
1. Log in as a seller (e.g. seller@masa.com).
2. Go to **/seller** (or use navbar → profile → Seller).
3. **Welcome:** Should show “Welcome back, {store name}” (e.g. “Welcome back, MASA Dev Store”).
4. **Stats cards:** Total Revenue, Total Orders, Products Listed, Avg. Order Value – all from your store’s data. With an empty store you’ll see 0s.
5. **Revenue trend / Sales by month:** Charts use revenue from order_items for your store’s products (current year). Empty store → zeros.
6. **Products tab:** Table of your store’s products (id, name, price, stock, status). “Add Product” goes to /seller/products/new. View/Edit link to product or edit page.
7. **Recent Orders tab:** Orders that include at least one item from your store (order id, customer, items, amount, status, date).

**If you have no store:** You see “You don’t have a store yet” and a link home. Create a store (or run the seller seed) and try again.

---

## 2. Products (`/seller/products`)

**What it uses:** Products for the seller’s store only (`products.store_id` = store id).

**How to test:**
1. Go to **/seller/products**.
2. Table lists all products for your store (name, price, stock, status, actions).
3. With no products you see “No products yet. Add your first product.”
4. **Add Product** → /seller/products/new (form not yet wired to Supabase; add product via Supabase or wire the form in a follow-up).
5. View → /product/{id}. Edit → /seller/products/{id}/edit.

---

## 3. Orders (`/seller/orders`)

**What it uses:** Orders that have at least one order_item whose product belongs to your store. Shows order id, customer name (from profiles), item summary (your store’s items only), total, status, date.

**How to test:**
1. Go to **/seller/orders**.
2. Table shows only orders that contain your store’s products.
3. With no such orders you see “No data to display” (DataTable empty state).
4. To get data: create products in your store, then (as a customer) place an order that includes those products. Then as the seller you’ll see that order here.

---

## 4. Analytics (`/seller/analytics`)

**What it uses:** Same stats as overview (product count, order count, total revenue, avg order value) plus revenue-by-month for the current year.

**How to test:**
1. Go to **/seller/analytics**.
2. Four stat cards match the overview (Total Revenue, Total Orders, Products Listed, Avg. Order Value).
3. **Revenue Trend** and **Revenue by Month** charts use real revenue from order_items for your store’s products, grouped by month. New store → flat at 0.

---

## 5. Settings (`/seller/settings`)

**What it uses:** Loads the seller’s store row; form updates `stores` (name, slug, description, logo_url, banner_url).

**How to test:**
1. Go to **/seller/settings**.
2. Form is pre-filled with current store name, slug, description, logo URL, banner URL.
3. Change any field and click **Save changes**.
4. You should see “Settings saved.” and the form stays updated.
5. Revisit **/seller** or refresh – welcome message and any displayed store info should reflect the new name/description.

**Note:** Slug must stay unique. If you change it to one that already exists, the update will fail (Supabase unique constraint).

---

## Files changed (summary)

| Area | Files |
|------|--------|
| **Data layer** | **lib/seller.ts** – Server-only helpers: `getSellerStore()`, `getSellerStats(storeId)`, `getSellerProducts(storeId)`, `getSellerOrders(storeId)`, `getSellerRevenueByMonth(storeId)`. Types: `StoreRow`, `ProductRow`, `SellerStats`, `SellerOrderRow`, `RevenueByMonth`. |
| **Overview** | **app/seller/page.tsx** – Server component: auth + store check, fetches stats/products/orders/revenue, passes to client. **app/seller/SellerOverviewClient.tsx** – Client UI: stats cards, revenue charts, products/orders tabs (real data). |
| **Products** | **app/seller/products/page.tsx** – Server component: auth + store, fetches products for store, table with View/Edit/Delete. |
| **Orders** | **app/seller/orders/page.tsx** – Server component: auth + store, fetches orders that have items from store, DataTable. |
| **Analytics** | **app/seller/analytics/page.tsx** – Server: auth + store, fetches stats + revenue by month. **app/seller/analytics/SellerAnalyticsClient.tsx** – Client: stat cards + revenue charts. |
| **Settings** | **app/seller/settings/page.tsx** – Server: auth + store, passes store to form. **app/seller/settings/SellerSettingsForm.tsx** – Client form: load store fields, submit calls action. **app/seller/settings/actions.ts** – Server action: `updateStoreSettings()` updates `stores` row. |

Sample data (e.g. `sampleOrders`, `sampleSellerApplications`) was removed from these seller pages and replaced with Supabase-backed data. The rest of the MASA UI (Cards, Tables, Badges, Buttons, Charts) is unchanged.
