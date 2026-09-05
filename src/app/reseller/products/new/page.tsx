"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/hooks";
import { saveProductDraft, submitProductForReview } from "@/server/reseller-products";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

const STEPS = [
  { num: 1, name: "Category" },
  { num: 2, name: "Basic Info" },
  { num: 3, name: "Images" },
  { num: 4, name: "Variants & SKU" },
  { num: 5, name: "Inventory" },
  { num: 6, name: "Pricing" },
  { num: 7, name: "Shipping" },
  { num: 8, name: "Returns" },
  { num: 9, name: "Preview" },
  { num: 10, name: "Submit" },
];

export default function NewProductWizardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState<number>(1);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);

  // Form State
  const [categoryId, setCategoryId] = useState<string>("electronics");
  const [categoryName, setCategoryName] = useState<string>("Electronics");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("New");

  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"gallery" | "url">("gallery");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [productVisibility, setProductVisibility] = useState<"APPROVED" | "UNPUBLISHED" | "DRAFT">("APPROVED");

  const [sku, setSku] = useState("");
  const [colorOption, setColorOption] = useState("Default");

  const [inventoryCount, setInventoryCount] = useState<number>(20);

  const [priceDollars, setPriceDollars] = useState<string>("49.99");
  const [compareAtDollars, setCompareAtDollars] = useState<string>("69.99");

  const [shippingMode, setShippingMode] = useState("Merchant Shipping (2-Day Delivery)");
  const [returnPolicy, setReturnPolicy] = useState("Cartigo Standard 14-Day Acceptance");

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSavedMsg, setDraftSavedMsg] = useState<string | null>(null);

  const priceCents = Math.round((parseFloat(priceDollars) || 0) * 100);
  const compareAtCents = compareAtDollars ? Math.round((parseFloat(compareAtDollars) || 0) * 100) : undefined;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image size must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    setImageUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      setImageUrl(data.url);
    } catch (err: any) {
      setImageUploadError(err.message || "Failed to upload photo from device.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true);
    setError(null);
    setDraftSavedMsg(null);

    const res = await saveProductDraft({
      productId: draftId,
      categoryId,
      title: title || "Draft Product",
      description,
      brand,
      condition,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop",
      sku: sku || `SKU-${Date.now()}`,
      optionsJson: { color: colorOption },
      priceCents,
      compareAtCents,
      inventoryCount,
    });

    setSavingDraft(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      setDraftId(res.productId);
      setDraftSavedMsg("Draft listing saved successfully!");
      setTimeout(() => setDraftSavedMsg(null), 3000);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !description || !sku || priceCents <= 0) {
      setError("Please complete all required listing fields before submitting.");
      return;
    }

    if (!imageUrl) {
      setError("Please upload or provide at least one product photo.");
      return;
    }

    setLoading(true);

    const res = await submitProductForReview({
      productId: draftId,
      categoryId,
      title,
      description,
      brand,
      condition,
      imageUrl,
      sku,
      optionsJson: { color: colorOption },
      priceCents,
      compareAtCents,
      inventoryCount,
      status: productVisibility,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      router.push("/reseller/products?submitted=true");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Wizard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
              10-Step Listing Wizard (Slice 2)
            </span>
            <h1 className="text-3xl font-display font-bold text-ink">Submit Product Listing</h1>
          </div>
          <Button
            type="button"
            variant="tertiary"
            loading={savingDraft}
            onClick={handleSaveDraft}
            className="text-xs font-medium border border-line"
          >
            Save Draft
          </Button>
        </div>

        {/* Horizontal Step Bar */}
        <div className="mt-6 flex items-center justify-between border-b border-line pb-4 overflow-x-auto gap-2 scrollbar-none">
          {STEPS.map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 shrink-0">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  step === s.num
                    ? "bg-navy-900 text-amber-400"
                    : step > s.num
                    ? "bg-success text-white"
                    : "bg-navy-50 text-navy-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className={`text-xs ${step === s.num ? "font-bold text-ink" : "text-navy-400"}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-card bg-danger/10 border border-danger/20 p-4 text-xs font-medium text-danger">
          ⚠️ {error}
        </div>
      )}

      {draftSavedMsg && (
        <div className="mb-6 rounded-card bg-success/10 border border-success/20 p-4 text-xs font-medium text-success">
          ✓ {draftSavedMsg}
        </div>
      )}

      <Card className="shadow-md">
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Category */}
          {step === 1 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 1: Choose Product Category</CardTitle>
              <CardDescription>Select the marketplace category that best fits your product.</CardDescription>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: "electronics", name: "Electronics" },
                  { id: "mobiles-tablets", name: "Mobiles & Tablets" },
                  { id: "computers-laptops", name: "Computers & Laptops" },
                  { id: "home-kitchen", name: "Home & Kitchen" },
                  { id: "fashion-apparel", name: "Fashion & Apparel" },
                  { id: "beauty-care", name: "Beauty & Care" },
                  { id: "sports-fitness", name: "Sports & Fitness" },
                  { id: "gaming", name: "Gaming & Consoles" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(cat.id);
                      setCategoryName(cat.name);
                    }}
                    className={`rounded-xl border p-4 text-left font-medium text-sm transition-all ${
                      categoryId === cat.id
                        ? "bg-navy-900 text-paper border-navy-900 shadow"
                        : "bg-white text-navy-600 border-line hover:border-navy-400"
                    }`}
                  >
                    <p className="font-bold">{cat.name}</p>
                    <p className="text-xs opacity-70 mt-1">Verified seller catalog</p>
                  </button>
                ))}
              </div>
            </CardContent>
          )}

          {/* STEP 2: Basic Info */}
          {step === 2 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 2: Basic Product Information</CardTitle>
              <CardDescription>Enter product title, brand, condition, and detailed description.</CardDescription>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Precision Wireless Mechanical Keyboard"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Aurora Tech"
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Product Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    >
                      <option value="New">Brand New (Factory Sealed)</option>
                      <option value="Open-Box">Open-Box (Like New)</option>
                      <option value="Certified Refurbished">Certified Refurbished</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Product Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of features, technical specifications, and included accessories..."
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 3: Images */}
          {step === 3 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 3: Product Imagery</CardTitle>
              <CardDescription>
                Upload high-quality product photos directly from your phone/computer gallery or paste a link.
              </CardDescription>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-lg border border-line bg-navy-50 p-1 w-fit gap-1">
                <button
                  type="button"
                  onClick={() => setUploadMode("gallery")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    uploadMode === "gallery"
                      ? "bg-white text-ink shadow-sm"
                      : "text-navy-500 hover:text-ink"
                  }`}
                >
                  📱 Device / Gallery Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    uploadMode === "url"
                      ? "bg-white text-ink shadow-sm"
                      : "text-navy-500 hover:text-ink"
                  }`}
                >
                  🔗 Image Link URL
                </button>
              </div>

              {imageUploadError && (
                <div className="rounded-card bg-danger/10 border border-danger/20 p-3 text-xs font-medium text-danger">
                  ⚠️ {imageUploadError}
                </div>
              )}

              {uploadMode === "gallery" ? (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase text-navy-600">
                    Upload from Gallery / Files *
                  </label>

                  {imageUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-emerald-300 bg-emerald-50/20 rounded-xl">
                      <div className="w-36 h-36 rounded-lg border border-line overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
                        <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          ✓ Photo Uploaded Successfully
                        </span>
                        <p className="text-xs text-navy-500 break-all max-w-sm">
                          {imageUrl}
                        </p>
                        <div className="pt-1">
                          <label className="inline-flex items-center gap-2 cursor-pointer bg-navy-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-navy-800 transition-colors">
                            <span>🔄 Choose Different Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingImage}
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
                      uploadingImage
                        ? "border-amber-400 bg-amber-50/40 cursor-wait"
                        : "border-navy-200 bg-navy-50/30 hover:border-navy-400 hover:bg-navy-50/60"
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {uploadingImage ? (
                        <div className="text-center space-y-2">
                          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-sm font-bold text-navy-900">Uploading photo to cloud storage...</p>
                          <p className="text-xs text-navy-500">Please wait a moment</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">
                            📷
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink">
                              Click or tap to choose photo from Gallery
                            </p>
                            <p className="text-xs text-navy-500 mt-1">
                              Supports JPG, PNG, WebP up to 5MB
                            </p>
                          </div>
                          <span className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-navy-900 text-amber-400 text-xs font-semibold shadow-sm">
                            Browse Photo Library →
                          </span>
                        </div>
                      )}
                    </label>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                      Primary Image URL *
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                    />
                  </div>

                  {imageUrl && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-navy-600 mb-2">Image Preview:</p>
                      <div className="w-48 h-48 rounded-card border border-line overflow-hidden bg-navy-50 flex items-center justify-center">
                        <img src={imageUrl} alt="Product Preview" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          )}

          {/* STEP 4: Variants & SKU */}
          {step === 4 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 4: Variant Definition & SKU</CardTitle>
              <CardDescription>Assign unique stock keeping unit (SKU) and variant option attributes.</CardDescription>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Unique SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="e.g. NW-KBD-001"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm font-mono text-ink outline-none focus:border-navy-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Color / Variant Name</label>
                  <input
                    type="text"
                    value={colorOption}
                    onChange={(e) => setColorOption(e.target.value)}
                    placeholder="e.g. Matte Black"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 5: Inventory */}
          {step === 5 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 5: Initial Inventory Count</CardTitle>
              <CardDescription>Specify sellable stock units available in warehouse.</CardDescription>

              <div>
                <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Available Units *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inventoryCount}
                  onChange={(e) => setInventoryCount(parseInt(e.target.value) || 0)}
                  className="w-full max-w-xs rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                />
              </div>
            </CardContent>
          )}

          {/* STEP 6: Pricing */}
          {step === 6 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 6: Listing Price & MSRP</CardTitle>
              <CardDescription>Define sale price ($ USD) and optional compare-at MSRP price.</CardDescription>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Sale Price ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={priceDollars}
                    onChange={(e) => setPriceDollars(e.target.value)}
                    placeholder="49.99"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink outline-none focus:border-navy-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Compare-At / MSRP Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.00"
                    value={compareAtDollars}
                    onChange={(e) => setCompareAtDollars(e.target.value)}
                    placeholder="69.99"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-navy-600 outline-none focus:border-navy-400"
                  />
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 7: Shipping */}
          {step === 7 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 7: Shipping Profile</CardTitle>
              <CardDescription>Select carrier profile and logistics handling parameters.</CardDescription>

              <div>
                <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">Fulfillment Standard</label>
                <select
                  value={shippingMode}
                  onChange={(e) => setShippingMode(e.target.value)}
                  className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                >
                  <option value="Merchant Shipping (2-Day Delivery)">Merchant Direct (2-Day Tracked Shipping)</option>
                  <option value="Cartigo Express Logistics">Cartigo Express Logistics Warehouse</option>
                </select>
              </div>
            </CardContent>
          )}

          {/* STEP 8: Returns */}
          {step === 8 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>Step 8: Return Handling Policy</CardTitle>
              <CardDescription>Confirm customer return window acceptance.</CardDescription>

              <div className="rounded-card bg-navy-50 border border-line p-4 text-xs text-navy-600 space-y-2">
                <p className="font-semibold text-navy-900">Cartigo Platform Return Standard:</p>
                <p>Resellers agree to accept customer return requests for undamaged items within 14 days of delivery confirmation.</p>
              </div>
            </CardContent>
          )}

          {/* STEP 9: Preview */}
          {step === 9 && (
            <CardContent className="pt-6 space-y-5">
              <CardTitle>Step 9: Storefront Live Preview</CardTitle>
              <CardDescription>Review how your product card will look once approved by moderators.</CardDescription>

              <div className="max-w-sm mx-auto">
                <Card className="border border-navy-300 shadow-lg">
                  <div className="w-full h-48 rounded-t-card overflow-hidden bg-navy-50">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase bg-navy-50 text-navy-600 px-2 py-0.5 rounded">
                        {categoryName}
                      </span>
                      <StatusBadge status="PENDING_REVIEW" />
                    </div>
                    <CardTitle className="text-base font-bold">{title || "Untitled Product"}</CardTitle>
                    <p className="text-xs text-navy-600">{brand || "Verified Brand"} • {condition}</p>
                  </CardHeader>
                  <CardFooter className="p-4 pt-2 flex items-center justify-between border-t border-line">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-navy-400">SKU: {sku}</span>
                      <p className="text-lg font-bold text-navy-900">${parseFloat(priceDollars || "0").toFixed(2)}</p>
                    </div>
                    <span className="text-xs text-success font-medium">{inventoryCount} Available</span>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          )}

          {/* STEP 10: Visibility & Publish */}
          {step === 10 && (
            <CardContent className="pt-6 space-y-5">
              <CardTitle>Step 10: Product Visibility & Publish Status</CardTitle>
              <CardDescription>
                Choose whether to publish this product immediately Live (ON), keep it Hidden (OFF), or save as a Private Draft.
              </CardDescription>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase text-navy-600">
                  Select Status for this Product *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setProductVisibility("APPROVED")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      productVisibility === "APPROVED"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-line bg-white hover:border-navy-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="font-bold text-sm text-ink">🟢 Live (ON)</span>
                    </div>
                    <p className="text-xs text-navy-600">
                      Product goes Live on Cartigo storefront immediately. Buyers can search and purchase.
                    </p>
                  </div>

                  <div
                    onClick={() => setProductVisibility("UNPUBLISHED")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      productVisibility === "UNPUBLISHED"
                        ? "border-gray-500 bg-gray-50 shadow-sm ring-2 ring-gray-500/20"
                        : "border-line bg-white hover:border-navy-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-3 w-3 rounded-full bg-gray-400" />
                      <span className="font-bold text-sm text-ink">⚪ Hidden (OFF)</span>
                    </div>
                    <p className="text-xs text-navy-600">
                      Saved in your catalog as inactive. Hidden from store search until you toggle it ON.
                    </p>
                  </div>

                  <div
                    onClick={() => setProductVisibility("DRAFT")}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      productVisibility === "DRAFT"
                        ? "border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20"
                        : "border-line bg-white hover:border-navy-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                      <span className="font-bold text-sm text-ink">🔒 Private (Draft)</span>
                    </div>
                    <p className="text-xs text-navy-600">
                      Saved in your private seller catalog. Fully hidden and visible only to you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-card bg-navy-50/60 border border-line p-4 text-xs text-navy-800 space-y-1">
                <p className="font-semibold text-navy-900">💡 Instant Status Control:</p>
                <p>
                  You can change this item anytime between <strong>Live (ON)</strong>, <strong>Hidden (OFF)</strong>, and <strong>Private</strong> directly from your Products dashboard.
                </p>
              </div>
            </CardContent>
          )}

          {/* Footer Controls */}
          <CardFooter className="justify-between border-t border-line pt-4">
            <div className="flex gap-2">
              {step > 1 && (
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                  ← Back
                </Button>
              )}
            </div>

            <div>
              {step < 10 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (step === 2 && (!title || !description)) {
                      setError("Please provide a product title and description.");
                      return;
                    }
                    if (step === 3 && !imageUrl) {
                      setError("Please upload a photo from gallery or provide an image link.");
                      return;
                    }
                    if (step === 4 && !sku) {
                      setError("Please enter a unique SKU code.");
                      return;
                    }
                    setError(null);
                    setStep(step + 1);
                  }}
                >
                  Continue →
                </Button>
              ) : (
                <Button type="submit" variant="primary" loading={loading} className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600 px-6">
                  {productVisibility === "APPROVED"
                    ? "Publish Product Live (ON) →"
                    : productVisibility === "UNPUBLISHED"
                    ? "Save Product as Inactive (OFF) →"
                    : "Save as Private (Draft) →"}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
