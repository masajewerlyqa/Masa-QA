import { create } from 'zustand';

import { Product } from '../types/catalog';
import {
  getWishlistCount,
  getWishlistProductIds,
  getWishlistProducts,
  toggleWishlist as toggleWishlistApi,
} from '../services/wishlistService';
import { ServiceResult } from '../types/service';

type WishlistState = {
  productIds: string[];
  products: Product[];
  count: number;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  refresh: () => Promise<void>;
  reset: () => void;
  toggle: (productId: string) => Promise<ServiceResult>;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  products: [],
  count: 0,
  isLoading: false,

  isInWishlist: (productId) => get().productIds.includes(productId),

  reset: () => set({ productIds: [], products: [], count: 0, isLoading: false }),

  refresh: async () => {
    set({ isLoading: true });
    try {
      const [products, productIds, count] = await Promise.all([
        getWishlistProducts(),
        getWishlistProductIds(),
        getWishlistCount(),
      ]);
      set({ products, productIds, count, isLoading: false });
    } catch {
      set({ products: [], productIds: [], count: 0, isLoading: false });
    }
  },

  toggle: async (productId) => {
    const prevProductIds = get().productIds;
    const prevProducts = get().products;
    const prevCount = get().count;
    const currentlyIn = get().isInWishlist(productId);

    if (currentlyIn) {
      set({
        productIds: prevProductIds.filter((id) => id !== productId),
        products: prevProducts.filter((p) => p.id !== productId),
        count: Math.max(0, prevCount - 1),
      });
    } else {
      set({
        productIds: [...prevProductIds, productId],
        count: prevCount + 1,
      });
    }

    const result = await toggleWishlistApi(productId, currentlyIn);
    if (result.ok) {
      get().refresh();
    } else {
      set({ productIds: prevProductIds, products: prevProducts, count: prevCount });
    }
    return result;
  },
}));
