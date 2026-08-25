"use client";

import { useState, useEffect } from "react";
import { getBanners, getAllBannersAdmin, createBanner, toggleBannerActive, deleteBanner } from "@/server/banners";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("HERO_CAROUSEL");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    setLoading(true);
    const data = await getAllBannersAdmin();
    setBanners(data);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await createBanner({
      title,
      imageUrl,
      linkUrl,
      position,
      isActive,
      order,
    });

    setCreating(false);
    if (res.ok) {
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
      setOrder(0);
      loadBanners();
    } else {
      setError(res.error || "Failed to create banner");
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const res = await toggleBannerActive(id, !currentStatus);
    if (res.ok) {
      loadBanners();
    } else {
      alert(res.error || "Failed to toggle");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this banner?")) {
      const res = await deleteBanner(id);
      if (res.ok) {
        loadBanners();
      } else {
        alert(res.error || "Failed to delete");
      }
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">Storefront Management</span>
        <h1 className="text-3xl font-display font-bold text-ink">Banners & Promotions</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Banner */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="border-b border-line pb-3">
              <CardTitle className="text-lg">Add New Banner</CardTitle>
              <CardDescription>Upload an image URL for the storefront</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {error && (
                <div className="mb-4 rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
                  {error}
                </div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">Banner Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Summer Sale 2026"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">Image URL</label>
                  <input
                    required
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400"
                  />
                  {imageUrl && (
                    <div className="mt-2 rounded border border-line overflow-hidden max-h-32">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">Link URL (Optional)</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/search?q=sale"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400"
                    >
                      <option value="HERO_CAROUSEL">Hero Carousel</option>
                      <option value="TRENDING">Trending Now</option>
                      <option value="COUNTDOWN">Countdown Deal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">Order</label>
                    <input
                      required
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value))}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-navy-400"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-line text-navy-900 focus:ring-navy-900"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-ink">Active (Visible to users)</label>
                </div>
                <Button type="submit" loading={creating} className="w-full">
                  Create Banner
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Existing Banners */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="border-b border-line pb-3">
              <CardTitle className="text-lg">Manage Existing Banners</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-xs text-navy-600 animate-pulse">Loading banners...</div>
              ) : banners.length === 0 ? (
                <div className="p-12 text-center text-navy-600">
                  <p className="text-sm font-semibold">No banners found.</p>
                  <p className="text-xs text-navy-400 mt-1">Create your first banner using the form.</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {banners.map((banner) => (
                    <div key={banner.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-full sm:w-48 h-24 shrink-0 rounded overflow-hidden border border-line bg-navy-50">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-ink">{banner.title}</h3>
                          <span className="text-[10px] font-mono font-bold bg-navy-100 text-navy-800 px-1.5 py-0.5 rounded uppercase">
                            {banner.position}
                          </span>
                        </div>
                        <p className="text-xs text-navy-600">Order: {banner.order} • {banner.linkUrl ? `Links to: ${banner.linkUrl}` : "No link"}</p>
                        <p className="text-xs font-medium text-navy-600">
                          Status: {banner.isActive ? <span className="text-success">Active</span> : <span className="text-danger">Inactive</span>}
                        </p>
                      </div>
                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleToggle(banner.id, banner.isActive)}
                          className="text-xs h-8 px-3"
                        >
                          {banner.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDelete(banner.id)}
                          className="text-xs h-8 px-3"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
