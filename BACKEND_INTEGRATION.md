# MASA – Backend Integration Guide

This document describes what is **ready** in the current Next.js frontend and what still needs **backend/API integration** for production.

**Supabase:** Domain types live in `lib/types/database.ts` (Product, Store, Order, CartItem). Use these as the app contract; map Supabase generated types to them or extend as needed. Replace `lib/data` getters and sample arrays with Supabase client calls. See also `AUDIT_REPORT.md` for what was audited and what is ready for backend connection.

---

## What Is Ready (Frontend-Only)

- **Routing & layout**
  - Public site: `/`, `/discover`, `/product/[id]`, `/store/[slug]`, `/cart`, `/checkout`, `/login`, `/register`
  - Admin: `/admin`, `/admin/seller-applications`, `/admin/sellers`, `/admin/stores`, `/admin/products`, `/admin/orders`, `/admin/analytics`, `/admin/settings`
  - Seller: `/seller`, `/seller/products`, `/seller/products/new`, `/seller/products/[id]/edit`, `/seller/orders`, `/seller/analytics`, `/seller/settings`
- **Design system**
  - Brand colors (primary `#531C24`, secondary `#E7D8C3`), fonts (Cinzel, Inter, Almarai), Tailwind theme
- **Reusable components**
  - Navbar, Footer, Hero, ProductCard, StoreCard, FilterSidebar, DashboardSidebar, DataTable, StatsCard, Modal (Dialog), Button, Input, Card, Badge, Tabs, Select, etc.
- **Sample data**
  - Products, stores, cart items, orders, seller applications, transactions live in `lib/data/` and are used so every page renders with placeholder content.

---

## What Needs Backend Integration

### 1. Authentication

- **Login / Register** (`/login`, `/register`)
  - Currently static forms; no API calls.
  - **TODO:** Connect to your auth API (e.g. NextAuth, custom JWT), persist session, protect admin/seller routes.

### 2. Public site

- **Discover / Marketplace** (`/discover`)
  - Products and filters use `lib/data` only.
  - **TODO:** Replace with API: list products with filters (category, price, metal, brand), sort, pagination.
- **Product detail** (`/product/[id]`)
  - Product and related products from `getProductById` / sample data.
  - **TODO:** Fetch product by ID/slug from API; related products from API.
- **Store profile** (`/store/[slug]`)
  - Store and products from `getStoreBySlug` / `getProductsByStore`.
  - **TODO:** Fetch store and store products from API.
- **Cart** (`/cart`)
  - Cart from `sampleCartItems` and `getCartWithProducts`.
  - **TODO:** Load cart from API or context (e.g. user/session), update quantities, remove items via API.
- **Checkout** (`/checkout`)
  - Form only; order summary is static.
  - **TODO:** Submit order to API, payment gateway integration, order confirmation.

### 3. Admin dashboard

- **Overview** (`/admin`)
  - Stats, charts, and tables use sample data.
  - **TODO:** Replace with API: platform KPIs, revenue/users trends, category distribution, pending sellers, recent transactions.
- **Seller applications** (`/admin/seller-applications`)
  - **TODO:** List from API, approve/reject via API.
- **Sellers / Stores / Products / Orders**
  - All use `lib/data` and DataTable.
  - **TODO:** Paginated list APIs, search/filters, optional export.

### 4. Seller dashboard

- **Overview** (`/seller`)
  - Stats, charts, product table, orders from sample data.
  - **TODO:** Replace with API: seller KPIs, revenue/orders, inventory, recent orders.
- **Products** (list, add, edit)
  - **TODO:** CRUD APIs for products (create, update, delete, list with pagination).
- **Orders / Analytics / Settings**
  - **TODO:** Orders list and status updates from API; analytics from API; settings (store profile, etc.) from API.

### 5. Images

- Product and store images use URLs (e.g. Unsplash) and `next/image` with `remotePatterns` in `next.config.mjs`.
  - **TODO:** When you have your own media API/storage, add those domains to `remotePatterns` and use returned URLs in product/store data.

---

## Suggested API Surface (High Level)

- `GET /api/products` (query: category, minPrice, maxPrice, brand, sort, page, limit)
- `GET /api/products/:id`
- `GET /api/stores` (optional, for admin)
- `GET /api/stores/:slug` and `GET /api/stores/:id/products`
- `GET /api/cart`, `PATCH /api/cart`, `POST /api/orders` (checkout)
- `POST /api/auth/login`, `POST /api/auth/register`, session handling
- Admin: `GET /api/admin/stats`, `GET /api/admin/seller-applications`, `PATCH /api/admin/seller-applications/:id`, `GET /api/admin/sellers`, `GET /api/admin/stores`, `GET /api/admin/products`, `GET /api/admin/orders` (or transactions)
- Seller: `GET /api/seller/stats`, `GET /api/seller/products`, `POST /api/seller/products`, `PATCH /api/seller/products/:id`, `GET /api/seller/orders`, `PATCH /api/seller/orders/:id`, `GET /api/seller/analytics`, `GET/PATCH /api/seller/settings`

---

## Running the Project

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Public site: navigate from home to discover, product, store, cart, checkout, login, register.
- Admin: go to `/admin` (and sub-routes).
- Seller: go to `/seller` (and sub-routes).

No backend is required for the current UI; all data is from `lib/data` and sample placeholders.
