import { searchCatalog, getStorefrontCategories } from "@/server/search";
import { ProductCard } from "@/components/storefront/product-card";
import { Footer } from "@/components/storefront/footer";
import { SortDropdown } from "@/components/storefront/sort-dropdown";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: {
    q?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  let items: any[] = [];
  let totalCount = 0;
  let categories: any[] = [];
  let q = "";
  let categorySlug = "all";
  let sort = "newest";

  try {
    q = searchParams.q || "";
    categorySlug = searchParams.categorySlug || "all";
    sort = (searchParams.sort as any) || "newest";

    const minPriceCents = searchParams.minPrice ? Math.round(parseFloat(searchParams.minPrice) * 100) : undefined;
    const maxPriceCents = searchParams.maxPrice ? Math.round(parseFloat(searchParams.maxPrice) * 100) : undefined;

    const results = await Promise.all([
      searchCatalog({
        q,
        categorySlug,
        minPriceCents,
        maxPriceCents,
        sortBy: sort as any,
        take: 40,
      }),
      getStorefrontCategories(),
    ]);
    
    items = results[0].items;
    totalCount = results[0].totalCount;
    categories = results[1];
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error("Unhandled error in SearchResultsPage:", error);
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
        {/* Results Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <span className="text-xs font-mono text-navy-400 uppercase tracking-wider">Marketplace Catalog Search</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              {q ? `Results for "${q}"` : categorySlug !== "all" ? `Category: ${categorySlug}` : "All Marketplace Products"}
            </h1>
            <p className="text-xs text-navy-600 mt-1 font-mono">
              Showing {items.length} of {totalCount} verified products
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-navy-600">Sort by:</span>
            <SortDropdown defaultSort={sort} />
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <aside className="space-y-6">
            {/* Category Filter List */}
            <div className="rounded-card border border-line bg-white p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 border-b border-line pb-2">
                Categories
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link
                    href={`/search${q ? `?q=${q}` : ""}`}
                    className={`block px-2 py-1 rounded transition-colors ${
                      categorySlug === "all" ? "bg-navy-900 text-amber-400 font-bold" : "text-navy-600 hover:text-ink"
                    }`}
                  >
                    All Categories ({totalCount})
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/search?categorySlug=${c.slug}${q ? `&q=${q}` : ""}`}
                      className={`flex justify-between items-center px-2 py-1 rounded transition-colors ${
                        categorySlug === c.slug ? "bg-navy-900 text-amber-400 font-bold" : "text-navy-600 hover:text-ink"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="font-mono text-[10px] text-navy-400">({c.productCount})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="rounded-card border border-line bg-white p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900 border-b border-line pb-2">
                Price Filter ($ USD)
              </h3>
              <form method="GET" action="/search" className="space-y-2 text-xs">
                {q && <input type="hidden" name="q" value={q} />}
                {categorySlug !== "all" && <input type="hidden" name="categorySlug" value={categorySlug} />}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min $"
                    className="w-full rounded border border-line px-2 py-1 outline-none"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max $"
                    className="w-full rounded border border-line px-2 py-1 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded bg-navy-900 py-1.5 text-xs font-bold text-amber-400 hover:bg-navy-600 transition-colors"
                >
                  Apply Price Filter
                </button>
              </form>
            </div>
          </aside>

          {/* Results Product Grid */}
          <div className="lg:col-span-3">
            {items.length === 0 ? (
              <div className="rounded-card border border-line bg-white p-12 text-center text-navy-600">
                <p className="text-lg font-bold text-ink">no products right now:), maybe the reseller has not approved yet</p>
                <p className="text-xs text-navy-400 mt-1">Check back once the reseller application has been reviewed in the admin panel.</p>
                <Link
                  href="/search"
                  className="inline-block mt-4 rounded-card bg-amber-500 px-4 py-2 text-xs font-bold text-navy-900"
                >
                  Clear All Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {items.map((prod) => (
                  <ProductCard key={prod.id} {...prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
