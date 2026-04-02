"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore, getSellerProductById } from "@/lib/seller";
import { createClient } from "@/lib/supabase/server";
import { productFormSchema, type ProductFormValues } from "@/lib/validations/product";
import { computeDynamicProductPrice } from "@/lib/pricing";
import { parseSellerPlanId } from "@/lib/seller-plans";
import { canSellerAddProduct } from "@/lib/seller-plan-policy";

export type ActionResult = {
  ok: boolean;
  error?: string;
  productId?: string;
  /** Stable code for client i18n (e.g. catalog cap on Basic). */
  code?: "PLAN_PRODUCT_LIMIT";
};

function mapSchemaMismatchError(message?: string): string | undefined {
  if (!message) return undefined;
  if (message.includes("craftsmanship_margin") && message.includes("schema cache")) {
    return "Database is missing products.craftsmanship_margin. Run migration 033_products_market_pricing_fields.sql and retry.";
  }
  return undefined;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function uniqueSlug(base: string): string {
  const slug = slugify(base) || "product";
  return `${slug}-${Date.now().toString(36)}`;
}

export async function createProduct(formData: ProductFormValues, imageUrls: string[] = []): Promise<ActionResult> {
  const parsed = productFormSchema.safeParse(formData);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
      .join("; ");
    return { ok: false, error: msg };
  }

  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  const supabase = await createClient();

  const effectivePlan = parseSellerPlanId(store.seller_plan) ?? "basic";
  const { count: existingCount, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store.id)
    .is("deleted_at", null);

  if (countError) {
    return { ok: false, error: countError.message };
  }
  const n = existingCount ?? 0;
  if (!canSellerAddProduct(n, effectivePlan)) {
    return {
      ok: false,
      code: "PLAN_PRODUCT_LIMIT",
      error:
        effectivePlan === "basic"
          ? "Basic plan allows up to 100 active products. Delete or archive items, or upgrade to Premium."
          : "Product limit reached for your plan.",
    };
  }

  const slug = uniqueSlug(parsed.data.title);
  const dynamicPrice = await computeDynamicProductPrice({
    metalType: parsed.data.metal_type,
    goldKarat: parsed.data.gold_karat,
    weight: parsed.data.weight,
    craftsmanshipMargin: parsed.data.craftsmanship_margin,
    storedPrice: 0,
  });

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      store_id: store.id,
      name: parsed.data.title,
      slug,
      description: parsed.data.description?.trim() || null,
      category: parsed.data.category,
      price: dynamicPrice.finalPriceUsd,
      metal_type: parsed.data.metal_type.trim() || null,
      gold_karat: parsed.data.gold_karat?.trim() || null,
      weight: parsed.data.weight ?? null,
      craftsmanship_margin: parsed.data.craftsmanship_margin ?? 0,
      stock_quantity: parsed.data.stock_quantity,
      status: parsed.data.status,
    })
    .select("id")
    .single();

  if (insertError) return { ok: false, error: mapSchemaMismatchError(insertError.message) ?? insertError.message };
  if (!product) return { ok: false, error: "Failed to create product" };

  for (let i = 0; i < imageUrls.length; i++) {
    await supabase.from("product_images").insert({
      product_id: product.id,
      url: imageUrls[i],
      sort_order: i,
    });
  }

  revalidatePath("/seller/products");
  revalidatePath("/seller");
  return { ok: true, productId: product.id };
}

export async function updateProduct(productId: string, formData: ProductFormValues, imageUrls: string[] = []): Promise<ActionResult> {
  const parsed = productFormSchema.safeParse(formData);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.entries(first)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
      .join("; ");
    return { ok: false, error: msg };
  }

  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  const existing = await getSellerProductById(productId, store.id);
  if (!existing) return { ok: false, error: "Product not found or you cannot edit it" };

  const supabase = await createClient();
  const dynamicPrice = await computeDynamicProductPrice({
    metalType: parsed.data.metal_type,
    goldKarat: parsed.data.gold_karat,
    weight: parsed.data.weight,
    craftsmanshipMargin: parsed.data.craftsmanship_margin,
    storedPrice: existing.price,
  });

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name: parsed.data.title,
      description: parsed.data.description?.trim() || null,
      category: parsed.data.category,
      price: dynamicPrice.finalPriceUsd,
      metal_type: parsed.data.metal_type.trim() || null,
      gold_karat: parsed.data.gold_karat?.trim() || null,
      weight: parsed.data.weight ?? null,
      craftsmanship_margin: parsed.data.craftsmanship_margin ?? 0,
      stock_quantity: parsed.data.stock_quantity,
      status: parsed.data.status,
    })
    .eq("id", productId)
    .eq("store_id", store.id);

  if (updateError) return { ok: false, error: mapSchemaMismatchError(updateError.message) ?? updateError.message };

  const toRemove = existing.product_images.filter((i) => !imageUrls.includes(i.url));

  for (const img of toRemove) {
    await supabase.from("product_images").delete().eq("id", img.id);
  }

  const urlsInOrder = imageUrls.slice();
  for (let i = 0; i < urlsInOrder.length; i++) {
    const url = urlsInOrder[i];
    const existingImg = existing.product_images.find((pi) => pi.url === url);
    if (existingImg) {
      if (existingImg.sort_order !== i) {
        await supabase.from("product_images").update({ sort_order: i }).eq("id", existingImg.id);
      }
    } else {
      await supabase.from("product_images").insert({
        product_id: productId,
        url,
        sort_order: i,
      });
    }
  }

  revalidatePath("/seller/products");
  revalidatePath(`/seller/products/${productId}/edit`);
  revalidatePath("/seller");
  return { ok: true, productId };
}

export async function softDeleteProduct(productId: string): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  const existing = await getSellerProductById(productId, store.id);
  if (!existing) return { ok: false, error: "Product not found or you cannot delete it" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("store_id", store.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/products");
  revalidatePath("/seller");
  return { ok: true };
}

export type DiscountPayload = {
  discount_type: "percentage" | "fixed";
  discount_value: number;
  discount_start_at?: string | null;
  discount_end_at?: string | null;
  discount_active: boolean;
};

/** Apply or update discount on selected products. Only seller's store products. */
export async function applyProductDiscount(
  productIds: string[],
  payload: DiscountPayload
): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  if (productIds.length === 0) return { ok: false, error: "Select at least one product" };

  if (payload.discount_type === "percentage" && (payload.discount_value < 0 || payload.discount_value > 100)) {
    return { ok: false, error: "Percentage must be between 0 and 100" };
  }
  if (payload.discount_type === "fixed" && payload.discount_value < 0) {
    return { ok: false, error: "Fixed discount must be 0 or more" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      discount_type: payload.discount_type,
      discount_value: payload.discount_value,
      discount_start_at: payload.discount_start_at ?? null,
      discount_end_at: payload.discount_end_at ?? null,
      discount_active: payload.discount_active,
    })
    .in("id", productIds)
    .eq("store_id", store.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/products");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/discover");
  return { ok: true };
}

/** Remove discount from selected products. Only seller's store products. */
export async function removeProductDiscount(productIds: string[]): Promise<ActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return { ok: false, error: "Unauthorized" };

  const store = await getSellerStore();
  if (!store) return { ok: false, error: "Store not found" };

  if (productIds.length === 0) return { ok: false, error: "Select at least one product" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      discount_type: null,
      discount_value: null,
      discount_start_at: null,
      discount_end_at: null,
      discount_active: false,
    })
    .in("id", productIds)
    .eq("store_id", store.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/seller/products");
  revalidatePath("/seller");
  revalidatePath("/");
  revalidatePath("/discover");
  return { ok: true };
}
