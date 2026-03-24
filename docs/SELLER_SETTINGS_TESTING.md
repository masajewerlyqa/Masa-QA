# How to test the seller settings flow locally

This guide covers testing the full seller path: application → admin approval → store created → seller dashboard settings loading and updating the approved store.

## Prerequisites

- Supabase project running (migrations 001–008 applied, including `stores` columns and `store-logos` bucket public).
- At least one **admin** user and one **customer** user in your app.

## 1. Create a seller application (as customer)

1. Sign out if you’re logged in.
2. Register a new account (or use an existing customer account).
3. On the register page choose **Become a seller** and complete registration.
4. You’ll be redirected to **Apply** (`/apply`). Fill the seller application form:
   - Brand/store name, contact name, email, phone, location, description.
   - Upload a **logo** (optional) and **business certificate/license** (required).
   - Optionally add social links.
5. Submit the application. You should see a success message and be redirected to account.

At this point your profile role is still **customer** and you have **no store**. The application is **pending**.

## 2. Approve the application (as admin)

1. Sign out and sign in as an **admin** user.
2. Go to **Admin → Seller applications** (`/admin/seller-applications`).
3. Find the pending application and click **View** to see details.
4. Click **Approve**.

This will:

- Set the application status to **approved**.
- Set the applicant’s profile **role** to **seller**.
- **Create a store** with the application data (name, logo, location, description, contact email, phone, social links).
- Create a **store_members** row (seller as **owner**).

## 3. Use the seller dashboard and settings (as seller)

1. Sign out and sign in again as the **seller** (the user whose application you approved).
2. Open the **seller dashboard** (`/seller`). You should see the overview with the new store (no “You don’t have a store yet”).
3. Go to **Settings** (`/seller/settings`).

You should see:

- **Store profile**: Brand/store name, URL slug, description, logo (with option to upload a new one), optional banner URL.
- **Contact & location**: Location, contact email, phone (pre-filled from the application).
- **Social links**: Website, Instagram, Facebook, LinkedIn (pre-filled if they were in the application).

4. Change any fields (e.g. store name, location, add a social link) and click **Save changes**.
5. Refresh the page and confirm the values persist. Upload a new logo and save; confirm the logo updates.

## 4. Quick checklist

- [ ] Seller application submitted as customer.
- [ ] Admin approves application; store is created.
- [ ] Seller can open `/seller` and sees the dashboard (no “no store” message).
- [ ] Seller can open `/seller/settings` and sees all sections with data from the approved store.
- [ ] Seller can edit name, description, location, contact email, phone and save.
- [ ] Seller can add or edit social links and save.
- [ ] Seller can upload a new logo and save; logo displays correctly.

## 5. Troubleshooting

- **“You don’t have a store yet” on `/seller` or `/seller/settings`**  
  The user’s role might not be **seller**, or no store was created. In Supabase: check `profiles.role` for that user and `stores.owner_id` (or `store_members`) for a row linking that user to a store. Re-run the approve action or fix data manually.

- **Settings page doesn’t show application data**  
  Ensure migration **008** is applied so `stores` has `location`, `contact_email`, `contact_phone`, `social_links`. Approval must run **after** 008 so the new store is created with those columns.

- **Logo upload fails on settings**  
  Ensure the **store-logos** bucket exists and is **public** (migration 007 + 008), and that RLS allows the authenticated user to INSERT under their own folder (`auth.uid()` as first path segment).

- **Seller can’t update store**  
  RLS on `stores`: “Store owner/members can update store” allows update when `auth.uid() = owner_id` or the user is in `store_members`. Ensure the approved user is the store’s `owner_id` (or has a `store_members` row).
