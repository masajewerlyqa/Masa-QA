# Seller products flow – how it’s connected and how to test

## How it’s connected to the approved store

Seller product management is already tied to the **store returned by `getSellerStore()`** (the store created when the seller’s application was approved, where they are owner or member).

1. **Products list (own store only)**  
   - `/seller/products` loads `store = getSellerStore()` then `getSellerProducts(store.id)`.  
   - Only products with `store_id = store.id` and `deleted_at IS NULL` are shown.  
   - So the approved seller only sees products for their own store.

2. **Add Product (auto-created store)**  
   - `/seller/products/new` loads `store = getSellerStore()`. If there’s no store, it shows “You don’t have a store yet.”  
   - The form gets `storeId={store.id}` and uploads images to `product-images/{storeId}/...`.  
   - `createProduct()` uses `getSellerStore()` and inserts into `products` with `store_id: store.id`.  
   - So new products are always created for the approved seller’s store.

3. **Edit (only that store’s products)**  
   - `/seller/products/[id]/edit` loads `store = getSellerStore()` and `product = getSellerProductById(id, store.id)`.  
   - `getSellerProductById` returns a product only if it has `product_id = id`, `store_id = store.id`, and is not soft-deleted.  
   - If no product is found, the page returns 404.  
   - `updateProduct()` does the same check before updating.  
   - So edit works only for products that belong to the seller’s store.

4. **Delete (only that store’s products)**  
   - `softDeleteProduct(productId)` uses `getSellerStore()` and `getSellerProductById(productId, store.id)`.  
   - If the product isn’t in their store, it returns an error and does not update.  
   - The update uses `.eq("id", productId).eq("store_id", store.id)`, so only that store’s row can be soft-deleted.  
   - So delete works only for that seller’s store products.

5. **UI**  
   - List, Add, Edit, and Delete use the existing MASA seller dashboard UI (Card, Table, Badge, ProductForm, etc.). No UI change was required for “connecting” to the approved store.

---

## How to test the seller product flow locally

### Prerequisites

- You’ve run migrations (including products, product_images, product-images bucket).
- You have an **approved seller** with a store (submit application → admin approves → store is auto-created).

### 1. Open the products list

1. Log in as that **seller**.
2. Go to **Seller dashboard** → **Products** (`/seller/products`).
3. You should see:
   - “All Products” table (empty at first), and an **Add Product** button.
   - No “You don’t have a store yet” (that would mean `getSellerStore()` returned null).

### 2. Add a product

1. Click **Add Product** (`/seller/products/new`).
2. Fill the form (title, description, category, price, metal type, gold karat, weight, stock, status).
3. Optionally upload one or more images (they go to `product-images/{store_id}/...`).
4. Click **Save product**.
5. You should be redirected to `/seller/products` and the new product should appear in the table.
6. In Supabase, `products` should have one row with your store’s `store_id`.

### 3. Edit a product

1. On the products list, click the **Edit** (pencil) icon for a product.
2. You should land on `/seller/products/[id]/edit` with the form pre-filled.
3. Change a field (e.g. title or price) and click **Save changes**.
4. You should be redirected to the list and see the updated data.
5. Trying to open `/seller/products/<some-other-store-product-id>/edit` in the same session should 404 (product not in your store).

### 4. Delete a product (soft delete)

1. On the products list, click the **trash** icon for a product.
2. Confirm in the dialog.
3. The product should disappear from the list (soft-deleted: `deleted_at` set).
4. In Supabase, that product row should have `deleted_at` set; it will no longer be returned by `getSellerProducts()`.

### 5. Quick checklist

- [ ] Seller sees only their store’s products on `/seller/products`.
- [ ] Add Product works and creates a product with their `store_id`.
- [ ] Edit loads and saves only for products that belong to their store; other products 404.
- [ ] Delete only soft-deletes products that belong to their store.
- [ ] No “You don’t have a store yet” once the seller has an approved store.

### 6. If something fails

- **“You don’t have a store yet”**  
  `getSellerStore()` is null. Ensure the user’s `profiles.role` is `seller` and they have a store: either `stores.owner_id = user.id` or a `store_members` row for that user. Re-approve the application if needed.

- **Add Product fails (e.g. “Store not found”)**  
  Same as above: no store for this seller.

- **Edit shows 404 for a product you created**  
  Confirm in DB that the product’s `store_id` matches the store returned by `getSellerStore()` for that user.

- **Images don’t upload**  
  Check that the `product-images` bucket exists and RLS allows INSERT for paths under the seller’s `store_id` (see migration 004).
