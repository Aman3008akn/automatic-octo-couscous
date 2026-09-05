"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/authz";
import { getCart } from "./cart";
import type { OrderStatus } from "@prisma/client";

const checkoutSchema = z.object({
  line1: z.string().min(3, "Street address is required."),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  postalCode: z.string().min(3, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
  phone: z.string().min(6, "Phone number is required."),
  paymentMethod: z.enum(["CARD", "COD"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type OrderActionResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string; code?: string };

/**
 * Transactional checkout & order creation from cart.
 */
export async function createOrderFromCart(input: CheckoutInput): Promise<OrderActionResult> {
  const session = await requireSession();
  const userId = session.user.id;

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" "), code: "VALIDATION_ERROR" };
  }

  const data = parsed.data;

  // 1. Fetch current cart
  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return { ok: false, error: "Your shopping cart is empty.", code: "EMPTY_CART" };
  }

  // Generate unique human-friendly order number
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `CTG-${new Date().getFullYear()}-${randNum}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 2. Validate and atomically reserve stock for each variant with sellable checks
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            inventory: true,
            product: { include: { resellerProfile: true } },
          },
        });

        if (!variant) {
          throw new Error(`Product variant for "${item.title}" not found.`);
        }

        if (variant.product.status !== "APPROVED" || variant.product.resellerProfile?.status !== "APPROVED") {
          throw new Error(`"${item.title}" is no longer available from a verified reseller.`);
        }

        // Atomic concurrent reservation: checks and decrements in single query
        const updateRes = await tx.inventory.updateMany({
          where: {
            variantId: item.variantId,
            available: { gte: item.quantity },
          },
          data: {
            available: { decrement: item.quantity },
            reserved: { increment: item.quantity },
          },
        });

        if (updateRes.count === 0) {
          throw new Error(`Insufficient stock for "${item.title}". Only ${variant.inventory?.available ?? 0} available.`);
        }
      }

      // Security fix: CARD and COD both start at PENDING_PAYMENT until payment confirmation
      const initialStatus: OrderStatus = "PENDING_PAYMENT";

      // 3. Create Order
      const orderData: any = {
        orderNumber,
        userId,
        status: initialStatus,
        subtotalCents: cart.subtotalCents,
        shippingCents: cart.shippingCents,
        taxCents: cart.taxCents,
        totalCents: cart.totalCents,
        currency: "INR",
        paymentMethod: data.paymentMethod,
        shippingAddress: {
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
      };

      const order = await tx.order.create({
        data: orderData,
      });

      // 4. Create OrderItems with snapshotting
      for (const item of cart.items) {
        const commissionCentsSnap = Math.round(item.lineTotalCents * 0.15); // 15% platform commission

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            resellerProfileId: item.resellerProfileId,
            titleSnapshot: item.title,
            skuSnapshot: item.sku,
            unitPriceCentsSnap: item.unitPriceCents,
            quantity: item.quantity,
            commissionCentsSnap,
          },
        });
      }

      // 5. Clear the user's cart
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }

      // 6. Record Audit Log
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: "order.create",
          entityType: "Order",
          entityId: order.id,
          afterJson: {
            orderNumber: order.orderNumber,
            totalCents: order.totalCents,
            paymentMethod: data.paymentMethod,
            status: initialStatus,
          },
        },
      });

      return { order, orderNumber: order.orderNumber };
    });

    return { ok: true, orderId: result.order.id, orderNumber: result.orderNumber };
  } catch (error) {
    console.error("Error creating order from cart:", error);
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Confirm payment for a pending order (called by payment gateway webhook or client verification).
 */
export async function confirmOrderPayment(orderId: string, paymentIntentId: string) {
  const session = await requireSession();
  const userId = session.user.id;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  if (order.userId !== userId && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return { ok: false, error: "Unauthorized access to order." };
  }

  if (order.status === "PAID") {
    return { ok: true, message: "Order is already marked as paid." };
  }

  if (!paymentIntentId || paymentIntentId.trim().length < 5) {
    return { ok: false, error: "Invalid payment confirmation reference." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: "PENDING_PAYMENT",
        toStatus: "PAID",
        actorUserId: userId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: userId,
        action: "order.payment_confirmed",
        entityType: "Order",
        entityId: orderId,
        afterJson: { paymentIntentId, status: "PAID" },
      },
    });
  });

  return { ok: true };
}

/**
 * Fetch signed-in customer's order history.
 */
export async function getMyOrders() {
  const session = await requireSession();
  const userId = session.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      statusLog: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    subtotalCents: o.subtotalCents,
    shippingCents: o.shippingCents,
    taxCents: o.taxCents,
    totalCents: o.totalCents,
    currency: o.currency,
    createdAt: o.createdAt,
    items: o.items,
    statusLog: o.statusLog,
  }));
}

/**
 * Fetch orders containing products owned by the reseller profile.
 */
export async function getResellerFulfillmentOrders() {
  const session = await requireRole(["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"]);
  const userId = session.user.id;
  const userRole = session.user.role;

  let whereClause: any = {};

  // Strict check: if role is APPROVED_RESELLER, must have a profile and only see own order items
  if (userRole === "APPROVED_RESELLER") {
    const profile = await prisma.resellerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return [];
    }
    whereClause = { resellerProfileId: profile.id };
  }

  const orderItems = await prisma.orderItem.findMany({
    where: whereClause,
    include: {
      order: {
        include: {
          user: { select: { name: true, email: true } },
          statusLog: { orderBy: { createdAt: "desc" } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  return orderItems.map((item) => ({
    orderItemId: item.id,
    orderId: item.order.id,
    orderNumber: item.order.orderNumber,
    status: item.order.status,
    customerName: item.order.user.name || item.order.user.email,
    titleSnapshot: item.titleSnapshot,
    skuSnapshot: item.skuSnapshot,
    unitPriceCentsSnap: item.unitPriceCentsSnap,
    quantity: item.quantity,
    commissionCentsSnap: item.commissionCentsSnap,
    createdAt: item.order.createdAt,
    statusLog: item.order.statusLog,
  }));
}

/**
 * Reseller or admin updates order fulfillment status (e.g. FULFILLING, SHIPPED, DELIVERED).
 */
export async function updateFulfillmentStatus(orderId: string, toStatus: OrderStatus, trackingNumber?: string, carrier?: string) {
  const session = await requireRole(["APPROVED_RESELLER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]);
  const userId = session.user.id;
  const userRole = session.user.role;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  // Security Check: If the caller is an APPROVED_RESELLER, they must own an item in this order
  if (userRole === "APPROVED_RESELLER") {
    const profile = await prisma.resellerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return { ok: false, error: "Reseller profile not found." };
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        resellerProfileId: profile.id,
      },
    });

    if (!orderItem) {
      return { ok: false, error: "You are not authorized to update this order." };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: toStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          actorUserId: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: `order.fulfillment_${toStatus.toLowerCase()}`,
          entityType: "Order",
          entityId: orderId,
          afterJson: { status: toStatus, trackingNumber, carrier },
        },
      });
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Fetch a single order by ID or orderNumber for current user or admin.
 */
export async function getOrderById(orderIdOrNumber: string) {
  const session = await requireSession();
  const userId = session.user.id;
  const isPrivileged = ["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(session.user.role);

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }],
      ...(isPrivileged ? {} : { userId }),
    },
    include: {
      items: true,
      statusLog: { orderBy: { createdAt: "desc" } },
    },
  });

  return order;
}

/**
 * Cancel an order if it is in PENDING_PAYMENT or FULFILLING.
 */
export async function cancelOrder(orderId: string) {
  const session = await requireSession();
  const userId = session.user.id;
  const isPrivileged = ["ADMIN", "SUPER_ADMIN", "SUPPORT"].includes(session.user.role);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { ok: false, error: "Order not found." };
  }

  if (order.userId !== userId && !isPrivileged) {
    return { ok: false, error: "Unauthorized access to order." };
  }

  if (["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)) {
    return { ok: false, error: `Cannot cancel an order with status ${order.status}.` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "CANCELLED",
        actorUserId: userId,
      },
    });
  });

  return { ok: true };
}

