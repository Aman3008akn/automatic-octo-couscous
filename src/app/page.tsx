import Link from "next/link";
export const dynamic = "force-dynamic";
import { searchCatalog } from "@/server/search";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { MerchandisingGrid } from "@/components/storefront/merchandising-grid";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductCard } from "@/components/storefront/product-card";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { TrustSection } from "@/components/storefront/trust-section";
import { Footer } from "@/components/storefront/footer";

export default async function HomePage() {
  // Fetch products for storefront sections
  const [{ items: popularProducts }, { items: dealProducts }, { items: newArrivals }] = await Promise.all([
    searchCatalog({ take: 8, sortBy: "newest" }),
    searchCatalog({ take: 4, sortBy: "price_asc" }),
    searchCatalog({ take: 8, sortBy: "newest" }),
  ]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex-1 space-y-12">
        {/* 1. Hero Promotional Carousel */}
        <HeroCarousel />

        {/* 2. Amazon-Style 4-Card Merchandising Grid */}
        <MerchandisingGrid />

        {/* 2. Quick Category Grid */}
        <CategoryGrid />

        {/* 3. Today's Deals Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger animate-ping"></span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">Today's Deals</h2>
              </div>
              <p className="text-xs text-navy-600 mt-0.5">Limited-time discounted prices from verified sellers</p>
            </div>
            <Link href="/search?sortBy=price_asc" className="text-xs font-bold text-navy-900 hover:text-amber-600 transition-colors">
              See All Deals →
            </Link>
          </div>

          {dealProducts.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-white p-8 text-center text-navy-600">
              <p className="text-sm font-semibold text-navy-800">no products right now:), maybe the reseller has not approved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {dealProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}
        </section>

        {/* 4. Popular on Cartigo Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">Popular on Cartigo</h2>
              <p className="text-xs text-navy-600 mt-0.5">Top trending items purchased by customers this week</p>
            </div>
            <Link href="/search" className="text-xs font-bold text-navy-900 hover:text-amber-600 transition-colors">
              Explore All Products →
            </Link>
          </div>

          {popularProducts.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-white p-8 text-center text-navy-600">
              <p className="text-sm font-semibold text-navy-800">no products right now:), maybe the reseller has not approved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Promotional Middle Banner */}
        <PromoBanner />

        {/* 6. New Arrivals Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">New Arrivals</h2>
              <p className="text-xs text-navy-600 mt-0.5">Freshly published catalog items from approved partner resellers</p>
            </div>
            <Link href="/search?sort=newest" className="text-xs font-bold text-navy-900 hover:text-amber-600 transition-colors">
              View New Arrivals →
            </Link>
          </div>

          {newArrivals.length === 0 ? (
            <div className="rounded-card border border-dashed border-line bg-white p-8 text-center text-navy-600">
              <p className="text-sm font-semibold text-navy-800">no products right now:), maybe the reseller has not approved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}
        </section>

        {/* 7. Compact Reseller Program Banner (Lower Section) */}
        <section className="rounded-card border border-amber-400/40 bg-amber-50/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600">
              Partner Business Opportunities
            </span>
            <h3 className="text-lg font-bold text-ink">Want to sell your catalog on Cartigo?</h3>
            <p className="text-xs text-navy-600 max-w-xl">
              Join our verified partner program to reach thousands of buyers. Transparent 15% platform fees, fast bi-weekly payouts, and dedicated seller tools.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/reseller/apply"
              className="rounded-card bg-navy-900 px-5 py-2.5 text-xs font-bold text-amber-400 hover:bg-navy-600 transition-colors shadow-sm"
            >
              Become a Partner Reseller →
            </Link>
          </div>
        </section>

        {/* 8. Marketplace Trust Benefits */}
        <TrustSection />
      </main>

      {/* 9. Large Marketplace Footer */}
      <Footer />
    </div>
  );
}
