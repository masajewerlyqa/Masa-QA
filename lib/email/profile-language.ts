import "server-only";

import { requireServiceClient } from "@/lib/supabase/service";
import { resolveEmailLanguage } from "./email-language";
import type { Language } from "@/lib/language";

/** Load stored preference for transactional email (defaults to en). */
export async function getProfileEmailLanguage(userId: string): Promise<Language> {
  const service = requireServiceClient();
  const { data, error } = await service
    .from("profiles")
    .select("preferred_language")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[email-lang] profile read:", error.message);
    return "en";
  }
  return resolveEmailLanguage((data as { preferred_language?: string } | null)?.preferred_language);
}
