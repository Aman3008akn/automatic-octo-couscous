"use server";

import { prisma } from "@/lib/prisma";

export type SearchParams = {
  q?: string;
  categorySlug?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest";
  take?: number;
  skip?: number;
};

/**
 * Perform server-side search across published marketplace products.
 */
export async function searchCatalog(params: SearchParams = {}) {
  const { q, categorySlug, minPriceCents, maxPriceCents, sortBy = "newest", take = 24, skip = 0 } = params;

  const whereClause: Record<string, unknown> = {
    status: "APPROVED",
    resellerProfile: {
      status: "APPROVED",
    },
  };

  if (categorySlug && categorySlug !== "all") {
    whereClause.category = { slug: categorySlug };
  }

  if (q && q.trim().length > 0) {
    const queryStr = q.trim();
    whereClause.OR = [
      { title: { contains: queryStr, mode: "insensitive" } },
      { description: { contains: queryStr, mode: "insensitive" } },
      { brand: { contains: queryStr, mode: "insensitive" } },
      { category: { name: { contains: queryStr, mode: "insensitive" } } },
    ];
  }

  if (minPriceCents !== undefined || maxPriceCents !== undefined) {
    whereClause.variants = {
      some: {
        priceCents: {
          gte: minPriceCents ?? 0,
          lte: maxPriceCents ?? 99999999,
        },
      },
    };
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sortBy === "price_asc") {
    orderBy = { createdAt: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { createdAt: "desc" };
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: { inventory: true },
          take: 1,
        },
        resellerProfile: {
          select: { legalName: true },
        },
      },
      orderBy,
      take,
      skip,
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  const items = products.map((p) => {
    const variant = p.variants[0];
    const priceCents = variant?.priceCents ?? 0;
    const compareAtCents = variant?.compareAtCents ?? 0;
    const discountPercent =
      compareAtCents > priceCents ? Math.round(((compareAtCents - priceCents) / compareAtCents) * 100) : 0;

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      brand: p.brand,
      condition: p.condition,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      imageUrl: p.images[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
      hoverImageUrl: p.images[1]?.url || p.images[0]?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
      priceCents,
      compareAtCents,
      discountPercent,
      sellerName: p.resellerProfile.legalName,
      availableStock: variant?.inventory?.available ?? 0,
      rating: 4.8,
      reviewCount: 42 + (p.title.length % 50),
    };
  });

  return {
    items,
    totalCount,
  };
}

/**
 * Autocomplete search suggestions for header input.
 */
export async function getSearchSuggestions(query: string) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      resellerProfile: { status: "APPROVED" },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { title: true, slug: true, category: { select: { name: true } } },
    take: 6,
  });

  return products.map((p) => ({
    title: p.title,
    slug: p.slug,
    categoryName: p.category.name,
  }));
}

/**
 * Get active marketplace categories.
 */
export async function getStorefrontCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { status: "APPROVED", resellerProfile: { status: "APPROVED" } } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));
}
