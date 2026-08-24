"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Ensure the admin is authorized to manage the catalog.
 */
async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role as string;
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new Error("Forbidden: Only Admins can manage the catalog");
  }
  return session;
}

/**
 * Gets or creates the official Cartigo Reseller profile to own first-party products.
 */
async function getOrCreateCartigoOfficialProfile() {
  const email = "official@cartigo.admin";
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Cartigo Official",
        role: "APPROVED_RESELLER",
      },
    });
  }

  let profile = await prisma.resellerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.resellerProfile.create({
      data: {
        userId: user.id,
        legalName: "Cartigo Official",
        contactPerson: "Admin",
        contactEmail: email,
        contactPhone: "000-000-0000",
        country: "US",
        businessType: "Company",
        fulfillmentMode: "cartigo",
        status: "APPROVED",
      },
    });
  }

  return profile;
}

/**
 * Get all categories for the product form.
 */
export async function getCategories() {
  return prisma.category.findMany({
    where: { archived: false },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Get a specific product for editing.
 */
export async function getAdminProductById(id: string) {
  await getAdminSession();
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { include: { inventory: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (!p) return null;

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    categoryId: p.categoryId,
    brand: p.brand || "",
    condition: p.condition || "New",
    priceCents: p.variants[0]?.priceCents || 0,
    compareAtCents: p.variants[0]?.compareAtCents || undefined,
    sku: p.variants[0]?.sku || "",
    inventoryCount: p.variants[0]?.inventory?.available || 0,
    imageUrl: p.images[0]?.url || "",
  };
}

/**
 * Get all products for the admin catalog UI.
 */
export async function getAdminCatalog(searchQuery: string = "") {
  await getAdminSession();

  const products = await prisma.product.findMany({
    where: searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" } },
            { variants: { some: { sku: { contains: searchQuery, mode: "insensitive" } } } },
            { resellerProfile: { legalName: { contains: searchQuery, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      category: true,
      resellerProfile: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { include: { inventory: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    seller: p.resellerProfile.legalName,
    categoryName: p.category.name,
    imageUrl: p.images[0]?.url || null,
    priceCents: p.variants[0]?.priceCents || 0,
    compareAtCents: p.variants[0]?.compareAtCents || null,
    sku: p.variants[0]?.sku || "N/A",
    inventoryCount: p.variants[0]?.inventory?.available || 0,
    createdAt: p.createdAt,
  }));
}

/**
 * Creates a new first-party product.
 */
export async function createAdminProduct(data: {
  title: string;
  description: string;
  categoryId: string;
  brand?: string;
  condition?: string;
  priceCents: number;
  compareAtCents?: number;
  sku: string;
  inventoryCount: number;
  imageUrl?: string;
}) {
  await getAdminSession();
  const profile = await getOrCreateCartigoOfficialProfile();

  // Basic slug generation
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);

  const product = await prisma.product.create({
    data: {
      resellerProfileId: profile.id,
      categoryId: data.categoryId,
      slug,
      title: data.title,
      description: data.description,
      brand: data.brand || null,
      condition: data.condition || "New",
      status: "APPROVED",
      variants: {
        create: {
          sku: data.sku,
          optionsJson: {},
          priceCents: data.priceCents,
          compareAtCents: data.compareAtCents || null,
          inventory: {
            create: {
              available: data.inventoryCount,
            },
          },
        },
      },
    },
  });

  if (data.imageUrl) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: data.imageUrl,
      },
    });
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/");
  return { ok: true, productId: product.id };
}

/**
 * Updates an existing product.
 */
export async function updateAdminProduct(
  productId: string,
  data: {
    title: string;
    description: string;
    categoryId: string;
    brand?: string;
    condition?: string;
    priceCents: number;
    compareAtCents?: number;
    sku: string;
    inventoryCount: number;
    imageUrl?: string;
  }
) {
  await getAdminSession();

  // Find existing variant to update it
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { include: { inventory: true } }, images: true },
  });

  if (!product) throw new Error("Product not found");

  const variant = product.variants[0];

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      brand: data.brand,
      condition: data.condition,
    },
  });

  if (variant) {
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        sku: data.sku,
        priceCents: data.priceCents,
        compareAtCents: data.compareAtCents || null,
      },
    });

    if (variant.inventory) {
      await prisma.inventory.update({
        where: { id: variant.inventory.id },
        data: { available: data.inventoryCount },
      });
    } else {
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          available: data.inventoryCount,
        },
      });
    }
  }

  if (data.imageUrl) {
    const firstImage = product.images[0];
    if (firstImage) {
      await prisma.productImage.update({
        where: { id: firstImage.id },
        data: { url: data.imageUrl },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: data.imageUrl,
        },
      });
    }
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/");
  return { ok: true };
}

/**
 * Deletes a product.
 */
export async function deleteAdminProduct(productId: string) {
  await getAdminSession();
  
  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/admin/catalog");
  revalidatePath("/");
  return { ok: true };
}
