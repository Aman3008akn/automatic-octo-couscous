import { create } from "zustand";
import { Cart, CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;

  syncCart: (cart: Cart) => void;
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
}

function computeTotals(items: CartItem[]) {
  const subtotalCents = items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const shippingCents = subtotalCents > 199900 || subtotalCents === 0 ? 0 : 9900; // Free delivery over ₹1,999
  const taxCents = Math.round(subtotalCents * 0.18); // 18% GST estimate
  const totalCents = subtotalCents + shippingCents + taxCents;

  return { itemCount, subtotalCents, shippingCents, taxCents, totalCents };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  subtotalCents: 0,
  shippingCents: 0,
  taxCents: 0,
  totalCents: 0,

  syncCart: (cart: Cart) => {
    const totals = computeTotals(cart.items);
    set({ items: cart.items, ...totals });
  },

  addItem: (product: Product, variantId?: string, quantity: number = 1) => {
    const currentItems = get().items;
    const vId = variantId || product.variants?.[0]?.id || `var-${product.id}`;
    const existingIndex = currentItems.findIndex((i) => i.variantId === vId);

    let updated: CartItem[] = [...currentItems];
    if (existingIndex > -1 && updated[existingIndex]) {
      updated[existingIndex]!.quantity += quantity;
    } else {
      const priceCents = product.variants?.find((v) => v.id === vId)?.priceCents || product.priceCents;
      const compareAtCents = product.variants?.find((v) => v.id === vId)?.compareAtCents || product.compareAtCents;
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        cartItemId: `ci-${Date.now()}`,
        variantId: vId,
        productId: product.id,
        title: product.title,
        sku: product.variants?.find((v) => v.id === vId)?.sku || `SKU-${product.id.substring(0, 5)}`,
        quantity,
        priceCents,
        compareAtCents,
        imageUrl: product.imageUrl,
        availableStock: product.availableStock || 10,
        sellerName: product.sellerName,
        fulfillmentMode: product.sellerFulfillment || "cartigo",
        deliveryEstimate: "2-4 Business Days",
      };
      updated = [newItem, ...currentItems];
    }

    set({ items: updated, ...computeTotals(updated) });
  },

  updateQuantity: (cartItemId: string, quantity: number) => {
    const currentItems = get().items;
    let updated: CartItem[];
    if (quantity <= 0) {
      updated = currentItems.filter((i) => i.cartItemId !== cartItemId && i.id !== cartItemId);
    } else {
      updated = currentItems.map((i) =>
        i.cartItemId === cartItemId || i.id === cartItemId ? { ...i, quantity } : i
      );
    }
    set({ items: updated, ...computeTotals(updated) });
  },

  removeItem: (cartItemId: string) => {
    const updated = get().items.filter((i) => i.cartItemId !== cartItemId && i.id !== cartItemId);
    set({ items: updated, ...computeTotals(updated) });
  },

  clearCart: () => {
    set({
      items: [],
      itemCount: 0,
      subtotalCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  },
}));
