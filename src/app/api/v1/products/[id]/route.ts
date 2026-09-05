import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        status: "APPROVED",
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          include: { inventory: true },
        },
        attributes: true,
        resellerProfile: {
          select: {
            legalName: true,
            fulfillmentMode: true,
            status: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    const primaryVariant = product.variants[0];

    return NextResponse.json({
      ok: true,
      data: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        description: product.description,
        brand: product.brand,
        condition: product.condition,
        category: {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        },
        images: product.images.map((img) => img.url),
        seller: {
          name: product.resellerProfile.legalName,
          fulfillmentMode: product.resellerProfile.fulfillmentMode,
        },
        primaryVariant: primaryVariant
          ? {
              id: primaryVariant.id,
              sku: primaryVariant.sku,
              priceCents: primaryVariant.priceCents,
              compareAtCents: primaryVariant.compareAtCents,
              availableStock: primaryVariant.inventory?.available ?? 0,
              options: primaryVariant.optionsJson,
            }
          : null,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          priceCents: v.priceCents,
          compareAtCents: v.compareAtCents,
          availableStock: v.inventory?.available ?? 0,
          options: v.optionsJson,
        })),
        attributes: product.attributes.map((a) => ({
          key: a.key,
          value: a.value,
        })),
      },
    });
  } catch (error: any) {
    console.error("API /api/v1/products/[id] error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to load product" }, { status: 500 });
  }
}
