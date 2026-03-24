"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore } from "@/lib/seller";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

export type StoreSettingsPayload = {
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  location: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  latitude: number | null;
  longitude: number | null;
};

function socialLinksFromPayload(p: StoreSettingsPayload): Record<string, string> | null {
  const links: Record<string, string> = {};
  if (p.website?.trim()) links.website = p.website.trim();
  if (p.facebook?.trim()) links.facebook = p.facebook.trim();
  if (p.instagram?.trim()) links.instagram = p.instagram.trim();
  if (p.linkedin?.trim()) links.linkedin = p.linkedin.trim();
  return Object.keys(links).length > 0 ? links : null;
}

export async function updateStoreSettings(payload: StoreSettingsPayload): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    return { ok: false, error: "Unauthorized" };
  }

  const store = await getSellerStore();
  if (!store) {
    return { ok: false, error: "Store not found" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      name: payload.name.trim() || store.name,
      slug: payload.slug.trim() || store.slug,
      description: payload.description.trim() || null,
      logo_url: payload.logo_url?.trim() || null,
      banner_url: payload.banner_url?.trim() || null,
      location: payload.location.trim() || null,
      contact_email: payload.contact_email.trim() || null,
      contact_phone: payload.contact_phone.trim() || null,
      social_links: socialLinksFromPayload(payload),
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
    })
    .eq("id", store.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/seller");
  revalidatePath("/seller/settings");
  return { ok: true };
}
