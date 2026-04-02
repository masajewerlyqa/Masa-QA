"use server";

/**
 * Checkout order creation — payment-ready placeholder architecture.
 * - Receives payment_method (card | apple_pay) and optional promo_code from the form.
 * - Validates promo code if provided; applies discount; saves promo_code and discount_amount on order; increments used_count.
 * - No real payment processing; order is created and flow continues as today.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCartWithProducts, clearCart } from "@/lib/customer";
import { sendOrderConfirmationEmail } from "@/lib/email/transactional";
import { resolveEmailLanguage } from "@/lib/email/email-language";
import { recordOrderPlacedEvent } from "@/lib/orders/lifecycle";
import { notifySellersNewOrder } from "@/lib/notifications";
import { validatePromoCode } from "@/lib/promo";
import { computeCommission } from "@/lib/commission";
import { validateCartStoresForCheckout } from "@/lib/cart-store-availability";
import { sellerResponseDeadlineIso } from "@/lib/orders/seller-sla";
import { createClient } from "@/lib/supabase/server";
import { requireServiceClient } from "@/lib/supabase/service";

export type CheckoutActionResult = { ok: boolean; error?: string; orderId?: string };

/** Validate promo code for current user's cart; returns discount amount for UI. */
export type ApplyPromoResult =
  | { ok: true; code: string; discountAmount: number }
  | { ok: false; error: string };

export async function applyPromoCode(codeInput: string): Promise<ApplyPromoResult> {
  const { user } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to apply a promo code" };

  const cartWithProducts = await getCartWithProducts(user.id);
  if (cartWithProducts.length === 0) return { ok: false, error: "Your cart is empty" };

  const code = String(codeInput ?? "").trim();
  if (!code) return { ok: false, error: "Enter a promo code" };

  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartStoreIds = Array.from(new Set(cartWithProducts.map((i) => i.product.storeId)));
  const result = await validatePromoCode(code, subtotal, cartStoreIds);

  if (!result.valid) return { ok: false, error: result.error };
  return { ok: true, code: result.code, discountAmount: result.discountAmount };
}

export async function createOrder(formData: FormData): Promise<CheckoutActionResult> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) return { ok: false, error: "Sign in to place an order" };

  const cartWithProducts = await getCartWithProducts(user.id);
  if (cartWithProducts.length === 0) return { ok: false, error: "Your cart is empty" };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const deliveryPhone = String(formData.get("delivery_phone") ?? "").trim();
  const country = String(formData.get("country") ?? "Qatar").trim();
  const deliveryCityArea = String(formData.get("delivery_city_area") ?? "").trim();
  const deliveryBuildingType = String(formData.get("delivery_building_type") ?? "").trim() || null;
  const deliveryZoneNo = String(formData.get("delivery_zone_no") ?? "").trim() || null;
  const deliveryStreetNo = String(formData.get("delivery_street_no") ?? "").trim() || null;
  const deliveryBuildingNo = String(formData.get("delivery_building_no") ?? "").trim() || null;
  const deliveryFloorNo = String(formData.get("delivery_floor_no") ?? "").trim() || null;
  const deliveryApartmentNo = String(formData.get("delivery_apartment_no") ?? "").trim() || null;
  const deliveryLandmark = String(formData.get("delivery_landmark") ?? "").trim() || null;
  const latStr = String(formData.get("delivery_lat") ?? "");
  const lngStr = String(formData.get("delivery_lng") ?? "");
  const deliveryLat = latStr ? parseFloat(latStr) : null;
  const deliveryLng = lngStr ? parseFloat(lngStr) : null;
  const deliveryMapUrl = String(formData.get("delivery_map_url") ?? "").trim() || null;
  const notes = deliveryLandmark;
  const paymentMethodRaw = String(formData.get("payment_method") ?? "").trim().toLowerCase();
  const _paymentMethod = ["card", "apple_pay"].includes(paymentMethodRaw) ? paymentMethodRaw : "card";
  const promoCodeInput = String(formData.get("promo_code") ?? "").trim() || null;

  if (!firstName) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!deliveryPhone) {
    return { ok: false, error: "Please enter your phone number." };
  }
  if (!deliveryCityArea) {
    return { ok: false, error: "Please enter your city or area." };
  }
  if (deliveryLat == null || deliveryLng == null || Number.isNaN(deliveryLat) || Number.isNaN(deliveryLng)) {
    return { ok: false, error: "Please pin your exact delivery location on the map." };
  }

  const shipping_address = {
    firstName,
    phone: deliveryPhone,
    country,
    cityArea: deliveryCityArea,
    buildingType: deliveryBuildingType,
    zoneNo: deliveryZoneNo,
    streetNo: deliveryStreetNo,
    buildingNo: deliveryBuildingNo,
    floorNo: deliveryFloorNo,
    apartmentNo: deliveryApartmentNo,
    landmark: deliveryLandmark,
    lat: deliveryLat,
    lng: deliveryLng,
    mapUrl: deliveryMapUrl,
  };

  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartStoreIds = Array.from(new Set(cartWithProducts.map((i) => i.product.storeId)));

  const storeGate = await validateCartStoresForCheckout(user.id);
  if (storeGate.blocked) {
    return {
      ok: false,
      error:
        storeGate.reason === "not_configured"
          ? "STORE_HOURS_NOT_SET"
          : "STORE_CLOSED",
    };
  }

  let discountAmount = 0;
  let appliedPromoCode: string | null = null;
  let appliedPromoId: string | null = null;

  if (promoCodeInput) {
    const validation = await validatePromoCode(promoCodeInput, subtotal, cartStoreIds);
    if (!validation.valid) return { ok: false, error: validation.error };
    discountAmount = validation.discountAmount;
    appliedPromoCode = validation.code;
    appliedPromoId = validation.promoId;
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const { commissionAmount, sellerEarnings } = computeCommission(subtotalAfterDiscount);
  const shipping_cost = 0;
  const tax = 0;
  const total = Math.max(0, Math.round((subtotalAfterDiscount + shipping_cost) * 100) / 100);

  // Stock: validate then reserve (decrement) before creating order to avoid overselling
  for (const item of cartWithProducts) {
    const available = item.product.stockQuantity ?? 0;
    if (item.quantity > available) {
      return {
        ok: false,
        error: `"${item.product.title}" has insufficient stock. Available: ${available}, requested: ${item.quantity}. Please update your cart.`,
      };
    }
  }

  const service = requireServiceClient();
  const stockPayload = cartWithProducts.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
  }));
  const { error: stockError } = await service.rpc("decrement_order_stock", { items: stockPayload });
  if (stockError) {
    const msg = stockError.code === "P0001" || stockError.message?.includes("insufficient_stock")
      ? "One or more items no longer have enough stock. Please update your cart and try again."
      : stockError.message;
    return { ok: false, error: msg };
  }

  const supabase = await createClient();
  const createdAt = new Date();
  const sellerDeadline = sellerResponseDeadlineIso(createdAt);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "awaiting_seller",
      seller_response_deadline: sellerDeadline,
      subtotal,
      shipping_cost,
      tax,
      total,
      shipping_address,
      notes,
      payment_method: _paymentMethod,
      promo_code: appliedPromoCode,
      discount_amount: discountAmount,
      commission_amount: commissionAmount,
      seller_earnings: sellerEarnings,
      delivery_country: country,
      delivery_city_area: deliveryCityArea,
      delivery_building_type: deliveryBuildingType,
      delivery_zone_no: deliveryZoneNo,
      delivery_street_no: deliveryStreetNo,
      delivery_building_no: deliveryBuildingNo,
      delivery_floor_no: deliveryFloorNo,
      delivery_apartment_no: deliveryApartmentNo,
      delivery_landmark: deliveryLandmark,
      delivery_phone: deliveryPhone,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      delivery_map_url: deliveryMapUrl,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) return { ok: false, error: orderError?.message ?? "Failed to create order" };

  const placed = order as { id: string; order_number: string | null };

  for (const item of cartWithProducts) {
    const unit_price = item.product.price;
    const total_price = Math.round(unit_price * item.quantity * 100) / 100;
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: placed.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price,
      total_price,
    });
    if (itemError) return { ok: false, error: itemError.message };
  }

  if (appliedPromoId) {
    const promoService = requireServiceClient();
    const { data: promoRow } = await promoService.from("promo_codes").select("used_count").eq("id", appliedPromoId).single();
    const nextCount = ((promoRow as { used_count: number } | null)?.used_count ?? 0) + 1;
    await promoService.from("promo_codes").update({ used_count: nextCount }).eq("id", appliedPromoId);
  }

  const storeIds = Array.from(new Set(cartWithProducts.map((i) => i.product.storeId)));
  await notifySellersNewOrder(placed.id, storeIds);

  await recordOrderPlacedEvent({ orderId: placed.id, customerId: user.id });
  const buyerEmail = user.email ?? profile?.email ?? null;
  if (buyerEmail) {
    const mailResult = await sendOrderConfirmationEmail(
      buyerEmail,
      placed.id,
      placed.order_number,
      total,
      resolveEmailLanguage(profile?.preferred_language)
    );
    if (!mailResult.ok) {
      console.warn("[checkout] order confirmation email failed:", mailResult.error, { orderId: placed.id });
    }
  }

  await clearCart(user.id);

  revalidatePath("/cart");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/checkout");
  revalidatePath("/seller/orders");
  revalidatePath("/seller");
  redirect(`/checkout/success?orderId=${placed.id}`);
}
