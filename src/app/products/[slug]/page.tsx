import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./client";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: { inventory: true },
      },
      resellerProfile: {
        select: { legalName: true, contactEmail: true, fulfillmentMode: true, country: true },
      },
    },
  });

  if (!product || product.status !== "APPROVED") {
    notFound();
  }

  const mainVariant = product.variants[0];
  const priceCents = mainVariant?.priceCents ?? 0;
  const compareAtCents = mainVariant?.compareAtCents;
  const availableStock = mainVariant?.inventory?.available ?? 0;

  return (
    <ProductDetailClient
      product={{
        id: product.id,
        title: product.title,
        description: product.description,
        brand: product.brand,
        condition: product.condition,
        categoryName: product.category.name,
        resellerName: product.resellerProfile.legalName,
        fulfillmentMode: product.resellerProfile.fulfillmentMode,
        mainVariantId: mainVariant?.id ?? "",
        sku: mainVariant?.sku ?? "",
        priceCents,
        compareAtCents,
        availableStock,
        images: product.images.map((i) => i.url),
      }}
    />
  );
}
