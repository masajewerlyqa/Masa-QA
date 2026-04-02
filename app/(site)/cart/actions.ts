"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/customer";
import { getPublicProductById } from "@/lib/data/public";
import { validateStoreAcceptsOrdersForProduct } from "@/lib/cart-store-availability";
import { createClient } from "@/lib/supabase/server";

export type CartActionResult = { ok: boolean; error?: string };

export async function addToCart(productId: string, quantity: number = 1): Promise<CartActionResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to add to cart" };
  if (quantity < 1) return { ok: false, error: "Invalid quantity" };

  const product = await getPublicProductById(productId);
  if (!product) return { ok: false, error: "Product not found" };
  if ((product.stockQuantity ?? 0) <= 0) return { ok: false, error: "This item is out of stock" };

  const gate = await validateStoreAcceptsOrdersForProduct(product.storeId);
  if (gate.blocked) {
    return {
      ok: false,
      error: gate.reason === "not_configured" ? "STORE_HOURS_NOT_SET" : "STORE_CLOSED",
    };
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) return { ok: false, error: "Could not load cart" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  const newQuantity = existing ? existing.quantity + quantity : quantity;
  if (newQuantity > (product.stockQuantity ?? 0)) {
    return {
      ok: false,
      error: `Only ${product.stockQuantity} in stock. You have ${existing?.quantity ?? 0} in cart.`,
    };
  }

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, quantity });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/discover");
  revalidatePath("/wishlist");
  revalidatePath(`/product/${productId}`);
  return { ok: true };
}

export async function updateCartQuantity(productId: string, quantity: number): Promise<CartActionResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to update cart" };
  if (quantity < 1) return removeFromCart(productId);

  const product = await getPublicProductById(productId);
  if (!product) return { ok: false, error: "Product not found" };
  const available = product.stockQuantity ?? 0;
  if (quantity > available) {
    return { ok: false, error: `Only ${available} in stock.` };
  }

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) return { ok: false, error: "Could not load cart" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("cart_id", cartId)
    .eq("product_id", productId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath(`/product/${productId}`);
  return { ok: true };
}

export async function removeFromCart(productId: string): Promise<CartActionResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to update cart" };

  const cartId = await getOrCreateCart(user.id);
  if (!cartId) return { ok: true };

  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId);

  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/discover");
  revalidatePath("/wishlist");
  revalidatePath(`/product/${productId}`);
  return { ok: true };
}
