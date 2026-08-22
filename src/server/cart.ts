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
          resellerProfile: { select: { legalName: true, id: true } },
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

    return {
      id: item.id,
      variantId: item.variantId,
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
    };
  });

  const shippingCents = subtotalCents > 0 ? (subtotalCents > 10000 ? 0 : 799) : 0; // Free shipping over $100
  const taxCents = Math.round(subtotalCents * 0.08); // 8% tax rate
  const totalCents = subtotalCents + shippingCents + taxCents;

  return {
    id: cart.id,
    items: detailedItems,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
  };
}

/**
 * Add product variant to cart.
 */
export async function addToCart(variantIdOrSlug: string, quantity = 1): Promise<CartActionResult> {
  const session = await requireSession();
  const userId = (session.user as { id: string }).id;

  let variant = await prisma.productVariant.findUnique({
    where: { id: variantIdOrSlug },
    include: { inventory: true },
  });

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
 * Update cart item quantity.
 */
export async function updateCartItemQuantity(cartItemId: string, quantity: number): Promise<CartActionResult> {
  await requireSession();

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  try {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Remove line item from cart.
 */
export async function removeFromCart(cartItemId: string): Promise<CartActionResult> {
  await requireSession();

  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
