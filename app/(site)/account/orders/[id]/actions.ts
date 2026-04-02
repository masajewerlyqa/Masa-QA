"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SubmitOrderExperienceResult = { ok: true } | { ok: false; error: string };

const MAX_COMMENT = 2000;

export async function submitOrderExperienceRating(
  orderId: string,
  rating: number,
  comment: string | null
): Promise<SubmitOrderExperienceResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    return { ok: false, error: "account.experienceRating.signInRequired" as const };
  }

  const r = Math.round(Number(rating));
  if (!Number.isFinite(r) || r < 1 || r > 5) {
    return { ok: false, error: "account.experienceRating.invalidRating" as const };
  }

  const trimmed = comment?.trim() ?? "";
  if (trimmed.length > MAX_COMMENT) {
    return { ok: false, error: "account.experienceRating.commentTooLong" as const };
  }

  const supabase = await createClient();
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, customer_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return { ok: false, error: "account.experienceRating.orderNotFound" as const };
  }
  if (order.customer_id !== user.id) {
    return { ok: false, error: "account.experienceRating.unauthorized" as const };
  }
  if (order.status !== "delivered") {
    return { ok: false, error: "account.experienceRating.onlyDelivered" as const };
  }

  const { error } = await supabase.from("order_experience_ratings").upsert(
    {
      order_id: orderId,
      customer_id: user.id,
      rating: r,
      comment: trimmed.length > 0 ? trimmed : null,
    },
    { onConflict: "order_id" }
  );

  if (error) {
    console.error("[submitOrderExperienceRating]", error);
    return { ok: false, error: error.message };
  }

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  return { ok: true };
}
