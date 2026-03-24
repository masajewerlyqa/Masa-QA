import type { CartItem } from "@/lib/types";
import { getProductById } from "./products";

export type { CartItem };

export interface CartItemWithProduct extends CartItem {
  product: ReturnType<typeof getProductById> extends infer P ? (P extends undefined ? never : P) : never;
}

// Placeholder: in production this would come from context/API
export const sampleCartItems: CartItem[] = [
  { productId: "1", quantity: 1 },
  { productId: "2", quantity: 1 },
];

export function getCartWithProducts(items: CartItem[]): Array<{ productId: string; quantity: number; product: NonNullable<ReturnType<typeof getProductById>> }> {
  return items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter(Boolean) as Array<{ productId: string; quantity: number; product: NonNullable<ReturnType<typeof getProductById>> }>;
}
