import { z } from "zod";

const cartMetaItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type StripeCartMetaItem = z.infer<typeof cartMetaItemSchema>;

export function serializeCartItemsForMetadata(
  items: Array<{ productId: string; quantity: number }>
): string {
  const payload = items.map((i) => ({
    product_id: i.productId,
    quantity: i.quantity,
  }));
  return JSON.stringify(payload);
}

export function parseCartItemsFromMetadata(raw: string | null | undefined): StripeCartMetaItem[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const arr = z.array(cartMetaItemSchema).safeParse(parsed);
    return arr.success && arr.data.length > 0 ? arr.data : null;
  } catch {
    return null;
  }
}
