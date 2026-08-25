"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";

export async function getAllOrdersAdmin() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Ensure serialization
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalCents: o.totalCents,
    createdAt: o.createdAt,
    paymentMethod: (o as any).paymentMethod,
    shippingAddress: (o as any).shippingAddress,
    user: o.user,
    itemsCount: o.items.reduce((acc, item) => acc + item.quantity, 0),
  }));
}

export async function updateOrderStatusAdmin(orderId: string, newStatus: OrderStatus) {
  const session = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: false, error: "Order not found" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: newStatus,
          actorUserId: session.user.id,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: `admin.order_status_update`,
          entityType: "Order",
          entityId: orderId,
          afterJson: { status: newStatus },
        },
      });
    });

    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
