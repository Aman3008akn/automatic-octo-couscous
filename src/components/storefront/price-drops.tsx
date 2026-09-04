import Link from "next/link";
import { ProductCard, ProductCardProps } from "./product-card";

interface PriceDropsProps {
  products: ProductCardProps[];
}

export function PriceDrops({ products }: PriceDropsProps) {
  // Editorial philosophy: 10 mediocre deals < 4 excellent deals
  const curatedDeals = products.slice(0, 4);

  if (!curatedDeals || curatedDeals.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-line gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-navy-900" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-navy-600 font-bold">
              VERIFIED MARKDOWNS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-navy-900">
            PRICE DROPS
          </h2>
          <p className="text-xs sm:text-sm text-navy-600 mt-1 font-medium">
            Four genuinely remarkable values. Verified against 30-day price history.
          </p>
        </div>

        <Link
          href="/search?sortBy=price_asc"
          className="group flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-navy-900 hover:text-amber-600 transition-colors self-end sm:self-auto"
        >
          <span>View All Deals</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Curated 4-Item Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {curatedDeals.map((prod) => (
          <ProductCard
            key={prod.id}
            {...prod}
            isPriceDrop={true}
          />
        ))}
      </div>
    </section>
  );
}
