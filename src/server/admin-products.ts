"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { ProductStatus } from "@prisma/client";

const moderationSchema = z.object({
  productId: z.string().length(24, "Must be a valid MongoDB ObjectId"),
  decision: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED", "UNPUBLISHED", "SUSPENDED"]),
  reason: z.string().max(2000).optional(),
});

export type ModerationInput = z.infer<typeof moderationSchema>;

export type ModerationResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

/**
 * Fetch products for admin moderation queue.
 */
export async function getAdminProductQueue(statusFilter?: ProductStatus | "ALL", searchQuery?: string) {
  try {
    await requireRole(["MODERATOR", "SUPPORT", "FINANCE", "ADMIN", "SUPER_ADMIN"]);

    const whereClause: Record<string, unknown> = {};

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.trim();
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { resellerProfile: { legalName: { contains: q, mode: "insensitive" } } },
        { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: { inventory: true },
        },
        resellerProfile: {
          select: { id: true, legalName: true, contactEmail: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return products.map((p) => {
      const mainVariant = p.variants[0];
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        brand: p.brand,
        condition: p.condition,
        status: p.status,
        rejectionReason: p.rejectionReason,
        moderatedAt: p.moderatedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        category: p.category,
        images: p.images,
        mainVariant: mainVariant
          ? {
              id: mainVariant.id,
              sku: mainVariant.sku,
              priceCents: mainVariant.priceCents,
              compareAtCents: mainVariant.compareAtCents,
              inventoryCount: mainVariant.inventory?.available ?? 0,
            }
          : null,
        resellerProfile: p.resellerProfile,
      };
    });
  } catch (error) {
    console.error("Database connection error in getAdminProductQueue:", error);
    return [];
  }
}

/**
 * Perform moderation decision on a product submission.
 */
export async function moderateProduct(input: ModerationInput): Promise<ModerationResult> {
  const parsed = moderationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid moderation request.", code: "VALIDATION_ERROR" };
  }

  let session;
  try {
    session = await requireRole(["MODERATOR", "ADMIN", "SUPER_ADMIN"]);
  } catch {
    return { ok: false, error: "Not authorized to moderate products.", code: "FORBIDDEN" };
  }

  const { productId, decision, reason } = parsed.data;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { ok: false, error: "Product not found.", code: "NOT_FOUND" };
    }

    const actorUserId = (session.user as { id: string }).id;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          status: decision,
          rejectionReason: decision === "REJECTED" || decision === "CHANGES_REQUESTED" ? reason ?? null : null,
          moderatedByUserId: actorUserId,
          moderatedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: `product.${decision.toLowerCase()}`,
          entityType: "Product",
          entityId: productId,
          beforeJson: { status: product.status },
          afterJson: { status: decision },
        },
      });
    });

    return { ok: true };
  } catch (error) {
    console.error("Database error in moderateProduct:", error);
    return { ok: false, error: "Database connection failed. Please try again." };
  }
}
