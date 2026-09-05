"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const BANNERS = [
  {
    id: 1,
    tag: "MEGA SALE",
    title: "Unbeatable Offers",
    subtitle: "Get top brands at incredible prices. Limited time only.",
    ctaText: "Shop Now →",
    ctaUrl: "/search",
    imageUrl: "/images/banners/mega-sale.jpg",
    bgGradient: "from-blue-600 via-blue-800 to-indigo-900",
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
    <div className="relative overflow-hidden rounded-2xl text-white shadow-lg w-full aspect-[1024/545]">
      {/* Slide Images */}
      <div className="absolute inset-0">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              priority={index === 0}
              quality={100}
              sizes="100vw"
              className="object-cover object-center w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Clickable Overlay */}
      {(banner.linkUrl || banner.ctaUrl) && (
        <Link
          href={banner.linkUrl || banner.ctaUrl || "/"}
          className="absolute inset-0 z-10 block"
          aria-label={`Shop ${banner.title}`}
        />
      )}

      {/* Previous */}
      <button
        onClick={() =>
          setCurrent((prev) =>
            prev === 0 ? banners.length - 1 : prev - 1
          )
        }
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
        aria-label="Previous Slide"
      >
        ❮
      </button>

      {/* Next */}
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-all"
        aria-label="Next Slide"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${
              current === idx
                ? "w-7 bg-amber-400"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
