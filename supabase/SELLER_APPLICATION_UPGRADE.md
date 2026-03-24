# Seller application form upgrade – summary

## New columns on `seller_applications`

| Column | Type | Description |
|--------|------|-------------|
| **contact_full_name** | TEXT | Contact person full name (stored on the application). |
| **store_location** | TEXT | Store or business location (address or city/region). |
| **logo_path** | TEXT | Path to logo image in Storage bucket `store-logos` (e.g. `{user_id}/logo.jpg`). |
| **social_links** | JSONB | Optional social links: `{ website?, facebook?, instagram?, linkedin? }` (URLs as strings). |

Existing columns still used: `business_name` (brand/store name), `business_description` (store description), `contact_email`, `contact_phone`, `license_path` (certificate/license file).

---

## New storage bucket

- **store-logos** (private): logo uploads for seller applications. Path pattern: `{user_id}/{timestamp}-logo.{ext}`. RLS: authenticated users can INSERT/SELECT only under their own `auth.uid()` folder.

---

## Files changed

### New files

- **supabase/migrations/007_seller_application_full_schema.sql** – Adds `contact_full_name`, `store_location`, `logo_path`, `social_links` to `seller_applications`; creates `store-logos` bucket and RLS policies.
- **lib/validations/seller-application.ts** – Zod schema for the form (`brand_store_name`, `contact_full_name`, `email`, `phone`, `store_location`, `store_description`, optional URL fields) and `socialLinksFromForm()` helper.
- **supabase/SELLER_APPLICATION_UPGRADE.md** – This summary.

### Modified files

- **components/seller/SellerApplicationForm.tsx** – Form now includes: brand/store name, contact full name, email, phone, store location, store description, logo upload (optional), business certificate/license upload (required), optional social links (website, Facebook, Instagram, LinkedIn). Uses the new validation schema, uploads logo to `store-logos` and license to `store-licenses`, and saves all new columns. MASA luxury UI kept (Card, font-luxury, sections, labels).
- **app/admin/seller-applications/page.tsx** – Select and `Row` type extended with `contact_full_name`, `store_location`, `logo_path`. Applicant column shows `contact_full_name` when present; new “Location” column added.

---

## Run the migration

In Supabase SQL Editor (or `supabase db push`), run:

**supabase/migrations/007_seller_application_full_schema.sql**

This adds the four new columns and creates the `store-logos` bucket and its RLS policies.
