import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getSumitGautamActivityLogs } from "@/server/admin-audit";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let pendingCount = 0;
  let approvedCount = 0;
  let recentLogs: any[] = [];
  let sumitActivity: Awaited<ReturnType<typeof getSumitGautamActivityLogs>> = {
    user: null,
    logs: [],
    totalActions: 0,
    lastActive: null,
  };

  try {
    sumitActivity = await getSumitGautamActivityLogs();

    pendingCount = await prisma.resellerApplication.count({
      where: { status: "PENDING_REVIEW" },
    });

    approvedCount = await prisma.resellerProfile.count({
      where: { status: "APPROVED" },
    });

    recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error("Database connection error in AdminDashboardPage:", error);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
            Cartigo Control Tower
          </span>
          <h1 className="text-3xl font-display font-bold text-ink">Executive Admin Console</h1>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/resellers">
            <Button variant="primary" className="bg-navy-900 text-paper font-semibold hover:bg-navy-600">
              Review Applications ({pendingCount}) →
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className={pendingCount > 0 ? "border-amber-400/60 bg-amber-50/20" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              Pending Applications
            </CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-amber-600">
              {pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            {pendingCount > 0 ? "⚠️ Requires admin decision" : "✓ Application queue clear"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              Approved Resellers
            </CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-success">
              {approvedCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            Active verified partners
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              Pending Product Reviews
            </CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">
              0
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-400">
            Slice 2 moderation queue
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">
              System Audit Events
            </CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">
              {recentLogs.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            Logged with request IDs
          </CardContent>
        </Card>
      </div>

      {/* Main Administrative Action Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <Link href="/admin/banners">
              <Card className="hover:border-navy-400 transition-all cursor-pointer h-full bg-amber-50/20">
                <CardHeader>
                  <div className="w-10 h-10 rounded-card bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold mb-2">
                    🖼️
                  </div>
                  <CardTitle className="text-lg">Banners & Promotions</CardTitle>
                  <CardDescription className="text-xs">
                    Manage storefront banners, hero carousel, and active promos.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/resellers">
              <Card className="hover:border-navy-400 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-10 h-10 rounded-card bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold mb-2">
                    📋
                  </div>
                  <CardTitle className="text-lg">Reseller Applications</CardTitle>
                  <CardDescription className="text-xs">
                    Review and verify seller onboarding applications.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/catalog">
              <Card className="hover:border-navy-400 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-10 h-10 rounded-card bg-success/20 text-success flex items-center justify-center font-bold mb-2">
                    🛍️
                  </div>
                  <CardTitle className="text-lg">Catalog Management</CardTitle>
                  <CardDescription className="text-xs">
                    Add new first-party products, manage inventory and discounts.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/products">
              <Card className="hover:border-navy-400 transition-all cursor-pointer h-full bg-navy-50/40">
                <CardHeader>
                  <div className="w-10 h-10 rounded-card bg-navy-100 text-navy-600 flex items-center justify-center font-bold mb-2">
                    🛡️
                  </div>
                  <CardTitle className="text-lg">Moderation Queue</CardTitle>
                  <CardDescription className="text-xs">
                    Review listing submissions from resellers before publication.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="hover:border-navy-400 transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-10 h-10 rounded-card bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold mb-2">
                    📦
                  </div>
                  <CardTitle className="text-lg">Order Management</CardTitle>
                  <CardDescription className="text-xs">
                    View all orders, update fulfillment and payment statuses.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Recent Audit Logs Table */}
          <Card>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle>Recent Administrative Audit Logs</CardTitle>
              <CardDescription>Immutable record of status transitions and moderation decisions</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-navy-400 py-4 text-center">No audit logs recorded yet.</p>
              ) : (
                <div className="divide-y divide-line">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-ink">{log.action}</p>
                        <p className="text-navy-600 font-mono text-[10px]">
                          Entity: {log.entityType} ({log.entityId.slice(0, 12)}...)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-navy-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Platform Operational Status & Surveillance */}
        <div className="space-y-6">
          {/* Executive Admin Activity Surveillance Card (Aman Shukla Exclusive Control) */}
          <Card className="border-amber-400/80 bg-amber-50/20 shadow-md">
            <CardHeader className="pb-3 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded">
                  Executive Surveillance Mode
                </span>
                <span className="h-2 w-2 rounded-full bg-success animate-ping"></span>
              </div>
              <CardTitle className="text-base font-bold text-ink mt-1">
                🕵️ Sumit Gautam Activity Tracker
              </CardTitle>
              <CardDescription className="text-xs text-navy-600">
                Special audit feed for Aman Shukla to monitor Sumit Gautam's admin dashboard actions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="text-navy-600 font-medium">Monitored Admin:</span>
                <span className="font-bold text-ink">Sumit Gautam</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="text-navy-600 font-medium">Admin Email:</span>
                <span className="font-mono text-[11px] text-navy-900 font-semibold">sumitgautam@cartigo.admin</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="text-navy-600 font-medium">Role Level:</span>
                <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded text-[10px]">SUPER_ADMIN</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="text-navy-600 font-medium">Total Actions Tracked:</span>
                <span className="font-mono font-bold text-navy-900 text-sm">{sumitActivity.totalActions}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-line">
                <span className="text-navy-600 font-medium">Latest Activity:</span>
                <span className="font-mono text-[11px] text-navy-600">
                  {sumitActivity.lastActive ? new Date(sumitActivity.lastActive).toLocaleTimeString() : "No recent actions"}
                </span>
              </div>

              {/* Recent Activity Mini Feed */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-navy-900 mb-1.5 uppercase tracking-wider">Live Action Stream</p>
                {sumitActivity.logs.length === 0 ? (
                  <p className="text-[11px] text-navy-400 italic bg-white p-2 rounded border border-line text-center">
                    Sumit Gautam hasn't performed any admin actions yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {sumitActivity.logs.map((log: any) => (
                      <div key={log.id} className="bg-white p-2 rounded border border-line text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-ink">
                          <span className="text-amber-700 font-mono text-[10px]">{log.action}</span>
                          <span className="font-mono text-[9px] text-navy-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-navy-600 text-[10px]">Entity: {log.entityType} ({log.entityId.slice(0, 10)})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/admin/audit?actor=sumitgautam@cartigo.admin"
                className="block text-center w-full rounded-card bg-navy-900 py-1.5 text-xs font-bold text-amber-400 hover:bg-navy-600 transition-colors shadow-sm mt-2"
              >
                View Full Audit Logs for Sumit Gautam →
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-navy-900 text-paper">
            <CardHeader>
              <CardTitle className="text-white text-lg">Server Authorization Guard</CardTitle>
              <CardDescription className="text-navy-100 text-xs">
                Every server action re-enforces role security via <code>src/lib/authz.ts</code>. Client-side UI controls are never trusted as the sole guard.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Super Admin Controls</CardTitle>
              <CardDescription>System bootstrap and role hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-navy-600">
              <div className="flex justify-between py-1 border-b border-line">
                <span>Super Admins:</span>
                <span className="font-semibold text-ink">Aman Shukla, Sumit Gautam</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Aman Shukla Privilege:</span>
                <span className="font-semibold text-amber-600">Full Access + Audit Monitor</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Sumit Gautam Privilege:</span>
                <span className="font-semibold text-success">Full Access</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
