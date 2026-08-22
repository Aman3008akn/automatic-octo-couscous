"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getResellerFulfillmentOrders, updateFulfillmentStatus } from "@/server/orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type OrderItem = Awaited<ReturnType<typeof getResellerFulfillmentOrders>>[number];

export default function ResellerFulfillmentOrdersPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("FedEx");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadQueue() {
    setLoading(true);
    getResellerFulfillmentOrders()
      .then((res) => setItems(res))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadQueue();
  }, []);

  async function handleMarkShipped(orderId: string) {
    setUpdatingId(orderId);
    await updateFulfillmentStatus(orderId, "SHIPPED", trackingNumber, carrier);
    setUpdatingId(null);
    setTrackingNumber("");
    loadQueue();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Reseller Operations
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">Fulfillment & Order Queue</h1>
      </div>

      <Card>
        <CardHeader className="border-b border-line pb-3">
          <CardTitle className="text-lg">Customer Orders ({items.length})</CardTitle>
          <CardDescription>Orders requiring merchant packing, shipping, and tracking numbers</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading fulfillment queue...</p>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-navy-600">
              <p className="text-base font-semibold text-ink">No customer orders in queue.</p>
              <p className="text-xs text-navy-400 mt-1">Orders for your approved listings will appear here upon purchase.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {items.map((item) => (
                <div key={item.orderItemId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-navy-50/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold font-mono text-ink text-sm">{item.orderNumber}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs font-semibold text-ink">{item.titleSnapshot}</p>
                    <p className="text-xs text-navy-600">
                      Customer: {item.customerName} • SKU: <span className="font-mono">{item.skuSnapshot}</span> • Qty: {item.quantity}
                    </p>
                    <p className="text-xs text-navy-400 font-mono">
                      Gross: ${((item.unitPriceCentsSnap * item.quantity) / 100).toFixed(2)} | Net Reseller Payout: ${(((item.unitPriceCentsSnap * item.quantity) - item.commissionCentsSnap) / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {item.status !== "SHIPPED" && item.status !== "DELIVERED" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="rounded-card border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none"
                        >
                          <option value="FedEx">FedEx Express</option>
                          <option value="UPS">UPS Ground</option>
                          <option value="USPS">USPS Priority</option>
                          <option value="DHL">DHL Express</option>
                        </select>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="Tracking # e.g. 784930219"
                          className="rounded-card border border-line bg-white px-2.5 py-1.5 text-xs text-ink outline-none"
                        />
                        <Button
                          variant="primary"
                          loading={updatingId === item.orderId}
                          onClick={() => handleMarkShipped(item.orderId)}
                          className="text-xs bg-navy-900 text-paper font-semibold hover:bg-navy-600"
                        >
                          Mark Shipped
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-success bg-success/15 px-3 py-1 rounded-full">
                        ✓ Shipped Tracked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
