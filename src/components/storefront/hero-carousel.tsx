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
    <div className="relative overflow-hidden rounded-2xl bg-[#0a0f1d] text-white shadow-lg w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
      {/* Slide Image */}
      <div className="relative z-0 w-full h-full">
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-contain md:object-cover object-center transition-opacity duration-700"
        />
      </div>

      {/* Clickable Overlay Link */}
      {(banner.linkUrl || banner.ctaUrl) && (
        <Link href={banner.linkUrl || banner.ctaUrl || "/"} className="absolute inset-0 z-10 block" aria-label={`Shop ${banner.title}`} />
      )}

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
