"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminProduct, updateAdminProduct } from "@/server/admin-catalog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

type Category = { id: string; name: string };

type ProductData = {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  brand: string;
  condition: string;
  priceCents: number;
  compareAtCents?: number;
  sku: string;
  inventoryCount: number;
  imageUrl: string;
};

export function ProductForm({ 
  initialData, 
  categories 
}: { 
  initialData?: ProductData; 
  categories: Category[];
}) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || (categories[0]?.id ?? ""),
    brand: initialData?.brand || "",
    condition: initialData?.condition || "New",
    priceUsd: initialData?.priceCents ? (initialData.priceCents / 100).toFixed(2) : "",
    compareAtUsd: initialData?.compareAtCents ? (initialData.compareAtCents / 100).toFixed(2) : "",
    sku: initialData?.sku || "",
    inventoryCount: initialData?.inventoryCount || 0,
    imageUrl: initialData?.imageUrl || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        brand: formData.brand,
        condition: formData.condition,
        priceCents: Math.round(parseFloat(formData.priceUsd) * 100),
        compareAtCents: formData.compareAtUsd ? Math.round(parseFloat(formData.compareAtUsd) * 100) : undefined,
        sku: formData.sku,
        inventoryCount: Number(formData.inventoryCount),
        imageUrl: formData.imageUrl,
      };

      let res;
      if (isEditing) {
        res = await updateAdminProduct(initialData.id!, payload);
      } else {
        res = await createAdminProduct(payload);
      }

      if (res.ok) {
        router.push("/admin/catalog");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the product.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="border-b border-line bg-navy-50/30">
          <CardTitle className="text-xl font-display text-navy-900">
            {isEditing ? "Edit Product" : "Add New First-Party Product"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          {error && (
            <div className="rounded-card bg-danger/10 border border-danger/20 p-4 text-sm text-danger font-medium">
              {error}
            </div>
          )}

          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 border-b border-line pb-2">
              1. Basic Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-900 mb-1">Product Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sony PlayStation 5 Console"
                  className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Sony"
                  className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-navy-900 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product description..."
                  className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 border-b border-line pb-2">
              2. Pricing & Inventory
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Selling Price (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-navy-400">$</span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceUsd}
                    onChange={(e) => setFormData({ ...formData, priceUsd: e.target.value })}
                    placeholder="99.99"
                    className="w-full rounded-card border border-line p-2 pl-7 text-sm focus:border-navy-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Compare-at Price (Discounted From)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-navy-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compareAtUsd}
                    onChange={(e) => setFormData({ ...formData, compareAtUsd: e.target.value })}
                    placeholder="129.99"
                    className="w-full rounded-card border border-line p-2 pl-7 text-sm focus:border-navy-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">SKU (Stock Keeping Unit) *</label>
                <input
                  required
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. SONY-PS5-001"
                  className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">Inventory Count *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.inventoryCount}
                  onChange={(e) => setFormData({ ...formData, inventoryCount: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400 border-b border-line pb-2">
              3. Media
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">Primary Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-card border border-line p-2 text-sm focus:border-navy-400 outline-none"
              />
              {formData.imageUrl && (
                <div className="mt-4 w-32 h-32 rounded-card overflow-hidden border border-line bg-navy-50">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

        </CardContent>

        <CardFooter className="bg-navy-50/50 border-t border-line p-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} className="px-6">
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
