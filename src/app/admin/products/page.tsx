"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAdminProductQueue, moderateProduct } from "@/server/admin-products";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { ProductStatus } from "@prisma/client";

type ProductItem = Awaited<ReturnType<typeof getAdminProductQueue>>[number];

export default function AdminProductsQueuePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProd, setSelectedProd] = useState<ProductItem | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState<string | null>(null);

  function loadQueue() {
    setLoading(true);
    getAdminProductQueue(statusFilter, searchQuery)
      .then((res) => {
        setProducts(res);
        if (selectedProd) {
          const updated = res.find((p) => p.id === selectedProd.id);
          if (updated) setSelectedProd(updated);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadQueue();
  }, [statusFilter, searchQuery]);

  function handleOpenDrawer(p: ProductItem) {
    setSelectedProd(p);
    setRejectionReason(p.rejectionReason ?? "");
    setModError(null);
  }

  async function handleDecision(decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED" | "UNPUBLISHED") {
    if (!selectedProd) return;

    if ((decision === "REJECTED" || decision === "CHANGES_REQUESTED") && !rejectionReason.trim()) {
      setModError("Please provide feedback or reason for this moderation decision.");
      return;
    }

    setModLoading(true);
    setModError(null);

    const res = await moderateProduct({
      productId: selectedProd.id,
      decision,
      reason: rejectionReason || undefined,
    });

    setModLoading(false);

    if (!res.ok) {
      setModError(res.error);
    } else {
      setSelectedProd(null);
      loadQueue();
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
            Slice 2 Catalog Control
          </span>
          <h1 className="text-3xl font-display font-bold text-ink">Product Moderation Queue</h1>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, product title, seller..."
            className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {(["ALL", "PENDING_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED", "UNPUBLISHED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab
                ? "bg-navy-900 text-paper font-semibold shadow-sm"
                : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            {tab === "ALL" ? "All Submissions" : tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Main Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedProd ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader className="border-b border-line pb-3">
              <CardTitle className="text-lg">Moderation Submissions ({products.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading moderation queue...</p>
              ) : products.length === 0 ? (
                <div className="p-12 text-center text-navy-600">
                  <p className="text-sm font-semibold">No product submissions in this view.</p>
                  <p className="text-xs text-navy-400 mt-1">Try selecting &quot;All Submissions&quot; or clearing search filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenDrawer(p)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-50/50 cursor-pointer transition-colors ${
                        selectedProd?.id === p.id ? "bg-navy-50 border-l-4 border-navy-900" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-card border border-line bg-navy-50 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.images[0]?.url ? (
                            <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-mono text-xs text-navy-400">NO IMG</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-ink text-sm">{p.title}</p>
                            <StatusBadge status={p.status} />
                          </div>
                          <p className="text-xs text-navy-600">
                            Seller: <span className="font-semibold text-ink">{p.resellerProfile.legalName}</span> • Category: {p.category.name}
                          </p>
                          <p className="text-[11px] font-mono text-navy-400">
                            SKU: {p.mainVariant?.sku ?? "N/A"} • Stock: {p.mainVariant?.inventoryCount ?? 0}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <span className="text-base font-bold text-navy-900">
                          ${((p.mainVariant?.priceCents ?? 0) / 100).toFixed(2)}
                        </span>
                        <Button variant="secondary" className="text-xs py-1 px-3">
                          Inspect →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Product Moderation Drawer */}
        {selectedProd && (
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-navy-300 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-line pb-3">
                <div>
                  <CardTitle className="text-base font-bold">{selectedProd.title}</CardTitle>
                  <CardDescription className="text-xs font-mono">SKU: {selectedProd.mainVariant?.sku}</CardDescription>
                </div>
                <button
                  onClick={() => setSelectedProd(null)}
                  className="rounded-full p-1 text-navy-400 hover:text-ink hover:bg-navy-100"
                >
                  ✕
                </button>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-600">Moderation Status:</span>
                  <StatusBadge status={selectedProd.status} />
                </div>

                {modError && (
                  <div className="rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
                    ⚠️ {modError}
                  </div>
                )}

                {/* Product Image Preview */}
                {selectedProd.images[0]?.url && (
                  <div className="w-full h-44 rounded-card border border-line overflow-hidden bg-navy-50">
                    <img src={selectedProd.images[0].url} alt={selectedProd.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Product Details */}
                <div className="rounded-card bg-navy-50/60 p-3 text-xs space-y-1.5 border border-line">
                  <p className="font-semibold text-navy-900 border-b border-line pb-1">Product & Seller Identity</p>
                  <p><span className="text-navy-600">Reseller:</span> {selectedProd.resellerProfile.legalName}</p>
                  <p><span className="text-navy-600">Category:</span> {selectedProd.category.name}</p>
                  <p><span className="text-navy-600">Brand / Condition:</span> {selectedProd.brand || "N/A"} ({selectedProd.condition || "New"})</p>
                  <p><span className="text-navy-600">Price:</span> ${( (selectedProd.mainVariant?.priceCents ?? 0) / 100 ).toFixed(2)} USD</p>
                  <p><span className="text-navy-600">Stock Count:</span> {selectedProd.mainVariant?.inventoryCount} Units</p>
                </div>

                {/* Description */}
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-navy-900">Description:</p>
                  <p className="text-navy-600 bg-white p-2 rounded border border-line text-[11px] leading-relaxed">
                    {selectedProd.description}
                  </p>
                </div>

                {/* Moderation Feedback Reason Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-navy-900">
                    Moderation Note / Rejection Reason <span className="text-[10px] text-navy-600 font-normal">(Visible to reseller if rejected/changes requested)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter compliance feedback or rejection reason..."
                    className="w-full rounded-card border border-line bg-white p-2 text-xs text-ink outline-none focus:border-navy-400"
                  />
                </div>

                {/* Decision Actions */}
                <div className="pt-3 border-t border-line space-y-2">
                  <Button
                    variant="primary"
                    loading={modLoading}
                    onClick={() => handleDecision("APPROVED")}
                    className="w-full bg-success text-white hover:bg-success/90 font-bold text-xs py-2"
                  >
                    ✓ Approve & Publish Product
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      loading={modLoading}
                      onClick={() => handleDecision("CHANGES_REQUESTED")}
                      className="text-xs bg-amber-400/20 text-amber-700 hover:bg-amber-400/30"
                    >
                      Request Changes
                    </Button>

                    <Button
                      variant="destructive"
                      loading={modLoading}
                      onClick={() => handleDecision("REJECTED")}
                      className="text-xs"
                    >
                      ✕ Reject
                    </Button>
                  </div>

                  {selectedProd.status === "APPROVED" && (
                    <Button
                      variant="tertiary"
                      loading={modLoading}
                      onClick={() => handleDecision("UNPUBLISHED")}
                      className="w-full text-xs text-danger hover:bg-danger/10 border border-danger/20"
                    >
                      Unpublish Listing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
