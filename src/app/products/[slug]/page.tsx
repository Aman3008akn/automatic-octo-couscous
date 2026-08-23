import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./client";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product;
  try {
    product = await prisma.product.findUnique({
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
  } catch (error) {
    console.error("Database connection error in ProductDetailPage:", error);
    // Return a fallback UI instead of crashing the whole server
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4 text-center">
        <div className="rounded-card border border-amber-200 bg-amber-50 p-8 max-w-md">
          <p className="text-amber-800 font-bold mb-2">Service Temporarily Unavailable</p>
          <p className="text-sm text-amber-700">We're having trouble connecting to the database. Please check your database connection or try again later.</p>
        </div>
      </div>
    );
  }

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
