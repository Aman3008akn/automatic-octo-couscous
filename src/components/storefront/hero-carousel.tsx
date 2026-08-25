"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const BANNERS = [
  {
    id: 1,
    tag: "FLASH SALE ⚡",
    title: "Flat 15% Off on Top Electronics",
    subtitle: "2-3 PM | 8-9 PM | 10 PM-12 AM. Don't miss out on the biggest tech discounts of the season.",
    ctaText: "Shop Flash Sale →",
    ctaUrl: "/search?categorySlug=electronics",
    imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop",
    bgGradient: "from-blue-600 via-blue-800 to-indigo-900",
  },
  {
    id: 2,
    tag: "EVERYTHING UNDER ₹499",
    title: "Ultimate Brand Sale",
    subtitle: "Fashion, Home & more. Free Delivery on your first order & Quick Refunds.",
    ctaText: "Explore ₹499 Store →",
    ctaUrl: "/search?categorySlug=fashion-apparel",
    imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&auto=format&fit=crop",
    bgGradient: "from-orange-500 via-red-500 to-red-700",
  },
  {
    id: 3,
    tag: "UNDER ₹699",
    title: "Bags, Backpacks & Accessories",
    subtitle: "Pay on delivery available. Latest trends for college and office.",
    ctaText: "Shop Backpacks →",
    ctaUrl: "/search",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop",
    bgGradient: "from-emerald-600 via-green-700 to-teal-900",
  },
];

export function HeroCarousel({ banners = BANNERS }: { banners?: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[current] || banners[0];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-900 text-white shadow-lg">
      {/* Background image & gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          priority
          className="object-cover object-center opacity-30 blur-[1px] transition-opacity duration-700"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgGradient || "from-black/60 to-black/30"} opacity-85`} />
      </div>

      {/* Slide Content */}
      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20 flex flex-col justify-center min-h-[340px] sm:min-h-[380px] max-w-3xl">
        {banner.tag && (
          <span className="inline-block self-start rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 font-mono text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">
            {banner.tag}
          </span>
        )}

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          {banner.title}
        </h1>

        {banner.subtitle && (
          <p className="mt-3 text-sm sm:text-base text-navy-100/90 max-w-xl font-normal leading-relaxed">
            {banner.subtitle}
          </p>
        )}

        <div className="mt-6 flex items-center gap-4">
          <Link
            href={banner.linkUrl || banner.ctaUrl || "/"}
            className="inline-flex items-center gap-2 rounded-card bg-amber-500 px-6 py-3 font-bold text-navy-900 shadow-md hover:bg-amber-400 transition-all active:scale-95 text-sm"
          >
            {banner.ctaText || "Shop Now →"}
          </Link>
        </div>
      </div>

      {/* Carousel Prev/Next Buttons */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
        aria-label="Previous Slide"
      >
        ❮
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
        aria-label="Next Slide"
      >
        ❯
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              current === idx ? "w-7 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
