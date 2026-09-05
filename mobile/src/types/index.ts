export type Role =
  | "CUSTOMER"
  | "RESELLER_APPLICANT"
  | "APPROVED_RESELLER"
  | "MODERATOR"
  | "SUPPORT"
  | "FINANCE"
  | "ADMIN"
  | "SUPER_ADMIN";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "FULFILLING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: Role;
  addresses?: Address[];
  resellerProfile?: {
    id: string;
    status: string;
    legalName: string;
  } | null;
}

export interface Address {
  id: string;
  label?: string | null; // Home, Work
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  priceCents: number;
  compareAtCents?: number | null;
  availableStock: number;
  options?: Record<string, any>;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand?: string | null;
  condition?: string | null;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  hoverImageUrl?: string;
  images?: string[];
  priceCents: number;
  compareAtCents?: number | null;
  discountPercent?: number;
  sellerName: string;
  sellerFulfillment?: string;
  availableStock: number;
  primaryVariant?: ProductVariant | null;
  variants?: ProductVariant[];
  attributes?: { key: string; value: string }[];
}

export interface CartItem {
  id: string;
  cartItemId: string;
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  priceCents: number;
  compareAtCents?: number | null;
  imageUrl: string;
  availableStock: number;
  sellerName: string;
  fulfillmentMode: string;
  deliveryEstimate: string;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

export interface OrderItem {
  id: string;
  variantId: string;
  titleSnapshot: string;
  skuSnapshot: string;
  unitPriceCentsSnap: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: Address | null;
  paymentMethod?: string | null;
  items: OrderItem[];
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  position: string;
  isActive: boolean;
  order: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}
