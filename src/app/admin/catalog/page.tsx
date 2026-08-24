"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminCatalog, deleteAdminProduct } from "@/server/admin-catalog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type CatalogProduct = Awaited<ReturnType<typeof getAdminCatalog>>[number];

export default function AdminCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  function loadCatalog() {
    setLoading(true);
    getAdminCatalog(searchQuery)
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCatalog();
  }, [searchQuery]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setDeleteLoading(id);
    await deleteAdminProduct(id);
    setDeleteLoading(null);
    loadCatalog();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
            Store Management
          </span>
          <h1 className="text-3xl font-display font-bold text-ink">Catalog & Products</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full sm:w-64 rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
          />
          <Link href="/admin/catalog/new">
            <Button variant="primary" className="w-full sm:w-auto py-2">
              + Add New Product
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-line pb-3">
          <CardTitle className="text-lg">All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading catalog...</p>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-navy-600">
              <p className="text-sm font-semibold">No products found.</p>
              <p className="text-xs text-navy-400 mt-1">Add a new product to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-line overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-navy-50/50 text-xs text-navy-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Seller</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-navy-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded border border-line bg-navy-50 overflow-hidden flex items-center justify-center">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-navy-400">N/A</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-ink max-w-[200px] truncate">{p.title}</p>
                            <p className="text-[10px] text-navy-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-navy-600">{p.seller}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${p.inventoryCount > 0 ? "text-success" : "text-danger"}`}>
                          {p.inventoryCount} in stock
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-navy-900">${(p.priceCents / 100).toFixed(2)}</span>
                          {p.compareAtCents && (
                            <span className="text-[10px] text-navy-400 line-through">
                              ${(p.compareAtCents / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/catalog/${p.id}/edit`}>
                            <Button variant="secondary" className="px-2 py-1 text-xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            className="px-2 py-1 text-xs"
                            loading={deleteLoading === p.id}
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
