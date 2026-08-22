"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getCart, updateCartItemQuantity, removeFromCart } from "@/server/cart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

type CartData = Awaited<ReturnType<typeof getCart>>;

export default function CartPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartData | null>(null);

  function loadCart() {
    setLoading(true);
    getCart()
      .then((res) => setCart(res))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (session) {
      loadCart();
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  async function handleQuantityChange(cartItemId: string, newQty: number) {
    await updateCartItemQuantity(cartItemId, newQty);
    loadCart();
  }

  async function handleRemove(cartItemId: string) {
    await removeFromCart(cartItemId);
    loadCart();
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <p className="text-sm font-medium text-navy-600 animate-pulse">Loading shopping cart...</p>
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-display font-bold text-ink mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="border-b border-line pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Cart Items ({cart.items.length})</CardTitle>
              <CardDescription>Verified items reserved for checkout</CardDescription>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-line">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-card border border-line bg-navy-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-mono text-xs text-navy-400">NO IMG</span>
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-ink text-base">{item.title}</p>
                      <p className="text-xs text-navy-600">
                        Seller: <span className="font-semibold text-ink">{item.resellerName}</span> • SKU: <span className="font-mono">{item.sku}</span>
                      </p>
                      <p className="text-sm font-bold text-navy-900 mt-1">
                        ${(item.unitPriceCents / 100).toFixed(2)} USD
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-card border border-line bg-white">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-navy-600 hover:bg-navy-50"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-navy-600 hover:bg-navy-50"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-navy-900 block">
                        ₹{(item.lineTotalCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-xs text-danger hover:underline mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div>
          <Card className="sticky top-20 border-navy-300 shadow-md">
            <CardHeader className="border-b border-line pb-3">
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs text-navy-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.reduce((sum, i) => sum + i.quantity, 0)} items):</span>
                <span className="font-semibold text-ink">₹{(cart.subtotalCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping:</span>
                <span className="font-semibold text-ink">
                  {cart.shippingCents === 0 ? "FREE" : `₹${(cart.shippingCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (18% GST):</span>
                <span className="font-semibold text-ink">₹{(cart.taxCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="pt-3 border-t border-line flex justify-between text-base font-bold text-navy-900">
                <span>Total Payable:</span>
                <span>₹{(cart.totalCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR</span>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Link href="/checkout" className="w-full">
                <Button variant="primary" className="w-full py-3 bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
                  Proceed to Checkout →
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
