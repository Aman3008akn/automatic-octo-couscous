"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyResellerProducts } from "@/server/reseller-products";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type ProductItem = Awaited<ReturnType<typeof getMyResellerProducts>>[number];

export default function ResellerProductsListPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    getMyResellerProducts()
      .then((res) => setProducts(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
            Seller Catalog Management
          </span>
          <h1 className="text-3xl font-display font-bold text-ink">My Products & Submissions</h1>
        </div>

        <Link href="/reseller/products/new">
          <Button variant="primary" className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
            + Submit New Product (10-Step Wizard)
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b border-line pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Product Listings ({products.length})</CardTitle>
          <CardDescription>Managed listings undergoing moderation or published on storefront</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading catalog listings...</p>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-navy-600 space-y-3">
              <p className="text-base font-semibold text-ink">No product listings submitted yet.</p>
              <p className="text-xs text-navy-400 max-w-md mx-auto">
                Use the 10-step listing wizard to submit products for compliance moderation and start receiving customer orders.
              </p>
              <Link href="/reseller/products/new">
                <Button variant="primary" className="mt-2">Start First Listing →</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-50/40">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-card border border-line bg-navy-50 overflow-hidden flex items-center justify-center shrink-0">
                      {p.mainImage ? (
                        <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-mono text-xs text-navy-400">NO IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-ink text-base">{p.title}</p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-navy-600">
                        Category: <span className="font-medium text-ink">{p.categoryName}</span> • SKU: <span className="font-mono">{p.sku}</span>
                      </p>
                      {p.rejectionReason && (
                        <p className="text-xs text-danger mt-1">Reason: {p.rejectionReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-navy-400 block">Available</span>
                      <span className="text-sm font-semibold text-ink">{p.availableStock} Units</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-navy-400 block">Price</span>
                      <span className="text-base font-bold text-navy-900">${(p.priceCents / 100).toFixed(2)}</span>
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
