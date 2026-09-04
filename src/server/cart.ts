"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";

export type CartActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Get current signed-in user's cart with items and total calculation.
 */
export async function getCart() {
  const session = await requireSession();
  const userId = (session.user as { id: string }).id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          cart: false,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return {
      id: cart?.id ?? null,
      items: [],
      subtotalCents: 0,
      shippingCents: 0,
      taxCents: 0,
      totalCents: 0,
    };
  }

  // Fetch variant details for all cart items
  const variantIds = cart.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          resellerProfile: { select: { legalName: true, id: true, fulfillmentMode: true } },
        },
      },
      inventory: true,
    },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  let subtotalCents = 0;

  const detailedItems = cart.items.map((item) => {
    const v = variantMap.get(item.variantId);
    const unitPriceCents = v?.priceCents ?? 0;
    const lineTotalCents = unitPriceCents * item.quantity;
    subtotalCents += lineTotalCents;

    const isCartigoFulfill = v?.product.resellerProfile.fulfillmentMode === "cartigo";
    const deliveryDays = isCartigoFulfill ? 2 : 4;
    const deliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
    const deliveryEstimate = `${isCartigoFulfill ? "Express Delivery" : "Standard Delivery"} by ${deliveryDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" })}`;

    return {
      id: item.id,
      variantId: item.variantId,
      productId: v?.product.id ?? "",
      quantity: item.quantity,
      unitPriceCents,
      lineTotalCents,
      sku: v?.sku ?? "N/A",
      title: v?.product.title ?? "Product",
      brand: v?.product.brand ?? "",
      imageUrl: v?.product.images[0]?.url ?? null,
      resellerName: v?.product.resellerProfile.legalName ?? "Verified Reseller",
      resellerProfileId: v?.product.resellerProfile.id ?? "",
      availableStock: v?.inventory?.available ?? 0,
      compareAtCents: (v?.product as any)?.compareAtCents ?? Math.round(unitPriceCents * 1.25),
      deliveryEstimate,
    };
  });

  // Free shipping over ₹999 (99900 cents), otherwise ₹99 (9900 cents)
  const shippingCents = subtotalCents > 0 ? (subtotalCents >= 99900 ? 0 : 9900) : 0;
  // 18% GST
  const taxCents = Math.round(subtotalCents * 0.18);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    id: cart.id,
    items: detailedItems,
    subtotalCents,
    shippingCents,
    taxCents,
    taxLabel: "Estimated GST (18%)",
    totalCents,
  };
}

/**
 * Add product variant to cart.
 */
export async function addToCart(variantIdOrSlug: string, quantity = 1): Promise<CartActionResult> {
  const session = await requireSession();
  const userId = (session.user as { id: string }).id;

  let variant = null;
  
  // Only query by ID if it's a valid 24-character hex string (MongoDB ObjectId)
  if (/^[0-9a-fA-F]{24}$/.test(variantIdOrSlug)) {
    variant = await prisma.productVariant.findUnique({
      where: { id: variantIdOrSlug },
      include: { inventory: true },
    });
  }

  if (!variant) {
    const product = await prisma.product.findUnique({
      where: { slug: variantIdOrSlug },
      include: { variants: { include: { inventory: true }, take: 1 } },
    });
    variant = product?.variants[0] ?? null;
  }

  if (!variant) {
    return { ok: false, error: "Product variant not found." };
  }

  const available = variant.inventory?.available ?? 0;
  if (available < quantity) {
    return { ok: false, error: `Only ${available} units available in stock.` };
  }

  try {
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: { cartId: cart.id, variantId: variant.id },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > available) {
        return { ok: false, error: `Cannot add more than available stock (${available} units).` };
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variant.id,
          quantity,
        },
      });
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Update cart item quantity with strict user ownership and inventory stock validation.
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartActionResult> {
  try {
    const session = await requireSession();
    const userId = (session.user as { id: string }).id;

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    // Ownership check: Ensure cart belongs to the signed-in user
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      return { ok: false, error: "Cart item not found or unauthorized." };
    }

    // Stock availability validation
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { inventory: true },
    });

    const available = variant?.inventory?.available ?? 0;
    if (quantity > available) {
      return { ok: false, error: `Only ${available} units available in stock.` };
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Error updating cart quantity:", error);
    return { ok: false, error: error?.message || "Failed to update quantity." };
  }
}

/**
 * Remove line item from cart with user ownership validation.
 */
export async function removeFromCart(cartItemId: string): Promise<CartActionResult> {
  try {
    const session = await requireSession();
    const userId = (session.user as { id: string }).id;

    // Ownership check
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      return { ok: false, error: "Cart item not found or unauthorized." };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Error removing cart item:", error);
    return { ok: false, error: error?.message || "Failed to remove item." };
  }
}

/**
 * Move item from cart to wishlist (Save for later) with ownership verification.
 */
export async function saveForLater(cartItemId: string): Promise<CartActionResult> {
  try {
    const session = await requireSession();
    const userId = (session.user as { id: string }).id;

    // Ownership check & get product reference
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      return { ok: false, error: "Cart item not found or unauthorized." };
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { productId: true },
    });

    const productId = variant?.productId;

    await prisma.$transaction(async (tx) => {
      // 1. Upsert wishlist
      const wishlist = await tx.wishlist.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      // 2. Add to wishlist if not already there
      if (productId) {
        const exists = await tx.wishlistItem.findUnique({
          where: {
            wishlistId_productId: { wishlistId: wishlist.id, productId },
          },
        });
        if (!exists) {
          await tx.wishlistItem.create({
            data: {
              wishlistId: wishlist.id,
              productId,
            },
          });
        }
      }

      // 3. Remove from cart
      await tx.cartItem.delete({
        where: { id: cartItemId },
      });
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Error saving for later:", error);
    return { ok: false, error: error?.message || "Failed to save item for later." };
  }
}
