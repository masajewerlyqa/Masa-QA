# Wishlist and cart – real Supabase data

Wishlist and cart are persisted in Supabase for logged-in users. Only public (active) products can be added.

## Behavior

- **Wishlist**
  - One wishlist per user (`wishlists.user_id` unique). Items stored in `wishlist_items` (wishlist_id, product_id).
  - Add: product page or ProductCard heart → `addToWishlist(productId)`.
  - Remove: click heart again (toggle) or remove from wishlist page.
  - Wishlist page: `/wishlist` (redirects to login if not signed in). Shows product cards; heart is filled and removes when clicked.

- **Cart**
  - One cart per user (`carts.user_id` unique). Items in `cart_items` (cart_id, product_id, quantity).
  - Add: product page “Add to Cart” or ProductCard “Quick Add” → `addToCart(productId, quantity)`. Adding the same product again increases quantity.
  - Update quantity: on cart page, +/- buttons or (if you add it) quantity input → `updateCartQuantity(productId, quantity)`. Quantity &lt; 1 removes the line.
  - Remove: trash button on cart page → `removeFromCart(productId)`.
  - Cart page: `/cart` (redirects to login if not signed in). Order summary and “Proceed to Checkout” / “Continue Shopping”.

- **Navbar**
  - Wishlist and cart icons show counts when &gt; 0 (from `getWishlistCount` and `getCartCount` in layout). Wishlist links to `/wishlist`, cart to `/cart`.

- **ProductCard & product page**
  - Heart: when `isInWishlist` is passed (from server using `getWishlistProductIds`), heart is filled; click toggles (add/remove).
  - “Quick Add” / “Add to Cart”: calls `addToCart(productId, 1)` and refreshes so navbar count updates.

## Database (migration 010)

- **carts**: id, user_id (unique), created_at, updated_at.
- **cart_items**: id, cart_id, product_id, quantity (≥ 1), created_at, updated_at. Unique (cart_id, product_id).
- RLS: users can manage their own cart and cart items.

Wishlist tables and RLS already existed in the schema (001).

## How to test wishlist and cart locally

1. **Apply migrations**
   - Ensure `010_carts.sql` is applied (carts + cart_items + RLS):
     ```bash
     npx supabase db push
     ```
   - Or run the migration in the Supabase SQL Editor.

2. **Create a buyer account**
   - Register or use an existing user. Role can be customer or any; wishlist/cart work for any logged-in user.

3. **Wishlist**
   - Log in and open Discover or a product page.
   - Click the heart on a product card or the heart on a product detail page. The heart should fill and the navbar wishlist count should increase.
   - Open `/wishlist`. The product appears. Click the heart again on the card to remove it; the list and navbar count update.
   - Add several products from different pages, then open `/wishlist` again and confirm all appear. Remove one by one and confirm counts.

4. **Cart**
   - From a product page, click “Add to Cart”. Navbar cart count increases. Open `/cart` and confirm the item and quantity.
   - Click “+” to increase quantity and “−” to decrease; confirm line total and order summary update. Remove the line with the trash button and confirm the cart is empty (or other items remain).
   - From Discover or homepage, use “Quick Add” on a product. Confirm the cart gains that product (or quantity increases if already in cart). Open `/cart` and adjust quantity or remove.

5. **Persistence**
   - Add items to wishlist and cart, then log out (or use another browser/incognito). Log back in. Wishlist and cart should be unchanged.

6. **Not logged in**
   - Visit `/cart` or `/wishlist`; you should be redirected to login. After logging in, you can use wishlist and cart as above.

## Files involved

| Area | Files |
|------|--------|
| DB | `supabase/migrations/010_carts.sql` |
| Server data | `lib/customer.ts` (getOrCreateWishlist, getWishlistProductIds, getWishlistProducts, getWishlistCount, getOrCreateCart, getCartItems, getCartCount, getCartWithProducts) |
| Actions | `app/(site)/wishlist/actions.ts` (addToWishlist, removeFromWishlist, toggleWishlist), `app/(site)/cart/actions.ts` (addToCart, updateCartQuantity, removeFromCart) |
| UI | `components/customer/WishlistHeartButton.tsx`, `components/customer/AddToCartButton.tsx`, `components/ProductCard.tsx` (heart + Quick Add), `app/(site)/wishlist/page.tsx`, `app/(site)/cart/page.tsx`, `app/(site)/cart/CartItemRow.tsx` |
| Layout / Navbar | `app/(site)/layout.tsx` (wishlist/cart counts), `components/Navbar.tsx` (counts + link to /wishlist) |
