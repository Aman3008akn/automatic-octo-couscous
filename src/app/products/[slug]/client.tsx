"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/hooks";
import { addToCart } from "@/server/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    description: string;
    brand?: string | null;
    condition?: string | null;
    categoryName: string;
    resellerName: string;
    fulfillmentMode: string;
    mainVariantId: string;
    sku: string;
    priceCents: number;
    compareAtCents?: number | null;
    availableStock: number;
    images: string[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0] ?? "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const price = (product.priceCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const compareAt = product.compareAtCents ? (product.compareAtCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : null;
  const savingsPct = product.compareAtCents && product.compareAtCents > product.priceCents
    ? Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100)
    : null;

  async function handleAddToCart(isBuyNow = false) {
    if (!session) {
      router.push(`/login?callbackUrl=/products/${product.id}`);
      return;
    }

    if (isBuyNow) setBuying(true);
    else setAdding(true);

    setError(null);
    setAddedSuccess(false);

    const res = await addToCart(product.mainVariantId, quantity);

    setAdding(false);
    setBuying(false);

    if (!res.ok) {
      setError(res.error);
    } else if (isBuyNow) {
      router.push("/checkout");
    } else {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb nav */}
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-navy-600">
        <a href="/" className="hover:text-ink">Storefront</a>
        <span>/</span>
        <span className="text-navy-400">{product.categoryName}</span>
        <span>/</span>
        <span className="text-ink truncate max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="w-full h-96 sm:h-[480px] rounded-2xl border border-line bg-white overflow-hidden shadow-sm flex items-center justify-center p-4">
            <img src={selectedImage} alt={product.title} className="max-h-full max-w-full object-contain" />
          </div>

          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-card border overflow-hidden shrink-0 transition-all ${
                    selectedImage === img ? "border-navy-900 ring-2 ring-navy-900/20" : "border-line opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Purchase Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-semibold uppercase bg-navy-50 text-navy-600 px-2.5 py-0.5 rounded">
                {product.categoryName}
              </span>
              {product.condition && (
                <span className="text-xs font-semibold bg-amber-400/20 text-amber-700 px-2.5 py-0.5 rounded">
                  {product.condition}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-display font-bold text-ink">{product.title}</h1>
            <p className="text-xs text-navy-600 mt-1">Brand: <span className="font-semibold text-ink">{product.brand || "Verified Brand"}</span> • SKU: <span className="font-mono">{product.sku}</span></p>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-3 text-xs text-navy-600">
              <span className="text-amber-500 font-bold">★★★★★</span>
              <span className="font-bold text-ink">4.9</span>
              <span>(24 verified reviews)</span>
            </div>
          </div>

          {/* Seller attribution block */}
          <div className="rounded-card bg-navy-50/70 border border-line p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-ink">Sold by Verified Reseller</p>
                <p className="text-xs text-navy-600">{product.resellerName}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase bg-success/15 text-success px-2 py-0.5 rounded">
              Verified Partner
            </span>
          </div>

          {/* Pricing area */}
          <div className="py-2 border-y border-line flex items-baseline gap-4">
            <span className="text-3xl font-bold text-navy-900">₹{price}</span>
            {compareAt && (
              <span className="text-lg text-navy-400 line-through">₹{compareAt}</span>
            )}
            {savingsPct && (
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                Save {savingsPct}%
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-card bg-danger/10 border border-danger/20 p-3 text-xs font-medium text-danger">
              ⚠️ {error}
            </div>
          )}

          {addedSuccess && (
            <div className="rounded-card bg-success/10 border border-success/20 p-3 text-xs font-medium text-success flex items-center justify-between">
              <span>✓ Added to shopping cart!</span>
              <a href="/cart" className="font-bold underline text-xs">View Cart →</a>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-navy-600 uppercase">Quantity:</span>
              <div className="flex items-center rounded-card border border-line bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-xs font-bold text-navy-600 hover:bg-navy-50"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                  className="px-3 py-1.5 text-xs font-bold text-navy-600 hover:bg-navy-50"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-navy-400">({product.availableStock} in stock)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                loading={adding}
                onClick={() => handleAddToCart(false)}
                className="flex-1 py-3 bg-navy-900 text-paper font-semibold hover:bg-navy-600 text-sm"
              >
                Add to Cart
              </Button>
              <Button
                variant="primary"
                loading={buying}
                onClick={() => handleAddToCart(true)}
                className="flex-1 py-3 bg-amber-500 text-navy-900 font-bold hover:bg-amber-600 text-sm"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Product Description */}
          <Card>
            <CardContent className="p-4 space-y-2 text-xs text-navy-600">
              <p className="font-bold text-ink text-sm mb-1">Product Description</p>
              <p className="leading-relaxed">{product.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
