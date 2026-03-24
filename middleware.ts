import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip middleware for all of `/_next/*` (static, webpack HMR, etc.) so assets are never intercepted.
     * Also skip auth/callback and common static file extensions.
     */
    "/((?!_next/|api/webhooks/|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
