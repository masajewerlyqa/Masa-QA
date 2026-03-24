"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import type { AdminReviewRow } from "@/lib/admin";

export type ReviewModerationResult = { ok: boolean; error?: string };

export async function updateReviewStatusByAdmin(
  reviewId: string,
  status: "approved" | "rejected",
  adminNote?: string | null
): Promise<ReviewModerationResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("id, product_id")
    .eq("id", reviewId)
    .single();

  if (fetchError || !review) {
    return { ok: false, error: "Review not found" };
  }

  const updatePayload: Record<string, any> = {
    status,
    admin_note: adminNote ?? null,
  };

  if (status === "approved") {
    updatePayload.approved_by = user.id;
    updatePayload.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from("reviews").update(updatePayload).eq("id", reviewId);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  revalidatePath(`/product/${review.product_id}`);
  revalidatePath("/discover");
  revalidatePath("/store");
  revalidatePath("/seller/reviews");
  revalidatePath("/", "layout");
  return { ok: true };
}

