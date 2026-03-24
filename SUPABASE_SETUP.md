# Supabase integration – MASA Next.js

This project uses Supabase for auth, database, and storage. This doc describes the client setup and how to verify the connection.

## Files created

| File | Purpose |
|------|--------|
| `lib/supabase/client.ts` | **Browser client** – use in Client Components (`"use client"`). Single instance, uses anon key and cookies. |
| `lib/supabase/server.ts` | **Server client** – use in Server Components, Route Handlers, and Server Actions. Cookie-based session for current user. |
| `lib/supabase/service.ts` | **Service-role client** – server-only. Use when you need to bypass RLS (admin, cron, server actions). Never expose to the browser. |
| `lib/supabase/middleware.ts` | **Session refresh** – used by Next.js middleware to refresh auth tokens so server code sees an up-to-date session. |
| `lib/supabase/test-connection.ts` | **Connection test** – server-only helper to check that Supabase is reachable. |
| `lib/supabase/index.ts` | Re-exports all clients and the test helper. |
| `middleware.ts` | Next.js middleware that runs `updateSession()` on matching routes. |
| `app/api/supabase-test/route.ts` | **GET /api/supabase-test** – API route that runs the connection test and returns JSON. |

## Environment variables

Put these in **`.env.local`** in the project root (same folder as `package.json`). Do not commit this file.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- **NEXT_PUBLIC_*** – exposed to the browser; required for the browser and server clients.
- **SUPABASE_SERVICE_ROLE_KEY** – server-only; used by `createServiceClient()` and the connection test. Add to `.env.local` and ensure `.env.local` is in `.gitignore`.

## Client vs server imports (avoid build errors)

**Do not** import `lib/supabase/server.ts` or any module that imports it from:

- Client Components (`"use client"`)
- `pages/` directory
- Hooks or shared utils used by client code

**Server-only modules** (use only in Server Components, Route Handlers, Server Actions):

- `lib/supabase/server.ts`
- `lib/auth.ts` (uses server Supabase)
- `lib/seller.ts` (uses server Supabase and auth)

**Client-safe modules** (safe to import from Client Components):

- `lib/supabase/client.ts` – browser Supabase client
- `lib/auth-client.ts` – `Profile` type, `getRedirectPathForRole`, `getDashboardPathForRole`
- `lib/seller-types.ts` – seller dashboard types only (`StoreRow`, `ProductRow`, `SellerStats`, etc.)

If a Client Component needs auth or seller **types**, import from `lib/auth-client` or `lib/seller-types`, not from `lib/auth` or `lib/seller`.

## Usage

### Client Components (browser)

```ts
"use client";

import { createClient } from "@/lib/supabase/client";

export function MyComponent() {
  const supabase = createClient();
  // e.g. supabase.auth.signIn(), supabase.from("table").select(), supabase.storage.from("bucket").upload()
}
```

### Server Components / Route Handlers / Server Actions

```ts
import { createServerClient } from "@/lib/supabase";

export default async function Page() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Database queries respect RLS and current user
}
```

### Server-only with service role (bypass RLS)

```ts
import { createServiceClient } from "@/lib/supabase";

export async function adminAction() {
  const supabase = createServiceClient();
  // Use for admin operations, background jobs, or when RLS must be bypassed
}
```

### Connection test in code

```ts
import { testSupabaseConnection } from "@/lib/supabase";

const result = await testSupabaseConnection();
// result.ok, result.message, result.error
```

## How to verify the project is connected to Supabase

1. **Env**  
   Ensure `.env.local` exists and contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

2. **API route**  
   Start the app (`npm run dev`) and open:
   - **http://localhost:3000/api/supabase-test**

   A successful response looks like:
   ```json
   { "ok": true, "message": "Successfully connected to Supabase", "timestamp": "..." }
   ```
   If `ok` is `false`, check `message` and `error` and fix env or network.

3. **Optional: programmatic test**  
   In any server context (e.g. Server Component or API route), call `testSupabaseConnection()` and assert `result.ok === true`.

No UI was changed; only new Supabase utilities and the test route were added.

---

## Auth (login & register)

Login and register use Supabase Auth:

- **Register:** `components/auth/RegisterForm.tsx` – `supabase.auth.signUp()` with email, password, and optional `full_name` in user metadata. The DB trigger `handle_new_user` creates a row in `profiles` on signup.
- **Login:** `components/auth/LoginForm.tsx` – `supabase.auth.signInWithPassword()`. On success, the app redirects to `/`.

Both forms show a loading state and display error messages from Supabase (e.g. invalid credentials, user already exists).

### How to test the signup flow locally

1. **Env**  
   Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2. **Run the app**  
   From the project root: `npm run dev`. Open **http://localhost:3000**.

3. **Register**  
   - Go to **http://localhost:3000/register**.
   - Enter full name, email, and password (min 6 characters).
   - Click **Create account**.
   - You should see a loading state (“Creating account…”), then redirect to the home page. If Supabase returns an error (e.g. “User already registered”), it appears in a red box above the form.

4. **Confirm profile creation**  
   In Supabase Dashboard → **Table Editor** → `profiles`, you should see a new row with the same `id` as the user in **Authentication** → **Users**, with `full_name` and `email` (and default `role` = `customer`). The trigger `on_auth_user_created` creates this row on signup.

5. **Login**  
   - Go to **http://localhost:3000/login**.
   - Sign in with the same email and password.
   - You should be redirected to `/` after a short “Signing in…” state. Wrong credentials show an error message.

6. **Email confirmation (optional)**  
   If in Supabase **Authentication** → **Providers** → **Email** you have “Confirm email” enabled, new users must click the confirmation link before they can sign in. For local testing you can disable “Confirm email” so signup works immediately.
