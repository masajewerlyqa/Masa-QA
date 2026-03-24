# MASA performance optimizations

This document describes what was causing slowness and what was optimized. The UI and behavior are unchanged.

---

## 1. What was causing slowness

### Homepage
- **Duplicate product fetches:** The page called `getFeaturedPublicProducts(4)` and `getPublicProducts({ limit: 8 })`, so two separate Supabase queries ran. Both hit the same products table with joins (stores, product_images, reviews), doubling work and latency.
- **Auth fetched twice:** Layout and homepage both called `getCurrentUserWithProfile()` (and layout also called wishlist/cart/notification counts), so auth + profile were resolved twice per request.

### Discover / marketplace
- **Unbounded product list:** `getPublicProductsForMarketplace()` had no `limit`, so every matching product was loaded (e.g. hundreds or thousands of rows with joins and review aggregates). This made the discover page slow and heavy as the catalog grew.
- **Heavy filter options query:** `getMarketplaceFilters()` loaded **all products** with an inner join to `stores` just to build the brand list (one row per product). With many products this returned a huge payload and did a lot of work only to dedupe by store.

### Product page
- **Extra full product list for “related”:** The page called `getPublicProducts({ limit: 20 })` and then filtered in JS to 4 “related” items. That meant fetching 20 full product rows (with stores, images, reviews) instead of 4.
- **Unbounded reviews:** `getProductReviews(productId)` loaded every approved review with no limit, so products with many reviews could return a lot of data.

### Seller dashboard
- **All products loaded on overview:** `getSellerProducts(store.id)` returned every product in the store (plus a second query for all product images). The overview only needs a short list (e.g. 10), so this was unnecessary work for large catalogs.

### Images and rendering
- **No request deduplication for auth:** Same `getCurrentUserWithProfile()` result was not shared between layout and page.
- **No image priority/sizes:** Above-the-fold product images did not use `priority` or explicit `sizes`, so the browser could not optimize loading. Category section used plain `<img>` instead of Next.js `Image`.
- **Product cards re-rendered unnecessarily:** List pages (e.g. discover) re-rendered every `ProductCard` when sort or view state changed, even when product data was unchanged.

---

## 2. What was optimized

### Homepage
- **Single product query:** One call to `getPublicProducts({ limit: 8 })`; the first 4 are used as “featured” and all 8 as “trending.” Removed `getFeaturedPublicProducts(4)`.
- **Cached auth:** `getCurrentUserWithProfile` is wrapped in React `cache()` so the same request (e.g. layout + page) only runs the auth + profile fetch once.

### Discover / marketplace
- **Pagination/limit on products:** `getPublicProductsForMarketplace()` now accepts `limit` (default 24, max 100) and `offset`. The discover page passes `limit: 24` so only one page of results is loaded.
- **Lightweight brand filter:** Filter options no longer load all products with store join. They now:
  - Fetch distinct `store_id` from `products` (one column, minimal data).
  - Dedupe in app and then fetch only `stores` rows for those IDs with `id, name, slug` and `status = 'active'`.
  So the brand list is built from a small number of store rows instead of one row per product.

### Product page
- **Dedicated related-products query:** New `getRelatedProducts(productId, storeId, category, 4)` fetches only 4 related products (same store or same category) in one query. Removed `getPublicProducts({ limit: 20 })` and in-memory filtering.
- **Review limit:** `getProductReviews(productId, limit)` now takes a limit (default 20). The product page shows up to 20 reviews instead of loading all.

### Seller dashboard
- **Limit products on overview:** `getSellerProducts(storeId, limit?)` accepts an optional limit. The seller overview page passes `limit: 10` so only 10 products (and their images) are loaded for the dashboard.

### Admin dashboard
- No change to data fetching; it already uses parallel counts and limited “recent” lists. Optional future improvement: aggregate revenue in the DB (e.g. RPC) instead of fetching all order totals.

### Images
- **Next.js Image for category section:** The homepage “Shop by Category” section now uses `next/image` with `fill` and `sizes="(max-width: 1024px) 50vw, 25vw"` for better responsive loading.
- **ProductCard priority and sizes:** ProductCard accepts a `priority` prop (used for the first two featured cards on the homepage). `ImageWithFallback` forwards `priority` and `sizes` so above-the-fold images can be prioritized and sized correctly (e.g. `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw` on cards).

### Re-renders
- **Memoized ProductCard:** `ProductCard` is wrapped in `React.memo()` so list pages (discover, homepage, store) do not re-render every card when only sort or view mode changes; only when product or wishlist props change.

---

## 3. Summary table

| Area            | Cause of slowness                         | Optimization |
|-----------------|--------------------------------------------|--------------|
| Homepage        | Two product queries; auth twice            | One product query; `cache(getCurrentUserWithProfile)` |
| Discover        | All matching products; heavy brand query   | Limit 24 products; lightweight distinct stores for brands |
| Product page    | 20 products for 4 related; all reviews     | `getRelatedProducts(..., 4)`; `getProductReviews(..., 20)` |
| Seller overview | All store products                         | `getSellerProducts(storeId, 10)` |
| Images          | No priority/sizes; raw `<img>` on homepage | `priority` + `sizes` on cards; Next/Image for categories |
| Re-renders      | All cards re-render on sort/view change    | `React.memo(ProductCard)` |

---

## 4. Optional next steps

- **Discover “Load more”:** Use `offset` and a “Load more” button or infinite scroll to fetch the next 24 products without reloading the page.
- **Admin revenue:** Replace “fetch all order totals” with a DB function that returns `sum(total)` for non-cancelled orders so the admin dashboard does not load every order row.
- **Review stats without loading all reviews:** For `getProductReviewStats`, use a single query that returns `count(*)` and `avg(rating)` (e.g. via RPC or raw SQL) instead of fetching all review rows.
