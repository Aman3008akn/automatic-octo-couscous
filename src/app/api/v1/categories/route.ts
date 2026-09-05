import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { archived: false },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      ok: true,
      data: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        productCount: c._count.products,
      })),
    });
  } catch (error: any) {
    console.error("API /api/v1/categories error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to load categories" }, { status: 500 });
  }
}
