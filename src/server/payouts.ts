"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export type PayoutActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Get financial payout overview for the signed-in approved reseller.
 */
export async function getResellerPayoutOverview() {
  const session = await requireRole(["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"]);
  const userId = session.user.id;

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId },
  });

  const resellerProfileId = profile?.id ?? (await prisma.resellerProfile.findFirst())?.id;
  if (!resellerProfileId) {
    return {
      grossSalesCents: 0,
      platformFeeCents: 0,
      netEarningsCents: 0,
      paidOutCents: 0,
      availableCents: 0,
      payouts: [],
    };
  }

  // Calculate gross sales & commission snapshots from completed order items
  const items = await prisma.orderItem.findMany({
    where: { resellerProfileId },
  });

  let grossSalesCents = 0;
  let platformFeeCents = 0;

  for (const item of items) {
    const lineGross = item.unitPriceCentsSnap * item.quantity;
    grossSalesCents += lineGross;
    platformFeeCents += item.commissionCentsSnap;
  }

  const netEarningsCents = grossSalesCents - platformFeeCents;

  // Fetch payout logs from AuditLog entity "Payout"
  const payoutLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "Payout",
      actorUserId: userId,
    },
    orderBy: { createdAt: "desc" },
  });

  let paidOutCents = 0;
  const payouts = payoutLogs.map((log) => {
    const after = (log.afterJson as { amountCents?: number; status?: string; reference?: string }) ?? {};
    if (after.status === "PROCESSED") {
      paidOutCents += after.amountCents ?? 0;
    }
    return {
      id: log.id,
      amountCents: after.amountCents ?? 0,
      status: after.status ?? "PENDING",
      reference: after.reference ?? log.id.slice(0, 10),
      createdAt: log.createdAt,
    };
  });

  const availableCents = Math.max(0, netEarningsCents - paidOutCents);

  return {
    grossSalesCents,
    platformFeeCents,
    netEarningsCents,
    paidOutCents,
    availableCents,
    payouts,
  };
}

/**
 * Reseller requests payout disbursement of available funds.
 */
export async function requestResellerPayout(amountCents: number): Promise<PayoutActionResult> {
  const session = await requireRole(["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"]);
  const userId = session.user.id;

  if (amountCents <= 0) {
    return { ok: false, error: "Disbursement amount must be greater than zero." };
  }

  const overview = await getResellerPayoutOverview();
  if (amountCents > overview.availableCents) {
    return { ok: false, error: "Requested amount exceeds available net earnings balance." };
  }

  try {
    const ref = `PO-${Date.now().toString().slice(-6)}`;

    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: "payout.request",
        entityType: "Payout",
        entityId: ref,
        afterJson: { amountCents, status: "PENDING", reference: ref },
      },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Fetch pending reseller payout requests for finance admin console.
 */
export async function getAdminPayoutQueue() {
  await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);

  const logs = await prisma.auditLog.findMany({
    where: { entityType: "Payout" },
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return logs.map((log) => {
    const after = (log.afterJson as { amountCents?: number; status?: string; reference?: string }) ?? {};
    return {
      id: log.id,
      entityId: log.entityId,
      amountCents: after.amountCents ?? 0,
      status: after.status ?? "PENDING",
      reference: after.reference ?? log.entityId,
      actorName: log.actor?.name || log.actor?.email || "Reseller",
      createdAt: log.createdAt,
    };
  });
}

/**
 * Finance admin approves payout disbursement.
 */
export async function processAdminPayout(auditLogId: string): Promise<PayoutActionResult> {
  const session = await requireRole(["FINANCE", "ADMIN", "SUPER_ADMIN"]);
  const userId = session.user.id;

  const log = await prisma.auditLog.findUnique({ where: { id: auditLogId } });
  if (!log) {
    return { ok: false, error: "Payout record not found." };
  }

  const after = (log.afterJson as { amountCents?: number; reference?: string }) ?? {};

  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: "payout.processed",
        entityType: "Payout",
        entityId: log.entityId,
        afterJson: { amountCents: after.amountCents, status: "PROCESSED", reference: after.reference },
      },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
