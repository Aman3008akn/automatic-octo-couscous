"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/supabase/hooks";
import { getCart, updateCartItemQuantity, removeFromCart, saveForLater } from "@/server/cart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

type CartData = Awaited<ReturnType<typeof getCart>>;

export default function CartPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartData | null>(null);

  function loadCart() {
    setLoading(true);
    setLoadError(null);
    getCart()
      .then((res) => setCart(res))
      .catch((err: any) => {
        console.error("Failed to load cart:", err);
        setLoadError(err?.message || "Failed to load shopping cart.");
      })
      .finally(() => setLoading(false));
  }

  async function loadCartSilently() {
    try {
      const res = await getCart();
      setCart(res);
    } catch (err: any) {
      setActionError(err?.message || "Failed to refresh cart.");
    }
  }

  useEffect(() => {
    if (session) {
      loadCart();
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  async function handleQuantityChange(cartItemId: string, newQty: number) {
    setUpdatingItemId(cartItemId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await updateCartItemQuantity(cartItemId, newQty);
      if (!res.ok) {
        setActionError(res.error);
      } else {
        await loadCartSilently();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to update item quantity.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemove(cartItemId: string) {
    setUpdatingItemId(cartItemId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await removeFromCart(cartItemId);
      if (!res.ok) {
        setActionError(res.error);
      } else {
        setActionSuccess("Item removed from cart.");
        setTimeout(() => setActionSuccess(null), 3000);
        await loadCartSilently();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to remove item.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleSaveForLater(cartItemId: string) {
    setUpdatingItemId(cartItemId);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await saveForLater(cartItemId);
      if (!res.ok) {
        setActionError(res.error);
      } else {
        setActionSuccess("Item moved to your wishlist!");
        setTimeout(() => setActionSuccess(null), 4000);
        await loadCartSilently();
      }
    } catch (err: any) {
      setActionError(err?.message || "Failed to save item for later.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <p className="text-sm font-medium text-navy-600 animate-pulse">Loading shopping cart...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger text-xl font-bold">
              ⚠️
            </div>
            <CardTitle className="text-xl">Unable to Load Cart</CardTitle>
            <CardDescription>{loadError}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="primary" onClick={loadCart}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your shopping cart and place orders.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login?callbackUrl=/cart">
              <Button variant="primary">Sign In to Continue</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display">Your Shopping Cart is Empty</CardTitle>
            <CardDescription>
              Explore approved products from verified resellers on the Cartigo storefront.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-4">
            <Link href="/">
              <Button variant="primary" className="bg-navy-900 text-paper font-semibold px-6 py-2.5">
                Browse Marketplace →
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // Calculate MRP and discounts with safe divide-by-zero guards
  const totalMrpCents = cart.items.reduce((sum, item) => {
    const compareAt = item.compareAtCents || item.unitPriceCents;
    return sum + (compareAt * item.quantity);
  }, 0);
  const totalDiscountCents = Math.max(0, totalMrpCents - cart.subtotalCents);
  const isDiscounted = totalDiscountCents > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Action Banners */}
      {actionError && (
        <div className="mb-6 rounded-card bg-danger/10 border border-danger/20 p-4 text-xs font-semibold text-danger flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-danger hover:text-navy-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-6 rounded-card bg-success/10 border border-success/20 p-4 text-xs font-semibold text-success flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-success hover:text-navy-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-display font-bold text-navy-900">Shopping Cart</h1>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {cart.items.length} {cart.items.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
            <div className="bg-navy-50/50 border-b border-line p-4 px-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900">Items in your cart</h2>
              <span className="text-xs text-navy-500 font-medium">Free delivery over ₹999</span>
            </div>

            <div className="divide-y divide-line">
              {cart.items.map((item) => {
                const compareAt = item.compareAtCents || item.unitPriceCents;
                const discountPct =
                  compareAt > item.unitPriceCents && compareAt > 0
                    ? Math.round(((compareAt - item.unitPriceCents) / compareAt) * 100)
                    : 0;

                const isItemUpdating = updatingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-6 flex flex-col sm:flex-row gap-6 hover:bg-navy-50/30 transition-colors ${
                      isItemUpdating ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {/* Image & Qty */}
                    <div className="flex flex-col gap-4 items-center w-28 shrink-0">
                      <div className="w-24 h-24 rounded-lg border border-line bg-white shadow-sm flex items-center justify-center p-2">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <span className="text-xs text-navy-300 font-mono">NO IMG</span>
                        )}
                      </div>
                      <div className="w-full relative">
                        <select
                          disabled={isItemUpdating}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          className="w-full appearance-none border border-line rounded-md text-sm px-3 py-1.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-navy-400 font-medium text-navy-900 shadow-sm cursor-pointer disabled:bg-gray-100"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <option key={n} value={n}>
                              Qty: {n}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-2.5 top-2 text-navy-400 pointer-events-none text-xs">▼</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.variantId}`} className="hover:text-amber-600 transition-colors">
                          <h3 className="text-lg font-bold text-ink leading-tight line-clamp-2">{item.title}</h3>
                        </Link>
                        <p className="text-sm text-navy-600 mt-1 font-medium">
                          Sold by <span className="text-navy-900 font-bold">{item.resellerName}</span>
                        </p>

                        <div className="flex items-end gap-2.5 mt-3">
                          <span className="text-xl font-bold text-navy-900">
                            ₹{(item.unitPriceCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                          {compareAt > item.unitPriceCents && (
                            <span className="text-navy-400 line-through text-sm font-medium mb-0.5">
                              ₹{(compareAt / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                            </span>
                          )}
                          {discountPct > 0 && (
                            <span className="text-success font-bold text-xs mb-1 bg-success/10 px-1.5 py-0.5 rounded">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-navy-500 mt-3 font-medium flex items-center gap-1.5">
                          <span className="text-sm">🚚</span> {(item as any).deliveryEstimate || "Standard Delivery in 3-4 days"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4 mt-5 pt-4 border-t border-line border-dashed items-center">
                        <button
                          disabled={isItemUpdating}
                          onClick={() => handleSaveForLater(item.id)}
                          className="text-sm text-navy-600 hover:text-navy-900 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <span>♡</span> Save for later
                        </button>
                        <span className="text-line">|</span>
                        <button
                          disabled={isItemUpdating}
                          onClick={() => handleRemove(item.id)}
                          className="text-sm text-danger hover:text-red-700 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <span>🗑️</span> Remove
                        </button>
                        {isItemUpdating && (
                          <span className="text-xs text-navy-400 animate-pulse ml-auto">Updating...</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div>
          <div className="sticky top-24 bg-white rounded-xl shadow-md border border-line overflow-hidden">
            <div className="bg-navy-900 p-5 border-b border-navy-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🧾</span> Price Details
              </h2>
            </div>

            <div className="p-6 space-y-4 text-sm text-navy-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total MRP ({cart.items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span className="font-semibold text-navy-900">₹{(totalMrpCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Shipping Fee</span>
                <span className="font-bold text-success">
                  {cart.shippingCents === 0 ? "FREE" : `₹${(cart.shippingCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Discount</span>
                <span className="font-bold text-success">
                  -₹{(totalDiscountCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">{(cart as any).taxLabel ?? "Estimated GST (18%)"}</span>
                <span className="font-semibold text-navy-900">₹{(cart.taxCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="pt-4 mt-2 border-t border-dashed border-line flex justify-between items-center text-lg font-bold text-navy-900">
                <span>Total Amount</span>
                <span>₹{(cart.totalCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>

              {isDiscounted && (
                <div className="bg-success/10 text-success border border-success/20 p-3 rounded-lg text-sm font-bold text-center mt-2">
                  🎉 You will save ₹{(totalDiscountCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })} on this order!
                </div>
              )}
            </div>

            <div className="p-6 pt-0">
              <Link href="/checkout" className="block w-full">
                <Button variant="primary" className="w-full py-6 bg-amber-500 hover:bg-amber-400 text-navy-900 font-bold text-base shadow-[0_4px_14px_rgba(245,158,11,0.25)] transition-all hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 rounded-xl flex justify-center items-center gap-2">
                  <span>Place Order</span>
                  <span className="text-xl">→</span>
                </Button>
              </Link>
            </div>

            <div className="bg-navy-50 p-4 text-center text-xs text-navy-500 font-medium flex items-center justify-center gap-1.5 border-t border-line">
              <span>🛡️</span> Safe and secure payments. 100% Authentic.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
