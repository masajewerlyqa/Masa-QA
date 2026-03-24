# Storage bucket: store-licenses

Seller applications upload store license documents to Supabase Storage.

## Create the bucket (one-time)

1. Supabase Dashboard → **Storage** → **New bucket**.
2. Name: **store-licenses**.
3. **Public bucket**: Off (private; only authenticated users and admins should access files).
4. Create.

## RLS policies (Storage)

In **Storage** → **store-licenses** → **Policies** (or SQL Editor), add:

- **Upload (INSERT):** Authenticated users can upload into a folder named with their user id.
  - Policy name: `Users can upload own licenses`
  - Allowed operation: INSERT
  - Target: `store-licenses`
  - Policy definition (USING): `bucket_id = 'store-licenses' AND (storage.foldername(name))[1] = auth.uid()::text`
  - With CHECK: same expression (so they can only upload under `{auth.uid()}/...`).

- **Read (SELECT):** Applicants can read their own files; admins can read all (optional).
  - Policy name: `Users can read own licenses`
  - Operation: SELECT
  - USING: `bucket_id = 'store-licenses' AND (storage.foldername(name))[1] = auth.uid()::text`

- **Admin read:** If you use the service role in the backend to serve files, no extra policy is needed for admins. Otherwise add a policy that allows SELECT for users with `profiles.role = 'admin'` (requires a custom check or role in JWT).

For simplicity, the app uploads with path `{user_id}/{timestamp}-{sanitized_filename}` so the first folder segment is the user id.
