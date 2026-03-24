# Admin dashboard

The admin overview shows **real platform metrics and data** from Supabase.

## Metrics shown

- **Total users** – count of `profiles`
- **Total sellers** – count of profiles with `role = 'seller'`
- **Pending seller applications** – count of `seller_applications` with `status = 'pending'`
- **Total stores** – count of `stores`
- **Total products** – count of `products`
- **Total orders** – count of `orders`
- **Total revenue** – sum of `orders.total` for non-cancelled orders

The dashboard also shows:

- **Recent seller applications** (table with applicant, email, business, status, date; link to full application)
- **Recent orders** (order id, customer, amount, status, date)
- **Product categories** – pie chart from real product `category` values

Access is restricted to users with `profiles.role = 'admin'`. Others are redirected to `/login`.

## How to test admin dashboard analytics locally

1. **Apply migrations**
   - Run `npx supabase db push` (or apply `013_admin_dashboard_policies.sql` in the SQL editor) so admins can read all orders and products.

2. **Create an admin user**
   - Sign up or use an existing user, then in Supabase:
     - Open **Table Editor** → `profiles`
     - Find the user and set `role` to `admin` (or create a profile with `role = 'admin'` for your auth user).

3. **Log in as admin**
   - Open the app (e.g. `http://localhost:3000`), sign in with the admin user, and go to **Admin** (e.g. `/admin`).

4. **Verify metrics**
   - **Total users / Total sellers**: Create more users (or change roles in `profiles`) and refresh; counts should update.
   - **Pending applications**: Submit a seller application (as a non-seller user) from the register or seller application flow; “Pending seller applications” and the “Recent seller applications” table should update.
   - **Stores / Products**: Create stores and products as a seller (or via Supabase); “Total stores” and “Total products” should update.
   - **Orders / Revenue**: Place orders as a customer (cart → checkout); “Total orders” and “Total revenue” should increase. Cancel an order in the DB; revenue should decrease (cancelled orders are excluded from revenue).

5. **Recent seller applications**
   - In the “Recent seller applications” tab, confirm the table lists real applications with correct applicant name, email, business, status, and date. Use “View” to open the application detail page.

6. **Recent orders**
   - Switch to the “Recent orders” tab; confirm orders are listed with order id, customer, amount, status, and date. Data should match Supabase `orders` and linked `profiles`.

7. **Product categories**
   - The “Product categories” pie chart should reflect actual product counts by `category`. Add or edit products with different categories and refresh to see the chart update.

If any metric is 0 or data is missing, check that the logged-in user has `role = 'admin'` and that RLS policies (including `013_admin_dashboard_policies.sql`) are applied so admins can select from `orders`, `order_items`, and `products`.
