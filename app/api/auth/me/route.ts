import { NextResponse } from "next/server";
import { getCurrentUserWithProfile, getRedirectPathForRole } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Returns current user and profile (role). Used after login/register to decide redirect.
 */
export async function GET() {
  const { user, profile } = await getCurrentUserWithProfile();

  if (!user || !profile) {
    return NextResponse.json({ user: null, profile: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.emailConfirmedAt,
    },
    profile: {
      id: profile.id,
      role: profile.role,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      email: profile.email,
      phone: profile.phone,
      phone_verified_at: profile.phone_verified_at,
    },
    redirectPath: getRedirectPathForRole(profile.role),
  });
}
