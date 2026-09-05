import Link from "next/link";
export const dynamic = "force-dynamic";
import { searchCatalog } from "@/server/search";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { MerchandisingGrid } from "@/components/storefront/merchandising-grid";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductCard } from "@/components/storefront/product-card";
import { CartigoDrop } from "@/components/storefront/cartigo-drop";
import { PriceDrops } from "@/components/storefront/price-drops";
import { TeamSection } from "@/components/storefront/team-section";
import { TeamScrollPopup } from "@/components/storefront/team-scroll-popup";
import { Footer } from "@/components/storefront/footer";
import { WelcomeOffer } from "@/components/storefront/welcome-offer";
import { AppDownloadBanner } from "@/components/storefront/app-download-banner";
import { getBanners } from "@/server/banners";

export default async function HomePage() {
  // Fetch products for storefront sections
  const [{ items: popularProducts }, { items: dealProducts }, { items: dropProducts }, heroBanners] = await Promise.all([
    searchCatalog({ take: 8, sortBy: "newest" }),
    searchCatalog({ take: 4, sortBy: "price_asc" }),
    searchCatalog({ take: 8, sortBy: "newest" }),
    getBanners("HERO_CAROUSEL"),
  ]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <WelcomeOffer />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 space-y-16 sm:space-y-24 overflow-hidden">
        {/* 1. Hero Promotional Carousel */}
        <HeroCarousel banners={heroBanners.length > 0 ? heroBanners : undefined} />

        {/* 2. Architectural Category Discovery */}
        <CategoryGrid />

        {/* Editorial Divider */}
        <div className="w-full h-px bg-line/80" />

        {/* 3. Signature Culture & Discovery Rail: THE CARTIGO DROP */}
        <CartigoDrop products={dropProducts} />

        {/* Editorial Divider */}
        <div className="w-full h-px bg-line/80" />

        {/* 4. Curated Verified Price Drops (4 Outstanding Deals) */}
        <PriceDrops products={dealProducts} />

        {/* 5. Editorial 4-Card Merchandising Grid */}
        <MerchandisingGrid />

        {/* Editorial Divider */}
        <div className="w-full h-px bg-line/80" />

        {/* 6. Popular on Cartigo Section */}
        <section>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-line">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-navy-900" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-navy-500">
                  CATALOGUE ESSENTIALS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
                Popular on Cartigo
              </h2>
              <p className="text-xs sm:text-sm text-navy-600 mt-0.5">
                Top trending items purchased by verified customers this week
              </p>
            </div>
            <Link
              href="/search"
              className="group flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-navy-900 hover:text-amber-600 transition-colors"
            >
              <span>Explore All</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {popularProducts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center text-navy-600">
              <p className="text-sm font-semibold text-navy-800">No products found in catalogue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}
        </section>

        {/* 7. Meet the Builders: The Minds Behind Cartigo */}
        <TeamSection />

        {/* 8. Download Cartigo App / APK Banner */}
        <AppDownloadBanner />
      </main>

      {/* Floating Action Badge to scroll to Team Section */}
      <TeamScrollPopup />

      {/* 9. Marketplace Footer */}
      <Footer />
    </div>
  );
}
