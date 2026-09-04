"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { ResellerStatus } from "@prisma/client";

function tryParseJson(val: string) {
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

/**
 * Fetch reseller applications for admin review queue with filtering and search.
 */
export async function getAdminResellerApplications(statusFilter?: ResellerStatus | "ALL", searchQuery?: string) {
  try {
    await requireRole(["ADMIN", "SUPER_ADMIN"]);

    const whereClause: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim();
      whereClause.OR = [
        { resellerProfile: { legalName: { contains: q, mode: "insensitive" } } },
        { resellerProfile: { contactEmail: { contains: q, mode: "insensitive" } } },
        { resellerProfile: { contactPerson: { contains: q, mode: "insensitive" } } },
        { id: { contains: q, mode: "insensitive" } },
      ];
    }

    const applications = await prisma.resellerApplication.findMany({
      where: whereClause,
      include: {
        resellerProfile: {
          include: {
            user: {
              select: { id: true, email: true, name: true, createdAt: true },
            },
            statusLog: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            documents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return applications.map((app) => ({
      id: app.id,
      status: app.status,
      categories: app.categories,
      monthlyVolumeEst: app.monthlyVolumeEst,
      returnPolicyNote: app.returnPolicyNote,
      businessDescription: app.businessDescription,
      submittedAt: app.submittedAt,
      decidedAt: app.decidedAt,
      rejectionReason: app.rejectionReason,
      internalNotes: app.internalNotes,
      createdAt: app.createdAt,
      profile: {
        id: app.resellerProfile.id,
        legalName: app.resellerProfile.legalName,
        contactPerson: app.resellerProfile.contactPerson,
        contactEmail: app.resellerProfile.contactEmail,
        contactPhone: app.resellerProfile.contactPhone,
        country: app.resellerProfile.country,
        businessType: app.resellerProfile.businessType,
        fulfillmentMode: app.resellerProfile.fulfillmentMode,
        status: app.resellerProfile.status,
        user: app.resellerProfile.user,
        statusLog: app.resellerProfile.statusLog,
        documents: app.resellerProfile.documents,
      },
    }));
  } catch (error: any) {
    if (error?.code === "FORBIDDEN" || error?.code === "UNAUTHORIZED" || error?.name === "ForbiddenError" || error?.name === "UnauthorizedError") {
      throw error;
    }
    console.error("Error in getAdminResellerApplications:", error);
    throw new Error("Unable to load reseller applications from database.");
  }
}
