# Public marketplace – Supabase data and visibility

The public marketplace (homepage, Discover, product detail, store profile) is wired to **real Supabase data**. Only products and stores that meet visibility rules are shown.

## Why an uploaded product might not appear

A seller’s product can be created successfully but still **not show on the public site** for these reasons:

1. **Product status is `draft` (most common)**  
   The product form allows statuses: `draft`, `active`, `archived`, `out_of_stock`.  
   **RLS** (Row Level Security) only exposes products where:
   - `deleted_at IS NULL`
   - `status IN ('active', 'out_of_stock')`  
   So **draft** and **archived** products are hidden from the public. If the seller leaves the default status as **draft**, the product will not appear until they change it to **active** (or **out_of_stock** when applicable).

2. **Store status is not `active`**  
   The public API only shows products from stores with `status = 'active'`. Stores that are **suspended** or **closed** will not have their products listed.

3. **Product is soft-deleted**  
   If `deleted_at` is set, the product is hidden by RLS and will not appear anywhere in the public marketplace.

4. **Missing image**  
   The UI can still render a product with no images (a placeholder is used). So missing images do **not** by themselves hide a product; they only affect how it looks.

**Summary:** The usual case is **status = draft**. Have the seller set the product status to **active** (or **out_of_stock**) in the seller dashboard so it appears on the public marketplace.

## What is considered “valid” for public visibility

- **Products:**  
  - `deleted_at IS NULL`  
  - `status IN ('active', 'out_of_stock')`  
  - Store has `status = 'active'`

- **Stores:**  
  - `status = 'active'`  
  (Store profile page and store-scoped product lists only show active stores.)

## How to test public marketplace visibility locally

1. **Start the app and ensure Supabase is configured**  
   - `npm run dev`  
   - `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `SUPABASE_SERVICE_ROLE_KEY`).

2. **Create a product as a seller and make it visible**  
   - Log in as a seller.  
   - Create a product (title, price, category, etc.).  
   - Set **Status** to **Active** (not Draft).  
   - Save. Optionally add at least one image.

3. **Confirm the store is active**  
   - In Supabase Dashboard → Table Editor → `stores`, ensure the store’s `status` is `active`.

4. **Check the public pages (no login)**  
   - **Homepage** (`/`): “Featured Collection” and “Trending Now” should show public products from Supabase (including your product if it’s active).  
   - **Discover** (`/discover`): List should match public products; filter by category if needed.  
   - **Product page** (`/product/[id]`): Use the product’s UUID from the URL or from the seller dashboard; the page should load only for public-visible products (active/out_of_stock, not deleted, store active).  
   - **Store page** (`/store/[slug]`): Use the store’s `slug`; you should see the store and its public products.

5. **Verify a product is hidden when it should be**  
   - In Supabase, set the product’s `status` to `draft` (or set `deleted_at`).  
   - Reload the marketplace: the product should no longer appear on homepage, Discover, or store page, and `/product/[id]` should 404.

## Data flow (for developers)

- **Server-only:** `lib/data/public.ts` uses `createClient()` from `@/lib/supabase/server` to query `products` (with `stores` and `product_images`). RLS applies, so only rows allowed by policies are returned. The layer also filters to stores with `status = 'active'` and maps DB rows to the app’s `Product` and `Store` types.
- **Pages:**  
  - Homepage: `getFeaturedPublicProducts(4)` and `getPublicProducts({ limit: 8 })`.  
  - Discover: `getPublicProducts({ category })` (category from `searchParams`).  
  - Product detail: `getPublicProductById(id)` → 404 if not found or not public.  
  - Store profile: `getPublicStoreBySlug(slug)` and `getPublicProductsByStore(storeId)`.

No mock or sample product data is used on these pages; they all read from Supabase.
