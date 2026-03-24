# Seller dev account setup (seller@masa.com)

This explains how to make **seller@masa.com** an approved seller so they can access `/seller` and own a store, in line with the MASA schema.

---

## 1. What “approved seller” means in the schema

For a user to behave as an approved seller:

| Requirement | Table | Purpose |
|-------------|--------|--------|
| **Role = seller** | `profiles` | App redirects to `/seller` and shows Seller dashboard link. RLS allows seller-only actions when `profiles.role = 'seller'`. |
| **Approved application** | `seller_applications` | One row per user (`UNIQUE(user_id)`). RLS “Store owners can insert store” requires an **approved** application for the current user. |
| **Store** | `stores` | At least one store with `owner_id` = that user. Seller dashboard and products are scoped to stores. |
| **Store membership** | `store_members` | Optional but recommended: one row linking the user to their store with role `owner`, so membership-based RLS and future “my stores” logic work. |

So for **seller@masa.com** we need:

1. **profiles**: `role = 'seller'` (and profile row existing).
2. **seller_applications**: One row for that user with `status = 'approved'`.
3. **stores**: One store with `owner_id` = that user’s id (e.g. slug `masa-dev-store`).
4. **store_members**: One row (store_id, user_id, role = `owner`).

---

## 2. Prerequisite: user must exist in Auth

The script uses **auth.users**. The user **seller@masa.com** must already exist there.

- **Option A (recommended):** In the app, go to **Register**, create an account with email **seller@masa.com** and a password. The trigger will create a row in **profiles** with default role `customer`.
- **Option B:** Create the user in Supabase Dashboard → **Authentication** → **Users** → “Add user” with email **seller@masa.com**.

After that, run the SQL below so that profile, application, store, and membership are correct.

---

## 3. SQL to run in Supabase

Run the script **once** (after the user exists):

1. Open **Supabase Dashboard** → **SQL Editor**.
2. Paste the contents of **`supabase/seed-seller-dev.sql`** (or the SQL below).
3. Run it.

If **seller@masa.com** is not in **auth.users**, the script will raise an error and tell you to sign up first.

What the script does:

- Finds **user_id** from **auth.users** where `email = 'seller@masa.com'`.
- **profiles**: Inserts or updates a row so `role = 'seller'` and `email` is set.
- **seller_applications**: Inserts or updates (on `user_id`) so there is one **approved** application (business name “MASA Dev Store”, contact email seller@masa.com).
- **stores**: Inserts a store with slug `masa-dev-store` and `owner_id = user_id` if it doesn’t already exist (no duplicate slug).
- **store_members**: Inserts a row for that user and store with role `owner` (ignored if already present).

---

## 4. Exact SQL (copy-paste)

You can use the file **`supabase/seed-seller-dev.sql`** or this version:

```sql
DO $$
DECLARE
  v_user_id UUID;
  v_store_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'seller@masa.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User seller@masa.com not found. Sign up with this email in the app first, then run this script again.';
  END IF;

  INSERT INTO public.profiles (id, role, email, updated_at)
  SELECT v_user_id, 'seller'::masa_role, email, NOW()
  FROM auth.users WHERE id = v_user_id
  ON CONFLICT (id) DO UPDATE SET role = 'seller'::masa_role, email = EXCLUDED.email, updated_at = NOW();

  INSERT INTO public.seller_applications (user_id, status, business_name, business_description, contact_email, reviewed_at, updated_at)
  VALUES (v_user_id, 'approved'::seller_application_status, 'MASA Dev Store', 'Development store for seller@masa.com', 'seller@masa.com', NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET status = 'approved'::seller_application_status, business_name = EXCLUDED.business_name, contact_email = EXCLUDED.contact_email, reviewed_at = COALESCE(public.seller_applications.reviewed_at, NOW()), updated_at = NOW();

  INSERT INTO public.stores (owner_id, name, slug, description, status)
  VALUES (v_user_id, 'MASA Dev Store', 'masa-dev-store', 'Development store for seller@masa.com', 'active'::store_status)
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_store_id FROM public.stores WHERE owner_id = v_user_id LIMIT 1;

  IF v_store_id IS NOT NULL THEN
    INSERT INTO public.store_members (store_id, user_id, role)
    VALUES (v_store_id, v_user_id, 'owner'::store_member_role)
    ON CONFLICT (store_id, user_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Seller setup complete for seller@masa.com (user_id: %, store_id: %)', v_user_id, v_store_id;
END $$;
```

---

## 5. How seller@masa.com can access /seller

- **Login:** Use **seller@masa.com** and the password you set.
- **Redirect:** App uses `profile.role`; with `role = 'seller'` the user is redirected to **/seller** after login.
- **Navbar:** Dashboard link in the profile dropdown points to **/seller** for sellers.
- **RLS:** With an approved **seller_application** and a **store** (and **store_members**), the user can create/update stores and products according to the existing RLS.

No app code changes are required; the logic is already aligned with the schema (role + approved application + store ownership/membership).

---

## 6. Quick checklist

1. User **seller@masa.com** exists in **Authentication** (sign up in app or add in Dashboard).
2. Run **`supabase/seed-seller-dev.sql`** (or the SQL above) in the SQL Editor.
3. Log in as **seller@masa.com** in the app → you should be redirected to **/seller** and see the seller dashboard.
