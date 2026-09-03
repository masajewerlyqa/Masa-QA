import "server-only";

import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { getUserFromRequest } from "@/lib/auth/request-user";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Role guard for the mobile API routes.
 *
 * The role is read from the database using the id on the *verified* token, so a
 * client cannot claim a role by sending one in the body or a header. Keeping
 * this in one place means every admin route enforces the check identically --
 * a per-route copy is exactly where an authorization hole would eventually
 * appear.
 *
 * The service client is used only to read `profiles.role`. Callers still get a
 * plain user id back; nothing here hands a service-role client to a route.
 */
export type RoleCheckFailure = { ok: false; response: NextResponse };
export type RoleCheckSuccess = { ok: true; user: User; role: string };
export type RoleCheckResult = RoleCheckSuccess | RoleCheckFailure;

async function getRole(userId: string): Promise<string | null> {
  const service = createServiceClient();
  if (!service) {
    // Misconfiguration, not a permission decision. Returning null denies access,
    // which is the safe direction: never fail open on an authorization check.
    console.error("[require-role] service client unavailable; denying access");
    return null;
  }

  const { data, error } = await service
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[require-role] role lookup failed", error.message);
    return null;
  }
  return (data?.role as string | undefined) ?? null;
}

/** Resolves the caller and asserts they hold one of `allowed`. */
export async function requireRole(
  request: Request,
  allowed: readonly string[]
): Promise<RoleCheckResult> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, error: "Sign in to continue" }, { status: 401 }),
    };
  }

  const role = await getRole(user.id);
  if (!role || !allowed.includes(role)) {
    // 403, not 404: the caller is authenticated, just not permitted. The message
    // deliberately says nothing about what exists behind the route.
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "You do not have access to this resource." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user, role };
}

export function requireAdmin(request: Request): Promise<RoleCheckResult> {
  return requireRole(request, ["admin"]);
}
