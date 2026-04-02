import { createServiceClient } from "./service";

export type ConnectionTestResult = {
  ok: boolean;
  message: string;
  timestamp?: string;
  error?: string;
};

/**
 * Server-only utility to verify Supabase connection.
 * Uses the service client to hit the API (no DB table required).
 * Use in API routes or Server Components for health checks.
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    const supabase = createServiceClient();
    if (!supabase) {
      return {
        ok: false,
        message: "Supabase service client is not configured (missing URL or service role key)",
        timestamp: new Date().toISOString(),
      };
    }
    // Simple health check: auth.getSession() or a minimal API call
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        ok: false,
        message: "Supabase client created but session check failed",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
    return {
      ok: true,
      message: "Successfully connected to Supabase",
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: "Failed to connect to Supabase",
      timestamp: new Date().toISOString(),
      error: message,
    };
  }
}
