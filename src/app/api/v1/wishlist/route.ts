import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!wishlist || wishlist.items.length === 0) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const productIds = wishlist.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        variants: {
          include: { inventory: true },
          take: 1,
        },
        category: true,
      },
    });

    const items = products.map((p) => {
      const v = p.variants[0];
      return {
        id: p.id,
        productId: p.id,
        slug: p.slug,
        title: p.title,
        brand: p.brand,
        categoryName: p.category.name,
        imageUrl: p.images[0]?.url,
        priceCents: v?.priceCents ?? 0,
        compareAtCents: v?.compareAtCents ?? 0,
        variantId: v?.id,
        availableStock: v?.inventory?.available ?? 0,
      };
    });

    return NextResponse.json({ ok: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ ok: true, data: [] });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ ok: false, error: "productId is required" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: { wishlistId: wishlist.id, productId },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return NextResponse.json({ ok: true, message: "Added to wishlist" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ ok: false, error: "productId is required" }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return NextResponse.json({ ok: true, message: "Removed from wishlist" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || "Failed to remove from wishlist" }, { status: 500 });
  }
}
