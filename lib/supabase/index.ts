/**
 * Client-safe Supabase export only.
 * Do NOT export server, service, or test-connection here (they use next/headers or Node).
 * Server code must import directly:
 *   - import { createClient } from "@/lib/supabase/server"
 *   - import { createServiceClient } from "@/lib/supabase/service"
 *   - import { testSupabaseConnection } from "@/lib/supabase/test-connection"
 */
export { createClient } from "./client";
