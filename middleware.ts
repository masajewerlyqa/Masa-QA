import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip Supabase session refresh for all Next assets (`/_next/*`), webhooks, OAuth callback, favicon, static files.
     * If middleware runs on `/_next/static/*.js`, the response can break chunk loading (hydration → dropdowns dead).
     */
    "/((?!_next/|api/webhooks|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
