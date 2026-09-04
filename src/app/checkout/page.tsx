"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/hooks";
import { createOrderFromCart } from "@/server/orders";
import { getCart } from "@/server/cart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [checkingCart, setCheckingCart] = useState(true);
  const [cartSummary, setCartSummary] = useState<any>(null);

  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD">("CARD");

  const [loading, setLoading] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCart()
      .then((cart) => {
        if (!cart || cart.items.length === 0) {
          router.replace("/cart");
        } else {
          setCartSummary(cart);
          setCheckingCart(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load cart for checkout:", err);
        router.replace("/cart");
      });
  }, [router]);

  async function handlePincodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPostalCode(val);

    if (val.length === 6) {
      setLoadingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District);
          setState(postOffice.State);
        } else {
          setCity("");
          setState("");
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      } finally {
        setLoadingPincode(false);
      }
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await createOrderFromCart({
      line1,
      line2: "",
      city,
      state,
      postalCode,
      country: "IN",
      phone,
      paymentMethod,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      router.push(`/orders?placed=${res.orderNumber}`);
    }
  }

  if (checkingCart) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <p className="text-sm font-medium text-navy-600 animate-pulse">Verifying cart items & stock...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8 border-b border-line pb-4 flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-navy-900 flex items-center gap-3">
          <span>Checkout</span>
          <span className="text-sm font-medium bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">Secure</span>
        </h1>
        <div className="flex gap-2">
          <span className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all">💳</span>
          <span className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all">🚚</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 p-4 text-sm font-medium text-danger flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
              <div className="bg-navy-50/50 border-b border-line p-4 px-6 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-white text-sm font-bold">1</span>
                <h2 className="text-lg font-bold text-navy-900">Delivery Address</h2>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat / House No. / Building / Street"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      className="w-full rounded-lg border border-line bg-gray-50/50 px-4 py-3 text-sm text-ink outline-none focus:border-navy-400 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5 flex justify-between">
                      <span>Postal Code / Pincode *</span>
                      {loadingPincode && <span className="text-amber-500 animate-pulse text-[10px]">Detecting...</span>}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 110001"
                      value={postalCode}
                      onChange={handlePincodeChange}
                      className="w-full rounded-lg border border-line bg-gray-50/50 px-4 py-3 text-sm text-ink outline-none focus:border-navy-400 focus:bg-white transition-colors tracking-widest font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-line bg-gray-50/50 px-4 py-3 text-sm text-ink outline-none focus:border-navy-400 focus:bg-white transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="City Name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full rounded-lg border border-line px-4 py-3 text-sm text-ink outline-none focus:border-navy-400 transition-colors ${loadingPincode ? 'bg-amber-50/50 animate-pulse' : 'bg-gray-50/50 focus:bg-white'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy-600 mb-1.5">State / Province *</label>
                    <input
                      type="text"
                      required
                      placeholder="State Name"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={`w-full rounded-lg border border-line px-4 py-3 text-sm text-ink outline-none focus:border-navy-400 transition-colors ${loadingPincode ? 'bg-amber-50/50 animate-pulse' : 'bg-gray-50/50 focus:bg-white'}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
              <div className="bg-navy-50/50 border-b border-line p-4 px-6 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-white text-sm font-bold">2</span>
                <h2 className="text-lg font-bold text-navy-900">Payment Options</h2>
              </div>

              <div className="p-6 space-y-4">
                <label className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-navy-900 bg-navy-50/50 shadow-sm' : 'border-line hover:border-navy-300'}`}>
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={() => setPaymentMethod("CARD")}
                      className="w-5 h-5 accent-navy-900 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-navy-900 text-base">Credit / Debit Card / UPI</p>
                      <p className="text-xs text-navy-600 mt-0.5 font-medium">Safe & Secure via Stripe Payment Gateway</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="bg-white px-2 py-1 rounded shadow-sm border border-line text-[10px] font-bold text-navy-900">VISA</span>
                    <span className="bg-white px-2 py-1 rounded shadow-sm border border-line text-[10px] font-bold text-navy-900">UPI</span>
                  </div>
                </label>

                <label className={`flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-navy-900 bg-navy-50/50 shadow-sm' : 'border-line hover:border-navy-300'}`}>
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="w-5 h-5 accent-navy-900 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-navy-900 text-base">Cash on Delivery (COD)</p>
                      <p className="text-xs text-navy-600 mt-0.5 font-medium">Pay via Cash/UPI when your order arrives</p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold">POPULAR</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Confirmation */}
          <div>
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-line overflow-hidden">
              <div className="bg-navy-900 p-5 border-b border-navy-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🧾</span> Order Authorization
                </h2>
              </div>

              <div className="p-6 text-sm text-navy-600">
                {cartSummary && (
                  <div className="space-y-3 mb-6 pb-4 border-b border-line text-xs">
                    <div className="flex justify-between items-center text-navy-800">
                      <span>Items ({cartSummary.items.length})</span>
                      <span className="font-semibold">₹{(cartSummary.subtotalCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-navy-800">
                      <span>Shipping</span>
                      <span className="font-bold text-success">
                        {cartSummary.shippingCents === 0 ? "FREE" : `₹${(cartSummary.shippingCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-navy-800">
                      <span>{cartSummary.taxLabel || "Estimated GST (18%)"}</span>
                      <span className="font-semibold">₹{(cartSummary.taxCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="pt-2 border-t border-dashed border-line flex justify-between items-center text-sm font-bold text-navy-900">
                      <span>Order Total</span>
                      <span>₹{(cartSummary.totalCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 space-y-2 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-lg">💡</span>
                    <div>
                      <p className="font-bold text-blue-900 text-[13px]">Platform Guarantee</p>
                      <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                        Your order snapshot, including pricing, SKU details, and verified reseller attribution, is securely frozen at the time of sale.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-6 bg-amber-500 text-navy-900 font-bold hover:bg-amber-400 hover:-translate-y-0.5 text-base shadow-[0_4px_14px_rgba(245,158,11,0.25)] transition-all rounded-xl"
                >
                  Place Order Now →
                </Button>
                
                <p className="text-center text-[11px] text-navy-400 mt-4 font-medium px-4">
                  By placing your order, you agree to Cartigo's Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
