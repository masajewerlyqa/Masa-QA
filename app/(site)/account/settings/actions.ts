"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validations/account";

export type ProfileUpdateResult = { ok: true } | { ok: false; error: string };

export async function updateProfileAction(input: {
  fullName: string;
  phone: string;
}): Promise<ProfileUpdateResult> {
  const parsed = profileUpdateSchema.safeParse({
    fullName: input.fullName,
    phone: input.phone ?? "",
  });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.fullName?.[0] || parsed.error.flatten().fieldErrors.phone?.[0];
    return { ok: false, error: msg || "Invalid input" };
  }

  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in required" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .maybeSingle();

  let phone = parsed.data.phone?.trim() || null;
  // Avoid accidental wipe: empty field keeps previous stored phone unless explicitly cleared later via dedicated flow.
  if (phone === null && existing?.phone?.trim()) {
    phone = existing.phone;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName.trim(),
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { ok: true };
}

export async function updateNewsletterOptInAction(optIn: boolean): Promise<ProfileUpdateResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      newsletter_opt_in: optIn,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { ok: true };
}
