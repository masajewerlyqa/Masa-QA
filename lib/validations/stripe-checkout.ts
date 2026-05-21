import { z } from "zod";

export const stripeCheckoutItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required.").max(500),
  /** Unit price in USD (e.g. 29.99). Converted to cents for Stripe. */
  price: z.number().positive("Price must be greater than zero.").finite(),
  quantity: z.number().int("Quantity must be a whole number.").positive().max(999),
  /** Required for Stripe webhook order fulfillment in Supabase. */
  productId: z.string().uuid().optional(),
});

export const stripeCheckoutBodySchema = z.object({
  items: z.array(stripeCheckoutItemSchema).min(1, "Cart must include at least one item.").max(100),
  /** Logged-in buyer; stored on Checkout Session for webhook order creation. */
  customerId: z.string().uuid().optional(),
});

export type StripeCheckoutBody = z.infer<typeof stripeCheckoutBodySchema>;
export type StripeCheckoutItem = z.infer<typeof stripeCheckoutItemSchema>;
