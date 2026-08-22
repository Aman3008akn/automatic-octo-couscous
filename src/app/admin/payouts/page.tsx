"use client";

import { useEffect, useState } from "react";
import { getAdminPayoutQueue, processAdminPayout } from "@/server/payouts";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type PayoutItem = Awaited<ReturnType<typeof getAdminPayoutQueue>>[number];

export default function AdminPayoutsQueuePage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [procLoading, setProcLoading] = useState<string | null>(null);

  function loadQueue() {
    setLoading(true);
    getAdminPayoutQueue()
      .then((res) => setPayouts(res))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadQueue();
  }, []);

  async function handleApprove(id: string) {
    setProcLoading(id);
    await processAdminPayout(id);
    setProcLoading(null);
    loadQueue();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Finance Control Tower
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">Reseller Payout Disbursements</h1>
      </div>

      <Card>
        <CardHeader className="border-b border-line pb-3">
          <CardTitle className="text-lg">Pending Disbursement Requests ({payouts.length})</CardTitle>
          <CardDescription>Finance authorization queue for partner bank transfers</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-center text-xs text-navy-600 animate-pulse">Loading payout requests...</p>
          ) : payouts.length === 0 ? (
            <div className="p-12 text-center text-navy-600">
              <p className="text-base font-semibold text-ink">No pending payout requests.</p>
              <p className="text-xs text-navy-400 mt-1">Reseller disbursement requests will populate here.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {payouts.map((po) => (
                <div key={po.id} className="p-4 flex items-center justify-between text-xs hover:bg-navy-50/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-ink font-mono">{po.reference}</p>
                      <StatusBadge status={po.status} />
                    </div>
                    <p className="text-xs text-navy-600 mt-0.5">Reseller: <span className="font-semibold text-ink">{po.actorName}</span></p>
                    <p className="text-[11px] text-navy-400 font-mono">
                      Requested: {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-navy-900">
                      ${(po.amountCents / 100).toFixed(2)} USD
                    </span>
                    {po.status !== "PROCESSED" ? (
                      <Button
                        variant="primary"
                        loading={procLoading === po.id}
                        onClick={() => handleApprove(po.id)}
                        className="bg-success text-white font-bold hover:bg-success/90 text-xs py-1.5 px-4"
                      >
                        ✓ Approve Payout
                      </Button>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-success bg-success/15 px-3 py-1 rounded-full">
                        ✓ Processed
                      </span>
                    )}
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
