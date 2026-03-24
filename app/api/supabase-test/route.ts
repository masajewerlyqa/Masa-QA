import { NextResponse } from "next/server";
import { testSupabaseConnection } from "@/lib/supabase/test-connection";

/**
 * GET /api/supabase-test
 * Verifies that the app can connect to Supabase using env credentials.
 * Use this to confirm integration is working.
 */
export async function GET() {
  const result = await testSupabaseConnection();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
  });
}
