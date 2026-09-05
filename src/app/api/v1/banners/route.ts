import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") || undefined;

    const whereClause = position ? { position, isActive: true } : { isActive: true };
    const banners = await prisma.banner.findMany({
      where: whereClause,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ ok: true, data: banners });
  } catch (error: any) {
    console.error("API /api/v1/banners error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to load banners" }, { status: 500 });
  }
}
