"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

/**
 * Fetch detailed administrative activity log specifically for monitoring Sumit Gautam's actions.
 * Accessible by Super Admins (specifically Aman Shukla).
 */
export async function getSumitGautamActivityLogs() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const sumitUser = await prisma.user.findUnique({
    where: { email: "sumitgautam@cartigo.admin" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!sumitUser) {
    return {
      user: null,
      logs: [],
      totalActions: 0,
      lastActive: null,
    };
  }

  const logs = await prisma.auditLog.findMany({
    where: { actorUserId: sumitUser.id },
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    user: sumitUser,
    logs,
    totalActions: logs.length,
    lastActive: logs[0]?.createdAt ?? sumitUser.updatedAt,
  };
}

/**
 * Fetch all admin audit logs with optional filter by admin email.
 */
export async function getFilteredAdminAuditLogs(adminEmailFilter?: string) {
  await requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT", "FINANCE"]);

  const whereClause: Record<string, unknown> = {};

  if (adminEmailFilter && adminEmailFilter !== "ALL") {
    whereClause.actor = { email: adminEmailFilter };
  }

  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs;
}
