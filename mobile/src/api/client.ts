import Constants from "expo-constants";
import { getAuthToken } from "../utils/storage";
import { Product, Category, Banner, Cart, Order } from "../types";
import { MOCK_BANNERS, MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_ORDERS } from "./mockData";

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // If running in Expo Go or development, extract the host IP dynamically
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:3000`;
    }
  }
  // Default to the computer's LAN IP
  return "http://192.168.1.8:3000";
}

const API_BASE = getApiBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (error: any) {
    console.warn(`API ${endpoint} failed, falling back to local store:`, error?.message);
    throw error;
  }
}

export const api = {
  // Banners
  async getBanners(position?: string): Promise<Banner[]> {
    try {
      const query = position ? `?position=${position}` : "";
      return await request<Banner[]>(`/api/v1/banners${query}`);
    } catch {
      return MOCK_BANNERS;
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await request<Category[]>("/api/v1/categories");
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  // Products
  async getProducts(params: {
    q?: string;
    categorySlug?: string;
    sortBy?: string;
    minPriceCents?: number;
    maxPriceCents?: number;
    take?: number;
    skip?: number;
  } = {}): Promise<{ items: Product[]; totalCount: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.set("q", params.q);
      if (params.categorySlug && params.categorySlug !== "all") queryParams.set("categorySlug", params.categorySlug);
      if (params.sortBy) queryParams.set("sortBy", params.sortBy);
      if (params.minPriceCents !== undefined) queryParams.set("minPriceCents", params.minPriceCents.toString());
      if (params.maxPriceCents !== undefined) queryParams.set("maxPriceCents", params.maxPriceCents.toString());
      if (params.take) queryParams.set("take", params.take.toString());
      if (params.skip) queryParams.set("skip", params.skip.toString());

      const res = await request<{ items: Product[]; totalCount: number }>(`/api/v1/products?${queryParams.toString()}`);
      return res;
    } catch {
      let filtered = [...MOCK_PRODUCTS];
      if (params.categorySlug && params.categorySlug !== "all") {
        filtered = filtered.filter((p) => p.categorySlug === params.categorySlug);
      }
      if (params.q) {
        const q = params.q.toLowerCase();
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
      }
      return { items: filtered, totalCount: filtered.length };
    }
  },

  // Single Product
  async getProductById(id: string): Promise<Product> {
    try {
      return await request<Product>(`/api/v1/products/${id}`);
    } catch {
      const found = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
      if (found) return found;
      return MOCK_PRODUCTS[0]!;
    }
  },

  // Cart
  async getCart(): Promise<Cart> {
    try {
      return await request<Cart>("/api/v1/cart");
    } catch {
      return {
        id: "mock-cart",
        items: [],
        subtotalCents: 0,
        shippingCents: 0,
        taxCents: 0,
        totalCents: 0,
      };
    }
  },

  async addToCart(variantId: string, quantity: number = 1): Promise<Cart> {
    return await request<Cart>("/api/v1/cart", {
      method: "POST",
      body: JSON.stringify({ variantId, quantity }),
    });
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    return await request<Cart>("/api/v1/cart", {
      method: "PUT",
      body: JSON.stringify({ cartItemId, quantity }),
    });
  },

  async removeCartItem(cartItemId: string): Promise<Cart> {
    return await request<Cart>(`/api/v1/cart?cartItemId=${cartItemId}`, {
      method: "DELETE",
    });
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    try {
      return await request<Order[]>("/api/v1/orders");
    } catch {
      return MOCK_ORDERS;
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      return await request<Order>(`/api/v1/orders/${id}`);
    } catch {
      const found = MOCK_ORDERS.find((o) => o.id === id || o.orderNumber === id);
      return found || MOCK_ORDERS[0]!;
    }
  },

  async createOrder(data: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    paymentMethod: "CARD" | "COD";
  }): Promise<{ orderId: string; orderNumber: string }> {
    try {
      return await request<{ orderId: string; orderNumber: string }>("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      return {
        orderId: `mock-ord-${Date.now()}`,
        orderNumber: `CTG-2026-${randNum}`,
      };
    }
  },

  // Wishlist
  async getWishlist(): Promise<Product[]> {
    try {
      return await request<Product[]>("/api/v1/wishlist");
    } catch {
      return [MOCK_PRODUCTS[0]!, MOCK_PRODUCTS[1]!];
    }
  },

  async addToWishlist(productId: string): Promise<{ ok: boolean }> {
    return await request<{ ok: boolean }>("/api/v1/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  },

  async removeFromWishlist(productId: string): Promise<{ ok: boolean }> {
    return await request<{ ok: boolean }>(`/api/v1/wishlist?productId=${productId}`, {
      method: "DELETE",
    });
  },
};
