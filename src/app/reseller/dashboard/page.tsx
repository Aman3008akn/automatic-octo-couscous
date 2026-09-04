"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/supabase/hooks";
import { getResellerDashboardData } from "@/server/reseller-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

type DashboardData = Awaited<ReturnType<typeof getResellerDashboardData>>;

export default function ResellerDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (session) {
      getResellerDashboardData()
        .then((res) => setDashboard(res))
        .catch((err) => {
          console.error("Failed to load seller dashboard:", err);
        })
        .finally(() => setLoading(false));
    } else if (sessionStatus !== "loading") {
      setLoading(false);
    }
  }, [session, sessionStatus]);

  if (sessionStatus === "loading" || loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
          <p className="text-sm font-medium text-navy-600">Verifying seller access...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Sign in to access your Cartigo seller dashboard.</CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <Link href="/login?callbackUrl=/reseller/dashboard">
              <Button variant="primary">Sign In →</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  if (!dashboard?.isAuthorized) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Your seller account must be approved before accessing the seller dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusBadge status={dashboard?.status ?? "RESELLER_APPLICANT"} />
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/reseller/status">
              <Button variant="primary">Check Application Status →</Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  const { legalName, fulfillmentMode, activeProductsCount, pendingProductsCount, ordersCount, products } = dashboard;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-ink">Seller Operations Dashboard</h1>
            <StatusBadge status="APPROVED" />
          </div>
          <p className="text-navy-600 text-sm mt-1">
            Welcome back, <span className="font-semibold text-ink">{legalName}</span> ({session?.user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reseller/products/new">
            <Button variant="primary" className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
              + Submit New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Active Products</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">{activeProductsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-success font-medium">
            {activeProductsCount > 0 ? `✓ ${activeProductsCount} products live on storefront` : "No products currently live"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Pending Moderation</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-amber-600">{pendingProductsCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-400">
            {pendingProductsCount > 0 ? "Under compliance review" : "No submissions in queue"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Orders Received</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">{ordersCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            {ordersCount > 0 ? "Customer orders placed" : "Awaiting first order"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Platform Fee</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-success">0%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            Zero hidden marketplace fees
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Product & Inventory Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-line pb-4">
              <div>
                <CardTitle>Catalog Listings & Stock</CardTitle>
                <CardDescription>Products managed by your partner account</CardDescription>
              </div>
              <Link href="/reseller/products" className="text-xs font-bold text-navy-900 hover:text-amber-600">
                View All ({activeProductsCount + pendingProductsCount}) →
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {products.length === 0 ? (
                <div className="p-8 text-center text-navy-500 space-y-2">
                  <p className="text-sm font-semibold text-navy-800">No products submitted yet.</p>
                  <p className="text-xs text-navy-500">
                    Your seller account is approved. Start adding products to showcase them on Cartigo.
                  </p>
                  <Link href="/reseller/products/new">
                    <Button variant="primary" className="mt-2 text-xs">
                      + Add Your First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {products.map((prod) => (
                    <div key={prod.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-navy-50 border border-line flex items-center justify-center font-bold text-navy-900 text-xs">
                          SKU
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">{prod.title}</p>
                          <p className="text-xs text-navy-600 font-mono">
                            {prod.sku} • ₹{(prod.priceCents / 100).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <StatusBadge status={prod.status} />
                        <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-mono font-medium text-navy-900">
                          {prod.availableStock} in stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/reseller/products/new">
              <Card className="hover:border-navy-400 transition-colors cursor-pointer h-full">
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-semibold">New Listing</CardTitle>
                  <CardDescription className="text-xs">Submit product for catalog moderation.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/reseller/orders">
              <Card className="hover:border-navy-400 transition-colors cursor-pointer h-full">
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-semibold">Order Fulfillment</CardTitle>
                  <CardDescription className="text-xs">View unfulfilled orders and update tracking.</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/reseller/payouts">
              <Card className="hover:border-navy-400 transition-colors cursor-pointer h-full">
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-semibold">Payout History</CardTitle>
                  <CardDescription className="text-xs">Inspect bi-weekly bank disbursement statements.</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Col: System Announcements & Account Health */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seller Account Status</CardTitle>
              <CardDescription>Partner verification details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-navy-600">
              <div className="flex justify-between py-1 border-b border-line">
                <span>Partner Name:</span>
                <span className="font-semibold text-ink">{legalName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Fulfillment Mode:</span>
                <span className="font-semibold text-ink capitalize">{fulfillmentMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Authenticity Score:</span>
                <span className="font-semibold text-success">100% (Verified)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Verification Status:</span>
                <span className="font-semibold text-success">APPROVED</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 text-paper">
            <CardHeader>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Partner Operations</span>
              <CardTitle className="text-white text-lg">Account Active & Verified</CardTitle>
              <CardDescription className="text-navy-100 text-xs">
                Your seller application has been approved by Cartigo compliance. You have full privileges to submit listings and process marketplace orders.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
