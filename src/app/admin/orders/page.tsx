"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAdmin, updateOrderStatusAdmin } from "@/server/admin-orders";
import type { OrderStatus } from "@prisma/client";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getAllOrdersAdmin>>>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data);
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const res = await updateOrderStatusAdmin(orderId, newStatus);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert("Failed to update status: " + res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error updating order status.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-navy-500 animate-pulse">Loading orders...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Order Management</h1>
          <p className="text-sm text-navy-500">Track and manage all customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-navy-50/50 text-navy-600 font-semibold border-b border-line uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Shipping Location</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-navy-900">{order.orderNumber}</p>
                    <p className="text-xs text-navy-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-navy-900">{order.user?.name || "Unknown"}</p>
                    <p className="text-xs text-navy-500">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    {order.shippingAddress ? (
                      <div>
                        <p className="text-navy-900 font-medium">
                          {(order.shippingAddress as any).city}, {(order.shippingAddress as any).state}
                        </p>
                        <p className="text-xs text-navy-500">
                          {(order.shippingAddress as any).postalCode}, {(order.shippingAddress as any).country}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No address</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-navy-900">
                      ₹{(order.totalCents / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-navy-500">{order.itemsCount} items</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      order.paymentMethod === "COD" 
                        ? "bg-purple-100 text-purple-700" 
                        : order.paymentMethod === "CARD" 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-gray-100 text-gray-700"
                    }`}>
                      {order.paymentMethod || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className="text-sm border border-line rounded px-2 py-1 bg-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    >
                      {ALL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          Mark as {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-navy-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
