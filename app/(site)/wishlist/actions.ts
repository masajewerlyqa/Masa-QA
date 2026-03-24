"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getOrCreateWishlist } from "@/lib/customer";
import { createClient } from "@/lib/supabase/server";

export type WishlistActionResult = { ok: boolean; error?: string; inWishlist?: boolean };

export async function addToWishlist(productId: string): Promise<WishlistActionResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to add to wishlist" };

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) return { ok: false, error: "Could not load wishlist" };

  const supabase = await createClient();
  const { error } = await supabase.from("wishlist_items").insert({ wishlist_id: wishlistId, product_id: productId });

  if (error) {
    if (error.code === "23505") return { ok: true, inWishlist: true };
    return { ok: false, error: error.message };
  }

  revalidatePath("/wishlist");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/discover");
  revalidatePath("/cart");
  revalidatePath(`/product/${productId}`);
  return { ok: true, inWishlist: true };
}

export async function removeFromWishlist(productId: string): Promise<WishlistActionResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to manage wishlist" };

  const wishlistId = await getOrCreateWishlist(user.id);
  if (!wishlistId) return { ok: true, inWishlist: false };

  const supabase = await createClient();
  await supabase
    .from("wishlist_items")
    .delete()
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId);

  revalidatePath("/wishlist");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/discover");
  revalidatePath("/cart");
  revalidatePath(`/product/${productId}`);
  return { ok: true, inWishlist: false };
}

export async function toggleWishlist(productId: string, currentlyInWishlist: boolean): Promise<WishlistActionResult> {
  if (currentlyInWishlist) return removeFromWishlist(productId);
  return addToWishlist(productId);
}
