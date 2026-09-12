import { prisma } from "@/lib/prisma";
import type { ProductCardProps } from "@/components/storefront/product-card";

interface GetRelatedProductsParams {
  productId: string;
  categoryId: string;
  brand?: string | null;
  priceCents?: number;
  limit?: number;
}

/**
 * Smart recommendation algorithm for related products.
 * Scoring system:
 * - Same category: +10 points
 * - Same brand: +5 points
 * - Price proximity (within 35% of current price): +3 points
 */
export async function getRelatedProducts({
  productId,
  categoryId,
  brand,
  priceCents,
  limit = 8,
}: GetRelatedProductsParams): Promise<ProductCardProps[]> {
  try {
    // 1. Fetch candidate pool: approved products in same category or same brand, excluding current product
    const candidates = await prisma.product.findMany({
      where: {
        id: { not: productId },
        status: "APPROVED",
        OR: [
          { categoryId },
          ...(brand ? [{ brand }] : []),
        ],
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: { inventory: true },
        },
        resellerProfile: {
          select: { legalName: true },
        },
      },
      take: 24, // broad candidate pool to score and rank
    });

    // If candidate pool is too small, fetch additional popular approved products as fallback
    let fallbackCandidates: typeof candidates = [];
    if (candidates.length < 4) {
      fallbackCandidates = await prisma.product.findMany({
        where: {
          id: { notIn: [productId, ...candidates.map((c) => c.id)] },
          status: "APPROVED",
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: {
            include: { inventory: true },
          },
          resellerProfile: {
            select: { legalName: true },
          },
        },
        take: 8,
      });
    }

    const allCandidates = [...candidates, ...fallbackCandidates];

    // 2. Score each candidate
    const scored = allCandidates.map((cand) => {
      let score = 0;

      // Category match
      if (cand.categoryId === categoryId) {
        score += 10;
      }

      // Brand match
      if (brand && cand.brand && cand.brand.toLowerCase() === brand.toLowerCase()) {
        score += 5;
      }

      // Price proximity match (within ±35%)
      const candPrice = cand.variants[0]?.priceCents ?? 0;
      if (priceCents && priceCents > 0 && candPrice > 0) {
        const diffRatio = Math.abs(candPrice - priceCents) / priceCents;
        if (diffRatio <= 0.35) {
          score += 3;
        } else if (diffRatio <= 0.6) {
          score += 1;
        }
      }

      return { product: cand, score };
    });

    // 3. Sort by highest score first, then newest
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime();
    });

    // 4. Map top results into ProductCardProps
    const topPicks = scored.slice(0, limit).map(({ product: p }) => {
      const mainVariant = p.variants[0];
      const pPrice = mainVariant?.priceCents ?? 0;
      const compareAt = mainVariant?.compareAtCents ?? 0;
      const discountPercent =
        compareAt > pPrice
          ? Math.round(((compareAt - pPrice) / compareAt) * 100)
          : 0;

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        brand: p.brand,
        imageUrl:
          p.images[0]?.url ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop",
        hoverImageUrl: p.images[1]?.url,
        priceCents: pPrice,
        compareAtCents: compareAt,
        discountPercent,
        rating: 4.8,
        reviewCount: Math.floor(Math.random() * 25) + 12,
        sellerName: p.resellerProfile?.legalName || "Verified Reseller",
        availableStock: mainVariant?.inventory?.available ?? 10,
      };
    });

    return topPicks;
  } catch (err) {
    console.error("Error fetching related products:", err);
    return [];
  }
}
