# RLS Fix: 42P17 / Seller Application Submit

## What Caused the Error

PostgreSQL error **42P17** (invalid object definition) can appear as **infinite recursion in policy for relation** when Row Level Security policies reference the same table they protect (or a chain that leads back).

### The problematic policy: `store_members`

On **`store_members`**, the SELECT policy *"Store members viewable by store members"* contained:

```sql
EXISTS (SELECT 1 FROM public.store_members sm WHERE sm.store_id = store_id AND sm.user_id = auth.uid())
```

To decide whether you can read a row from `store_members`, Postgres had to run a query on `store_members` again. That query is also subject to RLS, so the same policy runs again → **infinite recursion**. That can surface as 42P17 or as a recursion error.

This could be triggered during seller application submit because:

- The Supabase client or session can touch multiple tables (e.g. schema or session checks).
- Any code path that eventually checks `store_members` (e.g. nav, sidebar, or a future feature) would hit this policy and recurse.

So the **policy that caused the problem** was the **`store_members` SELECT policy** due to its **self-reference** (subquery on `store_members` inside the policy on `store_members`).

### Secondary issue: seller application upsert

The form uses **upsert** (insert or update by `user_id`). We had:

- **INSERT** on `seller_applications`: allowed for own row ✅  
- **UPDATE** on `seller_applications`: only admins were allowed ❌  

So when an applicant **updates** an existing application (resubmit), the UPDATE was denied. That could also produce errors or confusing behavior during submit.

---

## What Was Fixed (Migration `005_rls_fix_recursion_seller_applications.sql`)

1. **SECURITY DEFINER helpers (no RLS recursion)**  
   - **`public.current_user_role()`** – returns the current user’s `profiles.role`. Used in admin policies so they don’t read `profiles` under RLS in a nested way.  
   - **`public.is_store_member(p_store_id, p_user_id)`** – returns whether the user is a member of the given store by reading `store_members` with definer rights, so the **policy** no longer queries `store_members` itself.

2. **`store_members` SELECT policy**  
   - Removed the self-referential `EXISTS (SELECT 1 FROM public.store_members ...)`.  
   - Replaced it with **`public.is_store_member(store_id, auth.uid())`**.  
   - Result: same behavior, no recursion.

3. **`seller_applications`**  
   - Admin SELECT/UPDATE policies now use **`public.current_user_role() = 'admin'`** instead of a subquery on `profiles`.  
   - New policy **"Users can update own application"**: `USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)` so applicants can update their own row (upsert works).

4. **Other admin policies**  
   - `reviews` and `analytics_events` admin policies were switched to **`public.current_user_role() = 'admin'`** for consistency and to avoid any `profiles` read under RLS in nested contexts.

---

## What You Need to Run

Apply the migration in Supabase:

1. **Supabase Dashboard** → **SQL Editor**  
2. Paste and run the contents of **`supabase/migrations/005_rls_fix_recursion_seller_applications.sql`**.

Or with the Supabase CLI (from the project root):

```bash
supabase db push
```

Or run the migration file manually in the SQL Editor.

---

## After the Fix

- **Customer (logged-in)** can:
  - Read their own profile (unchanged).
  - Submit one seller application (INSERT).
  - Update their own application / resubmit (UPDATE on own row).
  - View their own application status (SELECT own row).
- **Admin** access to all applications and other admin-only tables is unchanged and uses `current_user_role()`.
- **Store members** visibility is unchanged; recursion is removed by using `is_store_member()`.
