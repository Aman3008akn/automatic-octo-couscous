"use client";

import { ProductCard, type ProductCardProps } from "./product-card";

interface RelatedProductsProps {
  products: ProductCardProps[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16 pt-10 border-t border-line">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-50 text-[11px] font-semibold text-navy-700 uppercase tracking-wider mb-2">
            <span>⚡ Recommended For You</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-ink">
            Related Products You Might Also Like
          </h2>
          <p className="text-xs text-navy-600 mt-1">
            Smart recommendations matched by category, brand and competitive pricing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}
