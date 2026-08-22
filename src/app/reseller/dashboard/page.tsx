"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ResellerDashboardPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;

  if (role !== "APPROVED_RESELLER" && role !== "SUPER_ADMIN" && role !== "ADMIN") {
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
            <StatusBadge status={role ?? "RESELLER_APPLICANT"} />
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
            Welcome back, <span className="font-semibold text-ink">{session?.user?.name || "Northwind Supply Co."}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
            + Submit New Product (Slice 2)
          </Button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Active Products</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">1</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-success font-medium">
            ✓ Aurora Smart Kettle (Demo)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Pending Moderation</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-amber-600">0</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-400">
            No submissions in queue
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Sales (Gross)</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">$2,499.50</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            50 units delivered
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Estimated Net Earnings</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-success">$2,124.575</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            15% platform fee deducted
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
                <CardDescription>Products approved and published on storefront</CardDescription>
              </div>
              <span className="text-xs font-mono text-navy-400">1 active listing</span>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-line">
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-card bg-navy-50 border border-line flex items-center justify-center font-bold text-navy-900 text-xs">
                      SKU
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Aurora Smart Kettle (demo product)</p>
                      <p className="text-xs text-navy-600 font-mono">DEMO-KETTLE-001 • $49.99</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                      25 In Stock
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="hover:border-navy-400 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Bulk Inventory CSV</CardTitle>
                <CardDescription className="text-xs">Update stock counts via spreadsheet import.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-navy-400 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Order Fulfillment</CardTitle>
                <CardDescription className="text-xs">View unfulfilled orders and update tracking.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-navy-400 transition-colors cursor-pointer">
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold">Payout History</CardTitle>
                <CardDescription className="text-xs">Inspect bi-weekly bank disbursement statements.</CardDescription>
              </CardHeader>
            </Card>
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
                <span className="font-semibold text-ink">Northwind Supply Co.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Fulfillment Mode:</span>
                <span className="font-semibold text-ink">Merchant Fulfilled</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Authenticity Score:</span>
                <span className="font-semibold text-success">100% (Verified)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 text-paper">
            <CardHeader>
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Platform Note</span>
              <CardTitle className="text-white text-lg">Slice 1 Foundation Ready</CardTitle>
              <CardDescription className="text-navy-100 text-xs">
                Your seller application has been verified by Cartigo compliance. Product listing wizard (10-step submission flow) will activate in Slice 2.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
