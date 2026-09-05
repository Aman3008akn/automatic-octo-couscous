import { create } from "zustand";
import { Product } from "../types";
import { MOCK_PRODUCTS } from "../api/mockData";

interface WishlistState {
  items: Product[];
  wishlistIds: Set<string>;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [MOCK_PRODUCTS[0]!, MOCK_PRODUCTS[1]!],
  wishlistIds: new Set([MOCK_PRODUCTS[0]!.id, MOCK_PRODUCTS[1]!.id]),

  toggleWishlist: (product: Product) => {
    const { items, wishlistIds } = get();
    const newIds = new Set(wishlistIds);
    let newItems: Product[];

    if (newIds.has(product.id)) {
      newIds.delete(product.id);
      newItems = items.filter((p) => p.id !== product.id);
    } else {
      newIds.add(product.id);
      newItems = [product, ...items];
    }

    set({ items: newItems, wishlistIds: newIds });
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.has(productId);
  },

  removeItem: (productId: string) => {
    const { items, wishlistIds } = get();
    const newIds = new Set(wishlistIds);
    newIds.delete(productId);
    set({ items: items.filter((p) => p.id !== productId), wishlistIds: newIds });
  },
}));
