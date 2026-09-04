"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/supabase/hooks";
import { submitResellerApplication, saveResellerApplicationDraft } from "@/server/reseller-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const CATEGORY_OPTIONS = [
  "Electronics",
  "Home & Kitchen",
  "Apparel & Accessories",
  "Beauty & Personal Care",
  "Automotive & Tools",
  "Office & Industrial",
];

export default function ResellerApplicationPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [legalName, setLegalName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [country, setCountry] = useState("IN");
  const [businessType, setBusinessType] = useState("LLC");

  const [fulfillmentMode, setFulfillmentMode] = useState<"reseller" | "cartigo">("reseller");
  const [categories, setCategories] = useState<string[]>(["Electronics"]);
  const [monthlyVolumeEst, setMonthlyVolumeEst] = useState<number>(50);
  const [returnPolicyNote, setReturnPolicyNote] = useState("Standard 14-day return acceptance for undamaged items.");

  const [businessDescription, setBusinessDescription] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftSavedMessage, setDraftSavedMessage] = useState<string | null>(null);

  if (sessionStatus === "loading") {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <p className="text-sm font-medium text-navy-600 animate-pulse">Loading session status...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You must be logged in to submit a reseller application for Cartigo marketplace.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button
              variant="primary"
              onClick={() => router.push("/login?callbackUrl=/reseller/apply")}
            >
              Sign In to Continue
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  function handleCategoryToggle(cat: string) {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter((c) => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true);
    setError(null);
    setDraftSavedMessage(null);

    try {
      const res = await saveResellerApplicationDraft({
        legalName,
        contactPerson,
        contactEmail: contactEmail || session?.user?.email || "",
        contactPhone,
        country,
        businessType,
        fulfillmentMode,
        categories,
        monthlyVolumeEst,
        returnPolicyNote,
        businessDescription,
      });

      if (!res.ok) {
        setError(res.error || "Failed to save draft.");
      } else {
        setDraftSavedMessage("Draft application saved successfully!");
        setTimeout(() => setDraftSavedMessage(null), 4000);
      }
    } catch (err: any) {
      console.error("Save draft error:", err);
      setError(err?.message || "An unexpected error occurred while saving draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("You must accept the Cartigo Reseller Agreement terms to submit.");
      return;
    }

    setLoading(true);

    try {
      const res = await submitResellerApplication({
        legalName,
        contactPerson,
        contactEmail: contactEmail || session?.user?.email || "",
        contactPhone,
        country,
        businessType,
        fulfillmentMode,
        categories,
        monthlyVolumeEst,
        returnPolicyNote,
        businessDescription,
        agreedToTerms,
      });

      if (!res.ok) {
        setError(res.error || "Failed to submit application.");
      } else {
        router.push("/reseller/status");
      }
    } catch (err: any) {
      console.error("Submit application error:", err);
      setError(err?.message || "An unexpected error occurred while submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Step Indicator Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-ink">Reseller Partner Application</h1>
        <p className="text-navy-600 text-sm mt-1">Complete the 4-step onboarding form to apply for seller status.</p>

        <div className="mt-6 flex items-center justify-between border-b border-line pb-4">
          {[
            { num: 1, label: "Business Identity" },
            { num: 2, label: "Operations & Catalog" },
            { num: 3, label: "Profile & Verification" },
            { num: 4, label: "Agreement & Submit" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step === s.num
                    ? "bg-navy-900 text-amber-400"
                    : step > s.num
                    ? "bg-success text-white"
                    : "bg-navy-50 text-navy-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span
                className={`hidden sm:inline text-xs font-medium ${
                  step === s.num ? "text-ink font-semibold" : "text-navy-600"
                }`}
              >
                {s.label}
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

      {draftSavedMessage && (
        <div className="mb-6 rounded-card bg-success/10 border border-success/20 p-4 text-xs font-medium text-success">
          ✓ {draftSavedMessage}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Business Identity */}
          {step === 1 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>1. Business Identity</CardTitle>
              <CardDescription>Enter registered business details and primary contact info.</CardDescription>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Legal Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Apex Distribution LLC"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail || session?.user?.email || ""}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="partner@company.com"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-400/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Country / Region *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Business Entity Type *
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  >
                    <option value="LLC">LLC (Limited Liability Co.)</option>
                    <option value="Corporation">Corporation (Inc / Corp)</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 2: Operations & Catalog */}
          {step === 2 && (
            <CardContent className="pt-6 space-y-5">
              <CardTitle>2. Marketplace Operations</CardTitle>
              <CardDescription>Select target product categories and operational preferences.</CardDescription>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-2">
                  Requested Target Categories * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryToggle(cat)}
                        className={`rounded-card border p-3 text-xs font-medium text-left transition-colors ${
                          isSelected
                            ? "bg-navy-900 text-paper border-navy-900"
                            : "bg-white text-navy-600 border-line hover:border-navy-400"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Fulfillment Handling Model *
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center gap-2 rounded-card border border-line p-3 text-xs cursor-pointer hover:bg-navy-50">
                      <input
                        type="radio"
                        name="fulfillment"
                        value="reseller"
                        checked={fulfillmentMode === "reseller"}
                        onChange={() => setFulfillmentMode("reseller")}
                      />
                      <div>
                        <p className="font-semibold text-ink">Merchant Fulfilled</p>
                        <p className="text-navy-600 text-[10px]">Reseller packages & ships</p>
                      </div>
                    </label>
                    <label className="flex-1 flex items-center gap-2 rounded-card border border-line p-3 text-xs cursor-pointer hover:bg-navy-50">
                      <input
                        type="radio"
                        name="fulfillment"
                        value="cartigo"
                        checked={fulfillmentMode === "cartigo"}
                        onChange={() => setFulfillmentMode("cartigo")}
                      />
                      <div>
                        <p className="font-semibold text-ink">Cartigo Express</p>
                        <p className="text-navy-600 text-[10px]">Cartigo warehouse logistics</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                    Est. Monthly Listing Volume (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={monthlyVolumeEst}
                    onChange={(e) => setMonthlyVolumeEst(parseInt(e.target.value) || 0)}
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                  Customer Return Acceptance Commitment
                </label>
                <textarea
                  rows={2}
                  value={returnPolicyNote}
                  onChange={(e) => setReturnPolicyNote(e.target.value)}
                  placeholder="Describe your standard return window and restocking policy..."
                  className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                />
              </div>
            </CardContent>
          )}

          {/* STEP 3: Business Description */}
          {step === 3 && (
            <CardContent className="pt-6 space-y-4">
              <CardTitle>3. Business Profile & Summary</CardTitle>
              <CardDescription>Provide background information on your sourcing and brand history.</CardDescription>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-600 mb-1">
                  Business & Sourcing Overview
                </label>
                <textarea
                  rows={5}
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Tell us about your company, authorized distribution partnerships, brand catalog size, and existing fulfillment capabilities..."
                  className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
                />
              </div>
            </CardContent>
          )}

          {/* STEP 4: Agreements & Submit */}
          {step === 4 && (
            <CardContent className="pt-6 space-y-5">
              <CardTitle>4. Compliance & Policy Agreements</CardTitle>
              <CardDescription>Review required commitments before final application submission.</CardDescription>

              <div className="rounded-card bg-navy-50 border border-line p-4 space-y-3 text-xs text-navy-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">•</span>
                  <p><strong>Authenticity Guarantee:</strong> All items listed must be 100% genuine and authorized. Counterfeit or refurbished items sold as new will cause immediate termination.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">•</span>
                  <p><strong>Moderation Review:</strong> Products submitted by approved resellers require admin approval before becoming visible on the customer storefront.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-navy-900">•</span>
                  <p><strong>Audit Logging:</strong> All status transitions and moderation decisions are logged with immutable audit timestamps.</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-card border border-line cursor-pointer hover:bg-navy-50">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-line text-navy-900 focus:ring-navy-400"
                />
                <span className="text-xs font-medium text-ink">
                  I certify that I am authorized to bind the business legal entity specified, and I agree to Cartigo Marketplace Reseller Terms of Service and Prohibited Product Policy.
                </span>
              </label>
            </CardContent>
          )}

          {error && (
            <div className="mx-6 mb-2 rounded-card bg-danger/10 border border-danger/20 p-3 text-xs font-medium text-danger">
              ⚠️ {error}
            </div>
          )}

          {/* Footer actions */}
          <CardFooter className="justify-between border-t border-line pt-4">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep((step - 1) as 1 | 2 | 3 | 4)}
                >
                  ← Back
                </Button>
              )}
              <Button
                type="button"
                variant="tertiary"
                loading={savingDraft}
                onClick={handleSaveDraft}
                className="text-xs text-navy-600 hover:text-ink"
              >
                Save Draft
              </Button>
            </div>

            <div>
              {step < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (step === 1 && (!legalName || !contactPerson || !contactPhone)) {
                      setError("Please fill out all required business contact fields.");
                      return;
                    }
                    setError(null);
                    setStep((step + 1) as 1 | 2 | 3 | 4);
                  }}
                >
                  Continue →
                </Button>
              ) : (
                <Button type="submit" variant="primary" loading={loading} className="bg-amber-500 text-navy-900 hover:bg-amber-600 font-bold px-6">
                  Submit Reseller Application
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
