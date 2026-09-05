import { NextResponse } from "next/server";
import { searchCatalog } from "@/server/search";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "newest";
    const take = parseInt(searchParams.get("take") || "20", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const minPriceCents = searchParams.get("minPriceCents")
      ? parseInt(searchParams.get("minPriceCents")!, 10)
      : undefined;
    const maxPriceCents = searchParams.get("maxPriceCents")
      ? parseInt(searchParams.get("maxPriceCents")!, 10)
      : undefined;

    const result = await searchCatalog({
      q,
      categorySlug,
      sortBy,
      take,
      skip,
      minPriceCents,
      maxPriceCents,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    console.error("API /api/v1/products error:", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}
