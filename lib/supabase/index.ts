/**
 * Client-safe Supabase export only.
 * Do NOT export server or service here (they use next/headers or Node).
 * Server code must import directly:
 *   - import { createClient } from "@/lib/supabase/server"
 *   - import { createServiceClient } from "@/lib/supabase/service"
 */
export { createClient } from "./client";
