import Link from "next/link";
export const dynamic = "force-dynamic";
import { searchCatalog } from "@/server/search";
import { HeroCarousel } from "@/components/storefront/hero-carousel";
import { MerchandisingGrid } from "@/components/storefront/merchandising-grid";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductCard } from "@/components/storefront/product-card";
import { PromoBanner } from "@/components/storefront/promo-banner";
import { TrustSection } from "@/components/storefront/trust-section";
import { TeamSection } from "@/components/storefront/team-section";
import { TeamScrollPopup } from "@/components/storefront/team-scroll-popup";
import { Footer } from "@/components/storefront/footer";
import { RetailPoster } from "@/components/storefront/retail-poster";
import { WelcomeOffer } from "@/components/storefront/welcome-offer";
import { SpinBanner } from "@/components/storefront/spin-banner";
import { CountdownBanner } from "@/components/storefront/countdown-banner";
import { BankOffersBanner } from "@/components/storefront/bank-offers-banner";
import { TrendingBanner } from "@/components/storefront/trending-banner";
import { AppDownloadBanner } from "@/components/storefront/app-download-banner";

import { getBanners } from "@/server/banners";

export default async function HomePage() {
  // Fetch products for storefront sections
  const [{ items: popularProducts }, { items: dealProducts }, { items: newArrivals }, heroBanners] = await Promise.all([
    searchCatalog({ take: 8, sortBy: "newest" }),
    searchCatalog({ take: 4, sortBy: "price_asc" }),
    searchCatalog({ take: 8, sortBy: "newest" }),
    getBanners("HERO_CAROUSEL"),
  ]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <WelcomeOffer />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex-1 space-y-12 overflow-hidden">
        {/* 1. Hero Promotional Carousel */}
        <HeroCarousel banners={heroBanners.length > 0 ? heroBanners : undefined} />

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
              <p className="text-sm font-semibold text-navy-800">No deals right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {dealProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}
        </section>

        {/* 4. Amazon-Style 4-Card Merchandising Grid */}
        <MerchandisingGrid />

        {/* 5. Popular on Cartigo Section */}
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
              <p className="text-sm font-semibold text-navy-800">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {popularProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          )}
        </section>

        {/* 6. Marketplace Trust Benefits */}
        <TrustSection />
      </main>

      {/* 7. Large Marketplace Footer */}
      <Footer />
    </div>
  );
}
