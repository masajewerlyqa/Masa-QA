import { create } from 'zustand';

import {
  addToCart as addToCartApi,
  CartItemWithProduct,
  getCartCount,
  getCartWithProducts,
  removeFromCart as removeFromCartApi,
  updateCartQuantity as updateCartQuantityApi,
} from '../services/cartService';
import { ServiceResult } from '../types/service';

type CartState = {
  items: CartItemWithProduct[];
  count: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  reset: () => void;
  addItem: (productId: string, quantity?: number) => Promise<ServiceResult>;
  updateQuantity: (productId: string, quantity: number) => Promise<ServiceResult>;
  removeItem: (productId: string) => Promise<ServiceResult>;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  count: 0,
  isLoading: false,

  reset: () => set({ items: [], count: 0, isLoading: false }),

  refresh: async () => {
    set({ isLoading: true });
    try {
      const [items, count] = await Promise.all([getCartWithProducts(), getCartCount()]);
      set({ items, count, isLoading: false });
    } catch {
      set({ items: [], count: 0, isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const prevCount = get().count;
    set({ count: prevCount + quantity });

    const result = await addToCartApi(productId, quantity);
    if (result.ok) {
      get().refresh();
    } else {
      set({ count: prevCount });
    }
    return result;
  },

  updateQuantity: async (productId, quantity) => {
    const prevItems = get().items;
    const prevCount = get().count;
    const item = prevItems.find((i) => i.productId === productId);

    if (quantity < 1) {
      return get().removeItem(productId);
    }

    if (item) {
      const diff = quantity - item.quantity;
      set({
        items: prevItems.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
        count: prevCount + diff,
      });
    }

    const result = await updateCartQuantityApi(productId, quantity);
    if (!result.ok) {
      set({ items: prevItems, count: prevCount });
    }
    return result;
  },

  removeItem: async (productId) => {
    const prevItems = get().items;
    const prevCount = get().count;
    const removed = prevItems.find((i) => i.productId === productId);

    set({
      items: prevItems.filter((i) => i.productId !== productId),
      count: Math.max(0, prevCount - (removed?.quantity ?? 0)),
    });

    const result = await removeFromCartApi(productId);
    if (!result.ok) {
      set({ items: prevItems, count: prevCount });
    }
    return result;
  },
}));
