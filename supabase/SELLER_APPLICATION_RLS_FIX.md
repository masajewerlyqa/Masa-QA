# Seller application: "new row violates row-level security policy" fix

## Which step was failing

The message **"new row violates row-level security policy"** means an **INSERT** (or the new row in an UPDATE) was rejected by RLS **WITH CHECK**.

In the submit flow:

| Step | Operation | Table / object | Policy that can block |
|------|-----------|----------------|------------------------|
| 1 | Upload license file | `storage.objects` (bucket `store-licenses`) | INSERT policy on `storage.objects` for `store-licenses` |
| 2 | Update full name | `profiles` UPDATE | "Users can update own profile" (USING/WITH CHECK: `auth.uid() = id`) |
| 3 | Insert or upsert application | `seller_applications` INSERT or UPDATE | INSERT: "Users can insert own application"; UPDATE: "Users can update own application" |

**Most likely failure: Step 1 – storage upload.**

- There was **no migration** that created the `store-licenses` bucket or any RLS policies on `storage.objects` for it.
- Supabase Storage **denies all uploads** to a bucket if there is **no INSERT policy** on `storage.objects` for that bucket.
- So the first INSERT into `storage.objects` (the license file) was rejected with "new row violates row-level security policy".

Steps 2 and 3 already had suitable RLS in place (profiles: update own row; seller_applications: insert/update own row). If the error had been on step 2 or 3, the form would now show "Profile update failed: ..." or "Application save failed: ..." after the recent error-handling changes.

---

## Policy that was blocking (step 1)

- **Table:** `storage.objects`
- **Operation:** INSERT (upload to bucket `store-licenses`)
- **Cause:** No INSERT policy existed for the `store-licenses` bucket, so RLS blocked the new row.

---

## Exact SQL fix to run in Supabase

Run the migration that creates the bucket and policies:

**File:** `supabase/migrations/006_storage_store_licenses_bucket_and_rls.sql`

In Supabase Dashboard: **SQL Editor** → paste the contents of that file → Run.

Or from the project root:

```bash
supabase db push
```

The migration does the following:

1. **Bucket:** `INSERT INTO storage.buckets (id, name, public) VALUES ('store-licenses', 'store-licenses', false) ON CONFLICT (id) DO NOTHING;`
2. **INSERT policy:** Authenticated users can insert into `storage.objects` only when `bucket_id = 'store-licenses'` and the first path segment is their user id: `(storage.foldername(name))[1] = auth.uid()::text`. So uploads are restricted to `{user_id}/...`.
3. **SELECT policy:** Same path rule so users can only read their own files in `store-licenses`.

After this, step 1 (storage upload) succeeds and the seller application flow can complete, while keeping access to `store-licenses` limited to the user’s own folder.
