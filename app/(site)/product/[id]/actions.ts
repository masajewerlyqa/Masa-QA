"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { hasCustomerPurchasedProduct } from "@/lib/reviews";
import { notifySellerNewReview, notifyAdminsNewReviewPending } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

export type SubmitReviewResult = { ok: boolean; error?: string };

export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/login");
  }

  const productId = String(formData.get("productId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;

  if (!productId || !rating || rating < 1 || rating > 5) {
    return { ok: false, error: "Please select a rating (1–5)." };
  }

  const hasPurchased = await hasCustomerPurchasedProduct(user.id, productId);
  if (!hasPurchased) {
    console.warn("[submitReview] hasCustomerPurchasedProduct=false", { userId: user.id, productId });
    return { ok: false, error: "Only customers who purchased this product can leave a review." };
  }

  const supabase = await createClient();
  const { data: existingRow, error: selectError } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("[submitReview] select existing review error:", selectError.message, selectError.code);
    return { ok: false, error: selectError.message };
  }

  const isNewReview = !existingRow;
  if (existingRow) {
    const { error } = await supabase
      .from("reviews")
      .update({ rating, title, body, status: "pending" })
      .eq("id", existingRow.id);
    if (error) {
      console.error("[submitReview] update error:", error.message, error.code);
      return { ok: false, error: error.message };
    }
    console.log("[submitReview] updated existing review", { reviewId: existingRow.id, productId });
  } else {
    const { data: inserted, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        customer_id: user.id,
        rating,
        title,
        body,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) {
      console.error("[submitReview] insert error:", error.message, error.code, error.details);
      return { ok: false, error: error.message };
    }
    console.log("[submitReview] inserted new review", { reviewId: inserted?.id, productId });
  }

  if (isNewReview) {
    const { data: product } = await supabase.from("products").select("name").eq("id", productId).single();
    const productName = product?.name ?? "your product";
    await notifySellerNewReview(productId, productName);
    await notifyAdminsNewReviewPending(productId, productName);
  }

  revalidatePath(`/product/${productId}`);
  revalidatePath("/", "layout");
  revalidatePath("/discover");
  revalidatePath("/store");
  revalidatePath("/seller/reviews");
  revalidatePath("/admin/reviews");
  return { ok: true };
}

