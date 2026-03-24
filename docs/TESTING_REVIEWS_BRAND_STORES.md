# Testing: reviews, brand pages, store moderation

## 1. Submitting reviews

### Prerequisites

**Run migration `016_reviews_customer_can_view_own.sql`** before testing reviews. Without this, customers cannot SELECT their own pending reviews due to RLS, which breaks submission.

### What was wrong (fixed by migration 016)

The original RLS policy for reviews was:

```sql
CREATE POLICY "Approved reviews viewable by everyone"
  ON public.reviews FOR SELECT USING (status = 'approved');
```

This meant customers **could not read their own pending reviews**. So:
1. First submit → INSERT succeeded (INSERT policy allows `auth.uid() = customer_id`)
2. Page revalidated → `getCustomerReviewForProduct` tried to SELECT the review
3. RLS blocked it because `status = 'pending'` (not `'approved'`)
4. `getCustomerReviewForProduct` returned `null` → review didn't show in UI
5. Second submit → `submitReview` thought no review existed → tried INSERT again → **duplicate key error**

The fix adds:

```sql
CREATE POLICY "Customers can view own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = customer_id);
```

Now customers can SELECT their own reviews regardless of status, so:
- `getCustomerReviewForProduct` finds the pending review
- The product page shows it with a "Pending" badge
- On second submit, `submitReview` sees the existing review and UPDATEs instead of INSERTing

### How to test

- **Setup:** Sign in as a **customer** who has **purchased** the product (place an order including that product, then go to the product page).
- Open a product page → **Reviews** tab.
- If you haven't purchased the product, you'll see: "Reviews are reserved for customers who have purchased this product."
- If you have purchased it, you'll see the "Write a review" form (rating, optional title, optional comment).
- Submit a review:
  - After **Submit review**, the page should refresh and your review should **appear immediately** in the list above the form (with a "Pending" badge until it's approved).
- If you already have a review, the form shows "Update review"; updating and submitting should again refresh and show the updated text in the list.

---

## 2. Viewing brand profiles

- **Brand page URL:** `/brand/[slug]` where `slug` is the store's slug (e.g. `/brand/masa-dev-store`).
- From a **product page**: click the **brand name** next to the title; it should go to `/brand/{storeSlug}`.
- On the brand page you should see:
  - Brand logo (or placeholder)
  - Brand name and description
  - Location (if set)
  - Average rating and review count (from approved reviews on the store's products)
  - List of products from that brand
  - "View marketplace" link to `/discover`.

**How to get a store slug:** Use a store that has `status = 'approved'` (or `active` before migration). Slug is in the stores table (e.g. from admin stores list or from a product's store).

---

## 3. Approving stores as admin

- **Run the migration** so store status supports moderation:
  - Apply `supabase/migrations/015_store_moderation_status.sql` (adds `pending`, `approved`, `rejected`; migrates `active` → `approved`; default new stores to `pending`).
- Sign in as an **admin** user.
- Go to **Admin → Stores** (e.g. `/admin/stores`).
- You should see three sections:
  - **Pending:** stores awaiting approval (new stores created when an application is approved).
  - **Approved:** stores visible in the marketplace (after migration, previously "active" stores appear here).
  - **Rejected:** stores you have rejected.
- **Approve:** For a pending or rejected store, click **Approve**; it should move to Approved and appear in the marketplace (e.g. on `/discover` and on brand page).
- **Reject:** For a pending or approved store, click **Reject**; it should move to Rejected and disappear from the marketplace (and from brand page if you use "approved" only).
- Only **approved** stores (and their products) should appear in the marketplace and on public brand pages.

**Creating a new store:** Have a seller complete an application; when an admin approves the **seller application**, a store is created with `status: 'pending'`. That store appears under Pending on `/admin/stores` until an admin clicks **Approve**.
