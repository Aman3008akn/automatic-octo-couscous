"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import type { ResellerStatus } from "@prisma/client";

// Input schema for reseller application
const resellerApplicationSchema = z.object({
  legalName: z.string().min(2, "Legal business name is required."),
  contactPerson: z.string().min(2, "Contact person name is required."),
  contactEmail: z.string().email("Valid contact email is required."),
  contactPhone: z.string().min(6, "Valid phone number is required."),
  country: z.string().min(2, "Country code/name is required."),
  businessType: z.string().min(2, "Business type is required."),
  fulfillmentMode: z.enum(["reseller", "cartigo"]),
  categories: z.array(z.string()).min(1, "Select at least one category."),
  monthlyVolumeEst: z.number().int().positive().optional(),
  returnPolicyNote: z.string().max(1000).optional(),
  businessDescription: z.string().max(2000).optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to reseller terms."),
});

export type ResellerApplicationInput = z.infer<typeof resellerApplicationSchema>;

export type ApplicationResult =
  | { ok: true; status: ResellerStatus; applicationId: string }
  | { ok: false; error: string; code?: string };

/**
 * Fetch profile and status for the current session user.
 * STRICT PRIVACY REQUIREMENT: Admin `internalNotes` are NEVER exposed to the reseller.
 * Only `rejectionReason` (if REJECTED) or public status fields are returned.
 */
export async function getMyResellerStatus() {
  const session = await requireSession();
  const userId = session.user.id;

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      statusLog: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!profile) {
    return { hasProfile: false };
  }

  const latestApp = profile.applications[0] ?? null;

  return {
    hasProfile: true,
    profileId: profile.id,
    status: profile.status,
    legalName: profile.legalName,
    contactPerson: profile.contactPerson,
    contactEmail: profile.contactEmail,
    fulfillmentMode: profile.fulfillmentMode,
    categories: latestApp?.categories ?? [],
    submittedAt: latestApp?.submittedAt ?? null,
    decidedAt: latestApp?.decidedAt ?? null,
    // EXPLICIT PRIVACY RULE: Only return rejectionReason if REJECTED. Never return internalNotes!
    rejectionReason: profile.status === "REJECTED" ? latestApp?.rejectionReason ?? null : null,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Save draft reseller application.
 */
export async function saveResellerApplicationDraft(input: Partial<ResellerApplicationInput>): Promise<ApplicationResult> {
  const session = await requireSession();
  const userId = session.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update profile
      const profile = await tx.resellerProfile.upsert({
        where: { userId },
        update: {
          legalName: input.legalName ?? "Draft Business",
          contactPerson: input.contactPerson ?? session.user.name ?? "Draft Contact",
          contactEmail: input.contactEmail ?? session.user.email ?? "",
          contactPhone: input.contactPhone ?? "",
          country: input.country ?? "US",
          businessType: input.businessType ?? "LLC",
          fulfillmentMode: input.fulfillmentMode ?? "reseller",
          status: "DRAFT",
        },
        create: {
          userId,
          legalName: input.legalName ?? "Draft Business",
          contactPerson: input.contactPerson ?? session.user.name ?? "Draft Contact",
          contactEmail: input.contactEmail ?? session.user.email ?? "",
          contactPhone: input.contactPhone ?? "",
          country: input.country ?? "US",
          businessType: input.businessType ?? "LLC",
          fulfillmentMode: input.fulfillmentMode ?? "reseller",
          status: "DRAFT",
        },
      });

      // 2. Ensure user role is updated to RESELLER_APPLICANT
      await tx.user.update({
        where: { id: userId },
        data: { role: "RESELLER_APPLICANT" },
      });

      // 3. Create or update application draft
      const existingApp = await tx.resellerApplication.findFirst({
        where: { resellerProfileId: profile.id, status: "DRAFT" },
      });

      let app;
      if (existingApp) {
        app = await tx.resellerApplication.update({
          where: { id: existingApp.id },
          data: {
            categories: input.categories ?? [],
            monthlyVolumeEst: input.monthlyVolumeEst ?? null,
            returnPolicyNote: input.returnPolicyNote ?? null,
            businessDescription: input.businessDescription ?? null,
          },
        });
      } else {
        app = await tx.resellerApplication.create({
          data: {
            resellerProfileId: profile.id,
            status: "DRAFT",
            categories: input.categories ?? [],
            monthlyVolumeEst: input.monthlyVolumeEst ?? null,
            returnPolicyNote: input.returnPolicyNote ?? null,
            businessDescription: input.businessDescription ?? null,
          },
        });
      }

      return { profile, app };
    });

    return { ok: true, status: result.profile.status, applicationId: result.app.id };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Submit reseller application for admin review.
 */
export async function submitResellerApplication(input: ResellerApplicationInput): Promise<ApplicationResult> {
  const session = await requireSession();
  const userId = session.user.id;

  const parsed = resellerApplicationSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(" ");
    return { ok: false, error: errorMsg, code: "VALIDATION_ERROR" };
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert Reseller Profile
      const profile = await tx.resellerProfile.upsert({
        where: { userId },
        update: {
          legalName: data.legalName,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          country: data.country,
          businessType: data.businessType,
          fulfillmentMode: data.fulfillmentMode,
          status: "PENDING_REVIEW",
        },
        create: {
          userId,
          legalName: data.legalName,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          country: data.country,
          businessType: data.businessType,
          fulfillmentMode: data.fulfillmentMode,
          status: "PENDING_REVIEW",
        },
      });

      // 2. Update user role to RESELLER_APPLICANT
      await tx.user.update({
        where: { id: userId },
        data: { role: "RESELLER_APPLICANT" },
      });

      // 3. Create active ResellerApplication entry
      const app = await tx.resellerApplication.create({
        data: {
          resellerProfileId: profile.id,
          status: "PENDING_REVIEW",
          categories: data.categories,
          monthlyVolumeEst: data.monthlyVolumeEst ?? null,
          returnPolicyNote: data.returnPolicyNote ?? null,
          businessDescription: data.businessDescription ?? null,
          submittedAt: new Date(),
        },
      });

      // 4. Record status history
      await tx.resellerStatusHistory.create({
        data: {
          resellerProfileId: profile.id,
          fromStatus: "DRAFT",
          toStatus: "PENDING_REVIEW",
          actorUserId: userId,
          reason: "Application submitted by reseller",
        },
      });

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: "reseller_application.submit",
          entityType: "ResellerApplication",
          entityId: app.id,
          beforeJson: { status: "DRAFT" },
          afterJson: { status: "PENDING_REVIEW" },
        },
      });

      return { profile, app };
    });

    return { ok: true, status: result.profile.status, applicationId: result.app.id };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
