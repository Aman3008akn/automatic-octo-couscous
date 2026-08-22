"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
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
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Order Management
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">My Order History</h1>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center text-navy-600">
          <p className="text-base font-semibold text-ink">You haven&apos;t placed any orders yet.</p>
          <p className="text-xs text-navy-400 mt-1">Browse approved products from verified resellers on Cartigo.</p>
          <div className="mt-4">
            <Link href="/">
              <Button variant="primary">Start Shopping →</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <Card key={ord.id} className="border border-line shadow-sm">
              <CardHeader className="bg-navy-50/50 border-b border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-ink font-mono text-sm">{ord.orderNumber}</p>
                    <StatusBadge status={ord.status} />
                  </div>
                  <p className="text-xs text-navy-400 font-mono mt-0.5">
                    Placed on {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-navy-400 font-mono uppercase block">Total Amount</span>
                  <span className="text-lg font-bold text-navy-900">${(ord.totalCents / 100).toFixed(2)} USD</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold text-navy-600 uppercase tracking-wider">Line Items Snapshot:</p>

                <div className="divide-y divide-line border border-line rounded-card bg-white">
                  {ord.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-ink">{item.titleSnapshot}</p>
                        <p className="text-navy-600 font-mono text-[11px]">SKU: {item.skuSnapshot} • Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right font-semibold text-navy-900">
                        ${((item.unitPriceCentsSnap * item.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
