# Seller approval logic (production-ready)

## What happens when admin approves

1. **Application status** → `seller_applications.status` set to `approved`; `reviewed_by` and `reviewed_at` set.
2. **User role** → `profiles.role` set to `seller` for the applicant (`user_id`).
3. **Store creation** (only if the seller does **not** already have a store):
   - One row in **stores** with:
     - `owner_id` = applicant `user_id`
     - `name` = application `business_name` (brand/store name)
     - `slug` = unique slug from name + timestamp
     - `description` = application `business_description`
     - `logo_url` = public URL for `store-logos` + application `logo_path` (if present)
     - `location` = application `store_location`
     - `contact_email` = application `contact_email`
     - `contact_phone` = application `contact_phone`
     - `social_links` = application `social_links` (JSONB)
     - `status` = `active`
   - One row in **store_members** with:
     - `store_id` = new store id
     - `user_id` = applicant `user_id`
     - `role` = `owner`
4. **No duplicate stores** – Before creating a store we check for an existing store with `owner_id = applicant user_id`. If one exists, we only update application + role and skip store + store_members.
5. **Seller dashboard** – `getSellerStore()` returns the store by `owner_id` (or by `store_members`). After approval the seller has a store, so overview, products, orders, analytics, and settings all load that store and no longer show “You don’t have a store yet.”

---

## Database changes

### Migration: `008_stores_from_application_and_public_logos.sql`

- **stores** table – new columns:
  - `location` (TEXT)
  - `contact_email` (TEXT)
  - `contact_phone` (TEXT)
  - `social_links` (JSONB)
- **storage.buckets** – `store-logos` bucket set to **public** so `store.logo_url` can be a permanent public URL.

---

## Files changed

| File | Change |
|------|--------|
| **supabase/migrations/008_stores_from_application_and_public_logos.sql** | New. Adds `location`, `contact_email`, `contact_phone`, `social_links` to `stores`; sets `store-logos` bucket to public. |
| **app/admin/seller-applications/actions.ts** | **approveApplication:** Fetches full application (business_name, description, contact_*, store_location, logo_path, social_links). Updates application status and profile role. Uses service client to check for existing store by `owner_id`; if none, inserts store (with logo public URL, location, contact, social_links) and inserts `store_members` (owner). Revalidates admin and seller paths. |
| **lib/seller.ts** | **getSellerStore:** Select now includes `location`, `contact_email`, `contact_phone`, `social_links` so seller dashboard and settings can use them. |
| **lib/seller-types.ts** | **StoreRow:** Added optional `location`, `contact_email`, `contact_phone`, `social_links`. |
| **docs/SELLER_APPROVAL_LOGIC.md** | This summary. |

---

## Run the migration

In Supabase SQL Editor (or `supabase db push`), run:

**supabase/migrations/008_stores_from_application_and_public_logos.sql**

After that, approving a seller application will create their store (and store_members row) when they don’t already have one, and the seller dashboard will load it automatically.
