import "server-only";

import { createClient } from "@/lib/supabase/server";

export type OrderExperienceRating = {
  id: string;
  order_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

/** Rating for an order, if the current user may see it (buyer or seller RLS). */
export async function getOrderExperienceRating(orderId: string): Promise<OrderExperienceRating | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_experience_ratings")
    .select("id, order_id, customer_id, rating, comment, created_at, updated_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as OrderExperienceRating;
}

/** Order ids the customer has already rated (for order history UI). */
export async function getCustomerRatedOrderIds(customerId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_experience_ratings")
    .select("order_id")
    .eq("customer_id", customerId);

  if (error || !data?.length) return new Set();
  return new Set(data.map((r) => r.order_id as string));
}
