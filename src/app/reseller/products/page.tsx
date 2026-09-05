"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyResellerProducts, toggleProductVisibility } from "@/server/reseller-products";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { ProductStatus } from "@prisma/client";

type ProductItem = Awaited<ReturnType<typeof getMyResellerProducts>>[number];

export default function ResellerProductsListPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ id: string; text: string } | null>(null);
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "HIDDEN" | "PRIVATE">("ALL");

  useEffect(() => {
    getMyResellerProducts()
      .then((res) => setProducts(res))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(productId: string, newStatus: "APPROVED" | "UNPUBLISHED" | "DRAFT") {
    setUpdatingId(productId);
    setStatusMsg(null);

    try {
      const res = await toggleProductVisibility(productId, newStatus);
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: res.status } : p))
        );
        const label =
          newStatus === "APPROVED" ? "🟢 Live (ON)" : newStatus === "UNPUBLISHED" ? "⚪ Hidden (OFF)" : "🔒 Private";
        setStatusMsg({ id: productId, text: `Status updated to ${label}` });
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        alert("Failed to update status: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredProducts = products.filter((p) => {
    if (filter === "LIVE") return p.status === "APPROVED";
    if (filter === "HIDDEN") return p.status === "UNPUBLISHED";
    if (filter === "PRIVATE") return p.status === "DRAFT";
    return true;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
            Seller Catalog Management
          </span>
          <h1 className="text-3xl font-display font-bold text-ink">My Products & Inventory</h1>
        </div>

        <Link href="/reseller/products/new">
          <Button variant="primary" className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
            + Submit New Product
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: "ALL", label: `All (${products.length})` },
          { key: "LIVE", label: `🟢 Live (${products.filter((p) => p.status === "APPROVED").length})` },
          { key: "HIDDEN", label: `⚪ Hidden (${products.filter((p) => p.status === "UNPUBLISHED").length})` },
          { key: "PRIVATE", label: `🔒 Private (${products.filter((p) => p.status === "DRAFT").length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === tab.key
                ? "bg-navy-900 text-white border-navy-900 shadow-sm"
                : "bg-white text-navy-600 border-line hover:border-navy-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b border-line pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Product Listings ({filteredProducts.length})</CardTitle>
            <CardDescription>Manage storefront visibility (Live / Hidden / Private)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading catalog listings...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-navy-600 space-y-3">
              <p className="text-base font-semibold text-ink">No products found in this view.</p>
              <p className="text-xs text-navy-400 max-w-md mx-auto">
                Use the listing wizard to submit products or upload items to your catalog.
              </p>
              <Link href="/reseller/products/new">
                <Button variant="primary" className="mt-2">Add New Product →</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {filteredProducts.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-50/30 transition-colors">
                  {/* Left: Product Thumbnail & Meta */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl border border-line bg-navy-50 overflow-hidden flex items-center justify-center shrink-0">
                      {p.mainImage ? (
                        <img src={p.mainImage} alt={p.title} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="font-mono text-xs text-navy-400">NO IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-ink text-base">{p.title}</p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-navy-600 mt-0.5">
                        Category: <span className="font-medium text-ink">{p.categoryName}</span> • SKU: <span className="font-mono font-semibold">{p.sku}</span>
                      </p>
                      {statusMsg?.id === p.id && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1 animate-pulse">
                          ✓ {statusMsg.text}
                        </p>
                      )}
                      {p.rejectionReason && (
                        <p className="text-xs text-danger mt-1">Reason: {p.rejectionReason}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Switch Controls & Price */}
                  <div className="flex items-center gap-6 justify-between sm:justify-end flex-wrap">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-navy-400 block">Available</span>
                      <span className="text-sm font-semibold text-ink">{p.availableStock} Units</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-navy-400 block">Price</span>
                      <span className="text-base font-bold text-navy-900 font-mono">
                        ₹{(p.priceCents / 100).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Quick Visibility Controls (ON / OFF / Private) */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold text-navy-500 uppercase tracking-wider">Visibility</span>
                      <select
                        disabled={updatingId === p.id}
                        value={p.status === "APPROVED" ? "APPROVED" : p.status === "UNPUBLISHED" ? "UNPUBLISHED" : "DRAFT"}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-lg border px-2.5 py-1.5 outline-none transition-all cursor-pointer ${
                          p.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : p.status === "UNPUBLISHED"
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="APPROVED">🟢 ON (Live on Store)</option>
                        <option value="UNPUBLISHED">⚪ OFF (Hidden from Store)</option>
                        <option value="DRAFT">🔒 Private (Draft)</option>
                      </select>
                    </div>
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
