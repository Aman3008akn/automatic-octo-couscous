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
  isPriceDrop?: boolean;
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
  isPriceDrop = false,
}: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);

  const price = (priceCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const compareAt = compareAtCents > priceCents ? (compareAtCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;

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
      setTimeout(() => setAddedSuccess(false), 2200);
      router.refresh();
    } catch (err: any) {
      alert("Error adding to cart: " + err.message);
    } finally {
      setAdding(false);
    }
  }

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    setHeartPulsing(true);
    setTimeout(() => setHeartPulsing(false), 350);
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col justify-between rounded-xl bg-white border border-line/80 hover:border-navy-400/80 shadow-[0_2px_8px_rgba(18,23,43,0.04)] hover:shadow-[0_12px_28px_rgba(18,23,43,0.08)] sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div>
        {/* Top Media Anchor */}
        <Link href={`/products/${slug}`} className="relative block aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-slate-50/50">
          <StorefrontImage
            src={currentImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center p-4 sm:p-5 group-hover:scale-[1.03] transition-transform duration-500 ease-out mix-blend-multiply"
          />

          {/* Top Badges: Discount or Price Drop */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="rounded-full bg-navy-900 text-amber-400 px-2.5 py-0.5 text-[10px] font-bold tracking-wide shadow-sm">
                ↓ {discountPercent}%
              </span>
            )}
            {isPriceDrop && (
              <span className="rounded-full bg-amber-500 text-navy-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
                PRICE DROP
              </span>
            )}
          </div>

          {/* Wishlist Button with Micro-Spring Scale */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label="Save to Wishlist"
            className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm border border-line/50 backdrop-blur-sm transition-transform ${
              heartPulsing ? "scale-125 duration-150" : "hover:scale-110 duration-200"
            } ${isWishlisted ? "text-danger" : "text-navy-400 hover:text-danger"}`}
          >
            <svg className="h-4 w-4 fill-current transition-colors" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>

          {/* Desktop Hover Quick View Overlay Action */}
          <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-center">
            <span className="w-full text-center py-1.5 px-3 rounded-lg bg-navy-900/90 text-white text-[11px] font-semibold backdrop-blur-sm shadow-md hover:bg-navy-900 transition-colors">
              Quick View →
            </span>
          </div>
        </Link>

        {/* Product Details Section */}
        <div className="p-4 space-y-2">
          {/* Brand & Seller Meta */}
          <div className="flex items-center justify-between text-[10px] text-navy-400 font-medium uppercase tracking-wider">
            <span className="truncate max-w-[120px] font-bold text-navy-600">{brand || "Cartigo Verified"}</span>
            <span className="truncate max-w-[90px]">{sellerName}</span>
          </div>

          {/* Title */}
          <Link href={`/products/${slug}`} className="block group-hover:text-navy-600 transition-colors">
            <h3 className="text-sm font-semibold text-ink line-clamp-2 leading-tight tracking-tight min-h-[2.5rem]">
              {title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-amber-500 font-bold text-xs">★</span>
            <span className="font-bold text-navy-900">{rating.toFixed(1)}</span>
            <span className="text-navy-400 text-[10px]">({reviewCount})</span>
          </div>

          {/* Price & Delivery Meta */}
          <div className="pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-navy-900 font-mono tracking-tight">₹{price}</span>
              {compareAt && (
                <span className="text-xs text-navy-400 line-through font-mono">₹{compareAt}</span>
              )}
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mt-1 flex items-center gap-1">
              <span>●</span> Free Delivery • Tomorrow
            </p>
          </div>
        </div>
      </div>

      {/* Understated + Add CTA Button */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className={`w-full h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
            addedSuccess
              ? "bg-emerald-600 text-white shadow-sm"
              : "border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white bg-transparent"
          }`}
        >
          {adding ? (
            <span className="animate-pulse">Adding...</span>
          ) : addedSuccess ? (
            <span>✓ Added</span>
          ) : (
            <span>+ Add</span>
          )}
        </button>
      </div>
    </div>
  );
}
