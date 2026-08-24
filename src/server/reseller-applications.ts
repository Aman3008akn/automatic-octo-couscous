"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { ResellerStatus } from "@prisma/client";

const decisionSchema = z.object({
  applicationId: z.string().length(24, "Must be a valid MongoDB ObjectId"),
  decision: z.enum(["APPROVED", "REJECTED", "INFO_REQUESTED"]),
  reason: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
});

export type DecisionInput = z.infer<typeof decisionSchema>;
export type DecisionResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

/**
 * Decide a pending reseller application. Reference implementation for the
 * "server validates even though the UI already validated" + "audit every
 * state change" + "wrap multi-row mutation in a transaction" patterns that
 * repeat throughout the moderation and admin-decision requirements.
 */
export async function decideResellerApplication(
  input: DecisionInput
): Promise<DecisionResult> {
  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request.", code: "VALIDATION_ERROR" };
  }

  let session;
  try {
    session = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
  } catch {
    return { ok: false, error: "Not authorized.", code: "FORBIDDEN" };
  }

  const { applicationId, decision, reason, internalNotes } = parsed.data;

  const application = await prisma.resellerApplication.findUnique({
    where: { id: applicationId },
    include: { resellerProfile: true },
  });
  if (!application) {
    return { ok: false, error: "Application not found.", code: "NOT_FOUND" };
  }
  // Allow admins to revise or update status decisions (e.g. undo accidental rejection)


  const profileStatus: ResellerStatus = decision;
  const actorUserId = (session.user as { id: string }).id;

  await prisma.$transaction(async (tx) => {
    await tx.resellerApplication.update({
      where: { id: applicationId },
      data: {
        status: decision,
        decidedAt: new Date(),
        decidedByUserId: actorUserId,
        rejectionReason: decision === "REJECTED" ? reason ?? null : null,
        internalNotes: internalNotes ?? application.internalNotes,
      },
    });

    await tx.resellerProfile.update({
      where: { id: application.resellerProfileId },
      data: { status: profileStatus },
    });

      if (decision === "APPROVED") {
        const userToUpdate = await tx.user.findUnique({
          where: { id: application.resellerProfile.userId },
        });
        if (userToUpdate && !["ADMIN", "SUPER_ADMIN"].includes(userToUpdate.role)) {
          await tx.user.update({
            where: { id: application.resellerProfile.userId },
            data: { role: "APPROVED_RESELLER" },
          });
        }

      // Automatically list all products of this reseller when approved
      await tx.product.updateMany({
        where: { resellerProfileId: application.resellerProfileId },
        data: { status: "APPROVED" },
      });
    } else if (decision === "REJECTED" || decision === "INFO_REQUESTED") {
      await tx.product.updateMany({
        where: { resellerProfileId: application.resellerProfileId },
        data: { status: "PENDING_REVIEW" },
      });
    }

    await tx.resellerStatusHistory.create({
      data: {
        resellerProfileId: application.resellerProfileId,
        fromStatus: application.resellerProfile.status,
        toStatus: profileStatus,
        actorUserId,
        reason: reason ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId,
        action: `reseller_application.${decision.toLowerCase()}`,
        entityType: "ResellerApplication",
        entityId: applicationId,
        beforeJson: { status: application.status },
        afterJson: { status: decision },
      },
    });
  });

  // Notification dispatch (email/in-app) is queued here in a later slice —
  // kept out of the transaction so a notification-provider outage can never
  // roll back a decision that has already been made.

  return { ok: true };
}
