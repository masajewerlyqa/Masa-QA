"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore } from "@/lib/seller";
import { createClient } from "@/lib/supabase/server";
import { storeHoursFormSchema } from "@/lib/validations/store-hours";

export type SaveAvailabilityResult = { ok: true } | { ok: false; error: string };

function toPgTime(hhmm: string): string {
  const t = hhmm.trim();
  if (/^\d{1,2}:\d{2}$/.test(t)) return `${t}:00`;
  return t;
}

export async function saveStoreAvailabilityAction(raw: unknown): Promise<SaveAvailabilityResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    return { ok: false, error: "Unauthorized" };
  }

  const store = await getSellerStore();
  if (!store) {
    return { ok: false, error: "No store" };
  }

  const parsed = storeHoursFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      working_days: parsed.data.working_days,
      opening_time_local: toPgTime(parsed.data.opening_time),
      closing_time_local: toPgTime(parsed.data.closing_time),
      business_timezone: parsed.data.business_timezone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", store.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/seller");
  revalidatePath("/seller/availability");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true };
}
