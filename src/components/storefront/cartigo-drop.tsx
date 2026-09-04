"use client";

import { useRef } from "react";
import Link from "next/link";
import { ProductCard, ProductCardProps } from "./product-card";

interface CartigoDropProps {
  products: ProductCardProps[];
}

export function CartigoDrop({ products }: CartigoDropProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="relative py-2">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-line gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 font-bold">
              CURATED SELECTION
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-navy-900">
            THE CARTIGO DROP
          </h2>
          <p className="text-xs sm:text-sm text-navy-600 mt-1 font-medium">
            Fresh picks. Limited attention.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Rail Navigation Buttons for Desktop Precision */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="h-8 w-8 rounded-lg border border-line bg-white hover:bg-navy-900 hover:text-white hover:border-navy-900 flex items-center justify-center text-navy-600 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="h-8 w-8 rounded-lg border border-line bg-white hover:bg-navy-900 hover:text-white hover:border-navy-900 flex items-center justify-center text-navy-600 transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Link
            href="/search?sortBy=newest"
            className="group flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-navy-900 hover:text-amber-600 transition-colors ml-2"
          >
            <span>View all</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* Horizontally Scrolling Rail */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-0.5 scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((prod) => (
          <div
            key={prod.id}
            className="w-[240px] sm:w-[270px] lg:w-[290px] flex-shrink-0 snap-start"
          >
            <ProductCard {...prod} />
          </div>
        ))}
      </div>
    </section>
  );
}
