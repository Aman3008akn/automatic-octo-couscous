"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/hooks";
import { createOrderFromCart } from "@/server/orders";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [line1, setLine1] = useState("12, MG Road, Connaught Place");
  const [line2, setLine2] = useState("Block A");
  const [city, setCity] = useState("New Delhi");
  const [state, setState] = useState("Delhi");
  const [postalCode, setPostalCode] = useState("110001");
  const [country, setCountry] = useState("IN");
  const [phone, setPhone] = useState("+91 98765 43210");

  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD">("CARD");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await createOrderFromCart({
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
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

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Slice 3 Checkout Flow
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">Secure Order Checkout</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-card bg-danger/10 border border-danger/20 p-4 text-xs font-medium text-danger">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. Shipping Delivery Address</CardTitle>
                <CardDescription>Enter destination address for order shipment.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">State / Province *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. Payment Method</CardTitle>
                <CardDescription>Server-verified payment authorization</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <label className="flex items-center justify-between rounded-card border border-navy-900 bg-navy-50/50 p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={() => setPaymentMethod("CARD")}
                    />
                    <div>
                      <p className="font-semibold text-ink text-sm">Credit / Debit Card (Stripe Gateway)</p>
                      <p className="text-xs text-navy-600">Simulated 256-bit SSL encrypted tokenization</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-navy-900">VISA / MC</span>
                </label>

                <label className="flex items-center justify-between rounded-card border border-line p-4 cursor-pointer hover:bg-navy-50/30">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                    />
                    <div>
                      <p className="font-semibold text-ink text-sm">Cash on Delivery (COD)</p>
                      <p className="text-xs text-navy-600">Pay upon delivery confirmation</p>
                    </div>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Confirmation */}
          <div>
            <Card className="sticky top-20 border-navy-300 shadow-lg">
              <CardHeader>
                <CardTitle>Order Authorization</CardTitle>
                <CardDescription>Review totals before final placement</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-navy-600">
                <div className="rounded-card bg-navy-50 p-3 space-y-1">
                  <p className="font-bold text-navy-900">Platform Guarantee:</p>
                  <p>Order line items snapshot price, SKU, and reseller attribution at time of sale.</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-3.5 bg-amber-500 text-navy-900 font-bold hover:bg-amber-600 text-sm shadow"
                >
                  Authorize & Place Order →
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </main>
  );
}
