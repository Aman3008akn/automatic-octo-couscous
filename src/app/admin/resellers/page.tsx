"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAdminResellerApplications } from "@/server/admin-resellers";
import { decideResellerApplication } from "@/server/reseller-applications";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { ResellerStatus } from "@prisma/client";

type ApplicationItem = Awaited<ReturnType<typeof getAdminResellerApplications>>[number];

export default function AdminResellersQueuePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<ResellerStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  // Decision Modal Form State
  const [internalNotes, setInternalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  function loadQueue() {
    setLoading(true);
    getAdminResellerApplications(statusFilter, searchQuery)
      .then((res) => {
        const data = res || [];
        setApplications(data);
        if (selectedApp) {
          const updated = data.find((a) => a?.id === selectedApp.id);
          if (updated) setSelectedApp(updated);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadQueue();
  }, [statusFilter, searchQuery]);

  function handleOpenDrawer(app: ApplicationItem) {
    setSelectedApp(app);
    setInternalNotes(app.internalNotes ?? "");
    setRejectionReason(app.rejectionReason ?? "");
    setDecisionError(null);
  }

  async function handleDecision(decision: "APPROVED" | "REJECTED" | "INFO_REQUESTED") {
    if (!selectedApp) return;

    if (decision === "REJECTED" && !rejectionReason.trim()) {
      setDecisionError("Please provide a decision reason for rejecting the application.");
      return;
    }

    setDecisionLoading(true);
    setDecisionError(null);

    const res = await decideResellerApplication({
      applicationId: selectedApp.id,
      decision,
      reason: rejectionReason || undefined,
      internalNotes: internalNotes || undefined,
    });

    setDecisionLoading(false);

    if (!res.ok) {
      setDecisionError(res.error);
    } else {
      setSelectedApp(null);
      loadQueue();
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">Admin Moderation Queue</span>
          <h1 className="text-3xl font-display font-bold text-ink">Reseller Applications</h1>
        </div>

        {/* Search input */}
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search legal name, email, ID..."
            className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-navy-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {(["ALL", "PENDING_REVIEW", "INFO_REQUESTED", "APPROVED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === tab
                ? "bg-navy-900 text-paper font-semibold shadow-sm"
                : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            {tab === "ALL" ? "All Applications" : tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className={selectedApp ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader className="border-b border-line pb-3">
              <CardTitle className="text-lg">Applications ({applications?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading reseller applications...</p>
              ) : !applications || applications.length === 0 ? (
                <div className="p-12 text-center text-navy-600">
                  <p className="text-sm font-semibold">No applications found in this queue.</p>
                  <p className="text-xs text-navy-400 mt-1">Try clearing your search query or status filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {applications.map((app) => (
                    <div
                      key={app?.id}
                      onClick={() => handleOpenDrawer(app)}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-navy-50/50 cursor-pointer transition-colors ${
                        selectedApp?.id === app.id ? "bg-navy-50 border-l-4 border-navy-900" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink text-sm">{app.profile.legalName}</p>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-xs text-navy-600">
                          Contact: {app.profile.contactPerson} ({app.profile.contactEmail})
                        </p>
                        <p className="text-[11px] text-navy-400 font-mono">
                          Categories: {app.categories.join(", ") || "General"} • {app.profile.businessType} ({app.profile.country})
                        </p>
                      </div>

                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        <span className="text-[11px] font-mono text-navy-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="secondary" className="text-xs py-1 px-3">
                          Review →
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Application Detail Drawer / Panel */}
        {selectedApp && (
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-navy-300 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-line pb-3">
                <div>
                  <CardTitle className="text-base font-bold">{selectedApp.profile.legalName}</CardTitle>
                  <CardDescription className="text-xs font-mono">ID: {selectedApp.id.slice(0, 14)}...</CardDescription>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-full p-1 text-navy-400 hover:text-ink hover:bg-navy-100"
                >
                  ✕
                </button>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-600">Application Status:</span>
                  <StatusBadge status={selectedApp.status} />
                </div>

                {decisionError && (
                  <div className="rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
                    ⚠️ {decisionError}
                  </div>
                )}

                {/* Business Information Summary */}
                <div className="rounded-card bg-navy-50/60 p-3 text-xs space-y-2 border border-line">
                  <p className="font-semibold text-navy-900 border-b border-line pb-1">Business Identity</p>
                  <p><span className="text-navy-600">Contact:</span> {selectedApp.profile.contactPerson}</p>
                  <p><span className="text-navy-600">Email:</span> {selectedApp.profile.contactEmail}</p>
                  <p><span className="text-navy-600">Phone:</span> {selectedApp.profile.contactPhone}</p>
                  <p><span className="text-navy-600">Entity / Country:</span> {selectedApp.profile.businessType} ({selectedApp.profile.country})</p>
                  <p><span className="text-navy-600">Fulfillment:</span> {selectedApp.profile.fulfillmentMode}</p>
                </div>

                {/* Categories & Description */}
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-navy-900">Target Categories:</p>
                  <p className="text-navy-600 font-medium">{selectedApp.categories.join(", ") || "None"}</p>
                </div>

                {selectedApp.businessDescription && (
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-navy-900">Business Description:</p>
                    <p className="text-navy-600 bg-white p-2 rounded border border-line text-[11px]">{selectedApp.businessDescription}</p>
                  </div>
                )}

                {/* Admin Internal Notes Editor (STRICTLY HIDDEN FROM RESELLER STATUS) */}
                <div className="pt-2 border-t border-line space-y-1">
                  <label className="block text-xs font-semibold text-navy-900">
                    Internal Admin Notes <span className="text-[10px] text-amber-600 font-normal">(Private to Cartigo admins)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Enter private review notes, document verification checks..."
                    className="w-full rounded-card border border-line bg-white p-2 text-xs text-ink outline-none focus:border-navy-400"
                  />
                </div>

                {/* Decision Reason Input for Rejection / Info Request */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-navy-900">
                    Decision Reason / Info Request Prompt <span className="text-[10px] text-navy-600 font-normal">(User-Visible if rejected/info requested)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason shown to reseller if rejecting or requesting information..."
                    className="w-full rounded-card border border-line bg-white p-2 text-xs text-ink outline-none focus:border-navy-400"
                  />
                </div>

                {/* Status Decision Buttons */}
                <div className="pt-3 border-t border-line space-y-2">
                  <Button
                    variant="primary"
                    loading={decisionLoading}
                    onClick={() => handleDecision("APPROVED")}
                    className="w-full bg-success text-white hover:bg-success/90 font-bold text-xs py-2"
                  >
                    ✓ Approve Reseller Account
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      loading={decisionLoading}
                      onClick={() => handleDecision("INFO_REQUESTED")}
                      className="text-xs bg-amber-400/20 text-amber-700 hover:bg-amber-400/30"
                    >
                      Request Info
                    </Button>

                    <Button
                      variant="destructive"
                      loading={decisionLoading}
                      onClick={() => handleDecision("REJECTED")}
                      className="text-xs"
                    >
                      ✕ Reject
                    </Button>
                  </div>
                </div>

                {/* Status History Audit Trail */}
                {selectedApp.profile.statusLog.length > 0 && (
                  <div className="pt-3 border-t border-line">
                    <p className="text-[11px] font-semibold text-navy-900 mb-2">Status Audit History</p>
                    <div className="space-y-1.5 text-[10px]">
                      {selectedApp.profile.statusLog.map((log) => (
                        <div key={log.id} className="flex items-center justify-between text-navy-600 bg-navy-50/50 p-1.5 rounded">
                          <span>{log.fromStatus ?? "NONE"} → <strong>{log.toStatus}</strong></span>
                          <span className="font-mono text-navy-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
