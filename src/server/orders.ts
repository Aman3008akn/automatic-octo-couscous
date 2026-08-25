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
      // 2. Validate and reserve stock for each variant
      for (const item of cart.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { inventory: true },
        });

        if (!variant || (variant.inventory?.available ?? 0) < item.quantity) {
          throw new Error(`Insufficient stock for "${item.title}". Only ${variant?.inventory?.available ?? 0} available.`);
        }

        // Reserve stock
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            available: { decrement: item.quantity },
            reserved: { increment: item.quantity },
          },
        });
      }

      const initialStatus = data.paymentMethod === "COD" ? "PENDING_PAYMENT" : "PAID";

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

      // 5. Record OrderStatusHistory
      if (initialStatus !== "PENDING_PAYMENT") {
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: "PENDING_PAYMENT",
            toStatus: initialStatus,
            actorUserId: userId,
          },
        });
      }

      // 6. Clear user cart
      if (cart.id) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      // 7. Audit log
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: "order.create",
          entityType: "Order",
          entityId: order.id,
          afterJson: { orderNumber, totalCents: cart.totalCents, status: initialStatus, paymentMethod: data.paymentMethod },
        },
      });

      return order;
    });

    return { ok: true, orderId: result.id, orderNumber: result.orderNumber };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
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

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId },
  });

  const resellerProfileId = profile?.id;

  const orderItems = await prisma.orderItem.findMany({
    where: resellerProfileId ? { resellerProfileId } : {},
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

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, error: "Order not found." };
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
