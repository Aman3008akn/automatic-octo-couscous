"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/supabase/hooks";
import { getMyOrders } from "@/server/orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type OrderItem = Awaited<ReturnType<typeof getMyOrders>>[number];

export default function CustomerOrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (session) {
      getMyOrders()
        .then((res) => setOrders(res))
        .finally(() => setLoading(false));
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <p className="text-sm font-medium text-navy-600 animate-pulse">Loading order history...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Sign in to view your Cartigo marketplace purchase history.</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Link href="/login?callbackUrl=/orders">
              <Button variant="primary">Sign In</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 font-sans min-h-screen bg-gray-50/30">
      <div className="mb-8 border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy-900 flex items-center gap-3">
            <span>My Orders</span>
            <span className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">{orders.length}</span>
          </h1>
          <p className="text-sm text-navy-500 mt-1">Track, return, or buy items again</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl shadow-sm border border-line text-center">
          <span className="text-6xl mb-4 opacity-50 grayscale">🛍️</span>
          <h2 className="text-xl font-bold text-navy-900 mb-2">No orders placed yet</h2>
          <p className="text-sm text-navy-500 max-w-md mb-6">Looks like you haven't made your first purchase on Cartigo. Discover top products from verified resellers today!</p>
          <Link href="/">
            <Button variant="primary" className="px-8 shadow-md hover:-translate-y-0.5 transition-all">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-line overflow-hidden transition-all hover:shadow-lg">
              <div className="bg-navy-50/50 p-5 sm:px-8 border-b border-line flex flex-wrap gap-6 justify-between items-center">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs uppercase font-bold text-navy-500 tracking-wider mb-1">Order Placed</p>
                    <p className="font-semibold text-navy-900 text-sm">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-navy-500 tracking-wider mb-1">Total</p>
                    <p className="font-bold text-navy-900 text-sm">
                      ₹{(ord.totalCents / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-navy-500 font-medium">
                    Order # <span className="font-bold text-navy-900">{ord.orderNumber}</span>
                  </p>
                  <StatusBadge status={ord.status} />
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="space-y-6">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex gap-5 items-start">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl border border-line flex items-center justify-center shrink-0">
                        <span className="text-3xl opacity-20">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 items-start">
                          <div>
                            <h3 className="font-bold text-navy-900 text-base leading-tight truncate">{item.titleSnapshot}</h3>
                            <p className="text-sm text-navy-500 mt-1">Sold by Verified Reseller</p>
                            <p className="text-xs font-mono text-navy-400 mt-2 bg-navy-50 inline-block px-2 py-1 rounded">
                              SKU: {item.skuSnapshot} • Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-navy-900 text-base">
                              ₹{((item.unitPriceCentsSnap * item.quantity) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <button className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline transition-colors">
                            Track Package
                          </button>
                          <span className="text-line">|</span>
                          <button className="text-sm font-semibold text-navy-600 hover:text-navy-900 hover:underline transition-colors">
                            View Item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3 sm:px-8 border-t border-line">
                <Link href={`/orders/${ord.orderNumber}`} className="text-sm font-bold text-navy-600 hover:text-amber-600 transition-colors flex justify-end items-center gap-1">
                  View Full Order Details <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
