import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/orders/order-timeline";

export default async function OrderDetailsPage({ params }: { params: { orderNumber: string } }) {
  let session;
  try {
    session = await requireSession();
  } catch (err) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-center min-h-screen">
        <h1 className="text-2xl font-bold text-navy-900 mb-4">Sign in required</h1>
        <Link href="/login">
          <Button variant="primary">Sign In</Button>
        </Link>
      </main>
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
      statusLog: { orderBy: { createdAt: "desc" } },
    },
  });

  // If order not found, or it belongs to someone else
  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-sans min-h-screen bg-gray-50/30">
      <div className="mb-6 border-b border-line pb-4 flex items-center justify-between">
        <div>
          <Link href="/orders" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 mb-2">
            <span>←</span> Back to Orders
          </Link>
          <h1 className="text-3xl font-display font-bold text-navy-900 flex items-center gap-3">
            <span>Order Details</span>
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Order <span className="font-bold text-navy-900">#{order.orderNumber}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Timeline & Line Items */}
        <div className="md:col-span-2 space-y-6">
          <OrderTimeline status={order.status} />

          <div className="bg-white rounded-2xl shadow-sm border border-line overflow-hidden">
            <div className="bg-navy-50/50 p-4 border-b border-line flex justify-between items-center">
              <h2 className="font-bold text-navy-900">Items in this order</h2>
              <StatusBadge status={order.status} />
            </div>

            <div className="divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex gap-5 items-start">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl border border-line flex items-center justify-center shrink-0">
                    <span className="text-2xl opacity-20">📦</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 items-start">
                      <div>
                        <Link href={`/products/${item.variantId}`}>
                          <h3 className="font-bold text-navy-900 text-base leading-tight line-clamp-2 hover:text-amber-600 transition-colors">
                            {item.titleSnapshot}
                          </h3>
                        </Link>
                        <p className="text-sm text-navy-500 mt-1">Sold by Verified Reseller</p>
                        <p className="text-xs font-mono text-navy-400 mt-2">
                          SKU: {item.skuSnapshot} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-navy-900 text-base">
                          ₹{((item.unitPriceCentsSnap * item.quantity) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-line overflow-hidden sticky top-24">
            <div className="bg-navy-900 p-5 border-b border-navy-800">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>🧾</span> Order Summary
              </h2>
            </div>
            
            <div className="p-5 space-y-4 text-sm text-navy-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold text-navy-900">
                  ₹{(order.subtotalCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Shipping Fee</span>
                <span className="font-bold text-success">
                  {order.shippingCents === 0 ? "FREE" : `₹${(order.shippingCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Tax</span>
                <span className="font-semibold text-navy-900">
                  ₹{(order.taxCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="pt-4 mt-2 border-t border-dashed border-line flex justify-between items-center text-lg font-bold text-navy-900">
                <span>Total Amount</span>
                <span>₹{(order.totalCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="bg-navy-50/50 p-5 border-t border-line text-xs text-navy-600">
              <p className="font-bold text-navy-900 mb-1">Order Date</p>
              <p>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            
            <div className="bg-navy-50/50 p-5 border-t border-line text-sm text-navy-700">
              <p className="font-bold text-navy-900 mb-2">Payment Method</p>
              <p className="flex items-center gap-2">
                <span className="font-semibold px-2 py-1 bg-white border border-line rounded uppercase text-xs tracking-wider">
                  {(order as any).paymentMethod || "UNKNOWN"}
                </span>
                {order.status === "PENDING_PAYMENT" && (order as any).paymentMethod === "COD" && (
                  <span className="text-amber-600 font-medium text-xs">(To be paid on delivery)</span>
                )}
              </p>
            </div>

            {(order as any).shippingAddress && (
              <div className="bg-navy-50/50 p-5 border-t border-line text-sm text-navy-700">
                <p className="font-bold text-navy-900 mb-2">Shipping Details</p>
                <div className="space-y-1">
                  <p>{session.user.name || session.user.email}</p>
                  <p>{(order as any).shippingAddress.line1}</p>
                  { (order as any).shippingAddress.line2 && <p>{(order as any).shippingAddress.line2}</p> }
                  <p>{(order as any).shippingAddress.city}, {(order as any).shippingAddress.state} {(order as any).shippingAddress.postalCode}</p>
                  <p>{(order as any).shippingAddress.country}</p>
                  <p className="mt-2 text-navy-500">Phone: {(order as any).shippingAddress.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
