"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/server/cart";
import { useSession } from "@/lib/supabase/hooks";
import { useRouter } from "next/navigation";
import { StorefrontImage } from "@/components/ui/storefront-image";

export type ProductCardProps = {
  id: string;
  slug: string;
  title: string;
  brand?: string | null;
  imageUrl: string;
  hoverImageUrl?: string;
  priceCents: number;
  compareAtCents?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  sellerName?: string;
  availableStock?: number;
};

export function ProductCard({
  slug,
  title,
  brand,
  imageUrl,
  hoverImageUrl,
  priceCents,
  compareAtCents = 0,
  discountPercent = 0,
  rating = 4.8,
  reviewCount = 38,
  sellerName = "Verified Reseller",
  availableStock = 10,
}: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const price = (priceCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const compareAt = compareAtCents > priceCents ? (compareAtCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : null;

  const currentImage = isHovered && hoverImageUrl ? hoverImageUrl : imageUrl;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      const res = await addToCart(slug, 1);
      if (!res.ok) {
        alert("Failed to add to cart: " + res.error);
        return;
      }
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
      router.refresh();
    } catch (err: any) {
      alert("Error adding to cart: " + err.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-line bg-white shadow-sm hover:shadow-md hover:border-navy-400 transition-all duration-200"
    >
      {/* Product Image Container */}
      <div>
        <Link href={`/products/${slug}`} className="relative block aspect-square w-full overflow-hidden bg-navy-50/40 p-4">
          <StorefrontImage
            src={currentImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center p-2 group-hover:scale-105 transition-all duration-300"
          />

          {/* Discount Badge Pill */}
          {discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-danger px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </span>
          )}

          {/* Wishlist Heart Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 ${
              isWishlisted ? "text-danger" : "text-navy-400 hover:text-danger"
            }`}
            aria-label="Add to Wishlist"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </Link>

        {/* Product Content Details */}
        <div className="p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-[11px] text-navy-600 mb-1">
            <span className="font-semibold uppercase tracking-wider">{brand || "Cartigo Choice"}</span>
            <span className="truncate text-navy-400 max-w-[100px]">{sellerName}</span>
          </div>

          <Link href={`/products/${slug}`} className="group-hover:text-navy-600 transition-colors">
            <h3 className="text-xs sm:text-sm font-bold text-ink line-clamp-2 leading-snug">{title}</h3>
          </Link>

          <div className="mt-1.5 flex items-center gap-1 text-[11px]">
            <div className="flex text-amber-500 text-[10px]">
              ⭐⭐⭐⭐⭐
            </div>
            <span className="text-navy-400 font-mono">({reviewCount})</span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            {compareAt && (
              <span className="text-sm text-navy-400 line-through font-mono">₹{compareAt}</span>
            )}
            <span className="text-base sm:text-lg font-bold text-navy-900">₹{price}</span>
          </div>

          <div className="mt-1 text-[11px] text-success font-medium flex items-center gap-1.5">
            <span className="text-[14px]">🚚</span>
            <span>Free delivery</span>
          </div>
        </div>
      </div>

      {/* Quick Add to Cart CTA */}
      <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full rounded-card py-2 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
            addedSuccess
              ? "bg-success text-white"
              : "bg-navy-900 text-amber-400 hover:bg-navy-600 active:scale-[0.98]"
          }`}
        >
          {adding ? (
            <span className="animate-pulse">Adding...</span>
          ) : addedSuccess ? (
            <span>✓ Added to Cart!</span>
          ) : (
            <span>🛒 Add to Cart</span>
          )}
        </button>
      </div>
    </div>
  );
}
