# Seller application flow – how to test locally

End-to-end flow: customer signs up → submits seller application → admin reviews → admin approves or rejects → approved seller gets access to `/seller`.

---

## 1. Prerequisites

- MASA schema applied in Supabase (including `002_seller_application_license.sql` for `license_path`).
- Storage bucket **store-licenses** created and policies set (see **supabase/STORAGE_SETUP.md**).
- App running: `npm run dev`, open http://localhost:3000.

---

## 2. Create the storage bucket (one-time)

1. Supabase Dashboard → **Storage** → **New bucket**.
2. Name: **store-licenses**, leave **Public** off.
3. In **Policies** for `store-licenses`, add:
   - **INSERT:** Allow authenticated users to upload. Policy: `bucket_id = 'store-licenses' AND (storage.foldername(name))[1] = auth.uid()::text` (both USING and WITH CHECK if required).
   - **SELECT:** Same expression so users can read their own files.

Details: **supabase/STORAGE_SETUP.md**.

---

## 3. Test the full flow

### Step 1: Customer signs up

1. Open http://localhost:3000/register.
2. Register with a new email (e.g. **customer@test.com**) and password.
3. You should be redirected to the homepage (or `/account`) as a customer.

### Step 2: Customer submits a seller application

1. Go to **Become a seller** (footer link) or open http://localhost:3000/apply.
2. If not logged in, sign in or use **Register** (seller links use `/register?intent=seller` to open the seller signup path, then you are sent to `/apply`).
3. On **Choose your plan**, pick **Basic** or **Premium** → you are taken to `/apply/form`.
4. Fill the application form:
   - **Full name**, **Email**, **Phone**
   - **Store name**, **Store description**, **Store location**
   - **Store license**: upload a PDF or image (required).
5. Click **Submit application**.
6. You should be redirected to `/apply/success?plan=basic` or `premium` and receive a confirmation email. The account page can still show a banner if you use an older `?applied=1` link.
7. Visiting **/apply** again should show “You have already submitted an application” with status **Pending**.

### Step 3: Admin reviews the application

1. Sign in as an **admin** (e.g. **admin@masa.com** with role `admin` in `profiles`).
2. Go to http://localhost:3000/admin (or use the navbar profile → Dashboard for admin).
3. Open **Seller Applications** (sidebar or /admin/seller-applications).
4. You should see the new application with Applicant, Email, Store name, Status **pending**, Date, and **Approve** / **Reject** buttons.

### Step 4: Admin approves or rejects

**Approve:**

1. Click **Approve** on the application.
2. The row should update: status → **approved**, Actions → “—”.
3. In Supabase:
   - **profiles**: that user’s `role` is set to **seller**.
   - **seller_applications**: `status = 'approved'`, `reviewed_by` and `reviewed_at` set.

**Reject:**

1. Alternatively, click **Reject**.
2. Status → **rejected**; `profiles.role` stays **customer**.

### Step 5: Approved seller gets access to /seller

1. Sign out (or use an incognito window) and sign in as **customer@test.com** again.
2. After login you should be redirected to **/seller** (because `profile.role` is now **seller**).
3. Navbar profile menu → **Seller** (dashboard) should go to **/seller**.
4. The seller can now use the seller dashboard and, per schema/RLS, create stores and products (after running the seller seed if you want a pre-created store).

---

## 4. Quick checklist

| Step | Action | Where |
|------|--------|--------|
| 1 | Customer registers | /register |
| 2 | Customer submits application (form + license upload) | /apply (footer “Become a seller”) |
| 3 | Admin opens seller applications | /admin → Seller Applications |
| 4 | Admin approves (or rejects) | Approve / Reject on the row |
| 5 | Approved user logs in → redirect to /seller | Login as that user |

---

## 5. Files involved

- **Form:** `app/(site)/apply/page.tsx`, `components/seller/SellerApplicationForm.tsx` (full name, email, phone, store name, description, license upload → `seller_applications` + Storage **store-licenses**).
- **Admin list + actions:** `app/admin/seller-applications/page.tsx` (loads from Supabase), `app/admin/seller-applications/actions.ts` (approve/reject server actions), `ApplicationActions.tsx` (Approve/Reject buttons).
- **Schema:** `seller_applications` (including `license_path` from migration 002); **store-licenses** bucket for uploads.
- **Redirect after login:** Handled by existing auth flow using `profile.role` (seller → /seller).
