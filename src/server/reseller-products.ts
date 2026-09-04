"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { ProductStatus } from "@prisma/client";

const productInputSchema = z.object({
  productId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  brand: z.string().optional(),
  condition: z.string().optional(),
  imageUrl: z.string().url("Valid image URL required.").or(z.string().min(1)),
  sku: z.string().min(3, "SKU is required."),
  optionsJson: z.record(z.string()).optional(),
  priceCents: z.number().int().positive("Price must be greater than zero."),
  compareAtCents: z.number().int().positive().optional(),
  inventoryCount: z.number().int().min(0, "Inventory must be zero or positive."),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductActionResult =
  | { ok: true; productId: string; status: ProductStatus }
  | { ok: false; error: string; code?: string };

/**
 * Fetch catalog products belonging to the logged-in approved reseller.
 */
export async function getMyResellerProducts() {
  const session = await requireRole(["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"]);
  const userId = session.user.id;

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId },
  });

  if (!profile && session.user.role === "APPROVED_RESELLER") {
    return [];
  }

  const resellerProfileId = profile?.id;

  const products = await prisma.product.findMany({
    where: resellerProfileId ? { resellerProfileId } : {},
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: { inventory: true },
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
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      categoryName: p.category.name,
      mainImage: p.images[0]?.url ?? null,
      sku: mainVariant?.sku ?? "N/A",
      priceCents: mainVariant?.priceCents ?? 0,
      availableStock: mainVariant?.inventory?.available ?? 0,
    };
  });
}

/**
 * Save draft product listing.
 */
export async function saveProductDraft(input: Partial<ProductInput>): Promise<ProductActionResult> {
  const session = await requireRole(["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"]);
  const userId = session.user.id;
  const isReseller = session.user.role === "APPROVED_RESELLER";

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId },
  });
  if (!profile && isReseller) {
    return { ok: false, error: "Approved reseller profile required." };
  }

  const resellerProfileId = profile?.id ?? (await prisma.resellerProfile.findFirst())?.id;
  if (!resellerProfileId) {
    return { ok: false, error: "No reseller profile found." };
  }

  const category = await prisma.category.findFirst();
  const categoryId = input.categoryId ?? category?.id;
  if (!categoryId) {
    return { ok: false, error: "Category is required." };
  }

  const title = input.title || "Draft Product Title";
  const slug = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const sku = input.sku || `SKU-${Date.now()}`;
  const priceCents = input.priceCents ?? 1999;
  const inventoryCount = input.inventoryCount ?? 10;

  try {
    const product = await prisma.$transaction(async (tx) => {
      let prod;
      if (input.productId) {
        // Strict ownership check: prevent editing products belonging to other resellers
        const existing = await tx.product.findUnique({
          where: { id: input.productId },
        });

        if (!existing) {
          throw new Error("Product not found.");
        }

        if (isReseller && existing.resellerProfileId !== profile?.id) {
          throw new Error("Unauthorized: You do not own this product.");
        }

        prod = await tx.product.update({
          where: { id: input.productId },
          data: {
            categoryId,
            title,
            description: input.description || "Draft description",
            brand: input.brand ?? null,
            condition: input.condition ?? "New",
            status: "DRAFT",
          },
        });
      } else {
        prod = await tx.product.create({
          data: {
            resellerProfileId,
            categoryId,
            slug,
            title,
            description: input.description || "Draft description",
            brand: input.brand ?? null,
            condition: input.condition ?? "New",
            status: "DRAFT",
          },
        });
      }

      // Upsert Image
      if (input.imageUrl) {
        await tx.productImage.deleteMany({ where: { productId: prod.id } });
        await tx.productImage.create({
          data: {
            productId: prod.id,
            url: input.imageUrl,
            sortOrder: 0,
          },
        });
      }

      // Upsert Variant & Inventory
      const existingVariant = await tx.productVariant.findFirst({ where: { productId: prod.id } });
      let variant;
      if (existingVariant) {
        variant = await tx.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            priceCents,
            compareAtCents: input.compareAtCents ?? null,
          },
        });
      } else {
        variant = await tx.productVariant.create({
          data: {
            productId: prod.id,
            sku,
            optionsJson: input.optionsJson ?? { condition: "New" },
            priceCents,
            compareAtCents: input.compareAtCents ?? null,
          },
        });
      }

      await tx.inventory.upsert({
        where: { variantId: variant.id },
        update: { available: inventoryCount },
        create: { variantId: variant.id, available: inventoryCount },
      });

      return prod;
    });

    return { ok: true, productId: product.id, status: product.status };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Submit product for admin moderation review.
 */
export async function submitProductForReview(input: ProductInput): Promise<ProductActionResult> {
  const session = await requireRole(["APPROVED_RESELLER", "SUPER_ADMIN", "ADMIN"]);
  const userId = session.user.id;
  const isReseller = session.user.role === "APPROVED_RESELLER";

  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(" "), code: "VALIDATION_ERROR" };
  }

  const data = parsed.data;

  const profile = await prisma.resellerProfile.findUnique({
    where: { userId },
  });

  if (isReseller && !profile) {
    return { ok: false, error: "Approved reseller profile required to submit products." };
  }

  const resellerProfileId = profile?.id ?? (await prisma.resellerProfile.findFirst())?.id;
  if (!resellerProfileId) {
    return { ok: false, error: "Approved reseller profile required to submit products." };
  }

  // Generate unique clean slug
  const baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  try {
    const product = await prisma.$transaction(async (tx) => {
      let prod;
      if (data.productId) {
        // Strict ownership check: prevent submitting products belonging to other resellers
        const existing = await tx.product.findUnique({
          where: { id: data.productId },
        });

        if (!existing) {
          throw new Error("Product not found.");
        }

        if (isReseller && existing.resellerProfileId !== profile?.id) {
          throw new Error("Unauthorized: You do not own this product.");
        }

        prod = await tx.product.update({
          where: { id: data.productId },
          data: {
            categoryId: data.categoryId,
            title: data.title,
            description: data.description,
            brand: data.brand ?? null,
            condition: data.condition ?? "New",
            status: "PENDING_REVIEW",
          },
        });
      } else {
        prod = await tx.product.create({
          data: {
            resellerProfileId,
            categoryId: data.categoryId,
            slug,
            title: data.title,
            description: data.description,
            brand: data.brand ?? null,
            condition: data.condition ?? "New",
            status: "PENDING_REVIEW",
          },
        });
      }

      // Re-create Image
      await tx.productImage.deleteMany({ where: { productId: prod.id } });
      await tx.productImage.create({
        data: {
          productId: prod.id,
          url: data.imageUrl,
          altText: data.title,
          sortOrder: 0,
        },
      });

      // Upsert Variant & Inventory
      const existingVariant = await tx.productVariant.findFirst({ where: { productId: prod.id } });
      let variant;
      if (existingVariant) {
        variant = await tx.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            sku: data.sku,
            optionsJson: data.optionsJson ?? { condition: data.condition || "New" },
            priceCents: data.priceCents,
            compareAtCents: data.compareAtCents ?? null,
          },
        });
      } else {
        variant = await tx.productVariant.create({
          data: {
            productId: prod.id,
            sku: data.sku,
            optionsJson: data.optionsJson ?? { condition: data.condition || "New" },
            priceCents: data.priceCents,
            compareAtCents: data.compareAtCents ?? null,
          },
        });
      }

      await tx.inventory.upsert({
        where: { variantId: variant.id },
        update: { available: data.inventoryCount },
        create: { variantId: variant.id, available: data.inventoryCount },
      });

      // Log Audit Event
      await tx.auditLog.create({
        data: {
          actorUserId: userId,
          action: "product.submit_review",
          entityType: "Product",
          entityId: prod.id,
          beforeJson: { status: "DRAFT" },
          afterJson: { status: "PENDING_REVIEW" },
        },
      });

      return prod;
    });

    return { ok: true, productId: product.id, status: product.status };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
