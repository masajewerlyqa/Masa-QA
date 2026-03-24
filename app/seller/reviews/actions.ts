"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore } from "@/lib/seller";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionResult = { ok: boolean; error?: string };

export async function updateReviewStatus(
  reviewId: string,
  status: "approved" | "rejected"
): Promise<ReviewActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    return { ok: false, error: "Unauthorized" };
  }

  const store = await getSellerStore();
  if (!store) {
    return { ok: false, error: "No store found" };
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

  const { data: product } = await supabase
    .from("products")
    .select("store_id")
    .eq("id", review.product_id)
    .single();

  if (!product || product.store_id !== store.id) {
    return { ok: false, error: "Review does not belong to your store" };
  }

  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/seller/reviews");
  revalidatePath("/seller");
  revalidatePath(`/product/${review.product_id}`);
  revalidatePath("/discover");
  return { ok: true };
}
