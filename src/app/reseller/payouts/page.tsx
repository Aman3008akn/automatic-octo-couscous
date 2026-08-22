"use client";

import { useEffect, useState } from "react";
import { getResellerPayoutOverview, requestResellerPayout } from "@/server/payouts";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

type PayoutData = Awaited<ReturnType<typeof getResellerPayoutOverview>>;

export default function ResellerPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PayoutData | null>(null);

  const [requestAmount, setRequestAmount] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function loadOverview() {
    setLoading(true);
    getResellerPayoutOverview()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOverview();
  }, []);

  async function handleDisbursementRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cents = Math.round((parseFloat(requestAmount) || 0) * 100);
    if (cents <= 0) {
      setError("Please enter a valid disbursement amount.");
      return;
    }

    setReqLoading(true);
    const res = await requestResellerPayout(cents);
    setReqLoading(false);

    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccessMsg("Disbursement request submitted to Cartigo Finance!");
      setRequestAmount("");
      loadOverview();
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center p-6">
        <p className="text-sm font-medium text-navy-600 animate-pulse">Loading wallet & payout statement...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Reseller Financial Operations
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">Partner Wallet & Payout Statements</h1>
      </div>

      {/* Financial Overview KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Gross Marketplace Sales</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-ink">
              ${((data?.grossSalesCents ?? 0) / 100).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">Total customer orders gross value</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Platform Commission (15%)</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-navy-600">
              -${((data?.platformFeeCents ?? 0) / 100).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-400">Cartigo operational tier fee</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Net Earnings</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-success">
              ${((data?.netEarningsCents ?? 0) / 100).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">Net revenue after fee deduction</CardContent>
        </Card>

        <Card className="border-amber-400 bg-amber-50/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-amber-700">Available for Payout</CardDescription>
            <CardTitle className="text-3xl font-display font-bold text-navy-900">
              ${((data?.availableCents ?? 0) / 100).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">Cleared balance eligible for transfer</CardContent>
        </Card>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Payout Request & Transaction History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Payout Form */}
          <Card>
            <CardHeader className="border-b border-line pb-3">
              <CardTitle className="text-lg">Request Fund Disbursement</CardTitle>
              <CardDescription>Request bi-weekly automated bank payout transfer</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {error && (
                <div className="mb-4 rounded-card bg-danger/10 border border-danger/20 p-3 text-xs text-danger font-medium">
                  ⚠️ {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 rounded-card bg-success/10 border border-success/20 p-3 text-xs text-success font-medium">
                  ✓ {successMsg}
                </div>
              )}

              <form onSubmit={handleDisbursementRequest} className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold uppercase text-navy-600 mb-1">
                    Disbursement Amount ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={(data?.availableCents ?? 0) / 100}
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder={`Max: $${((data?.availableCents ?? 0) / 100).toFixed(2)}`}
                    className="w-full rounded-card border border-line bg-white px-3.5 py-2 text-sm font-bold text-ink outline-none focus:border-navy-400"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={reqLoading}
                  className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600 px-6 py-2"
                >
                  Request Payout →
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payout History Table */}
          <Card>
            <CardHeader className="border-b border-line pb-3">
              <CardTitle className="text-lg">Disbursement History</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {data?.payouts.length === 0 ? (
                <p className="p-8 text-center text-xs text-navy-400">No disbursement requests submitted yet.</p>
              ) : (
                <div className="divide-y divide-line">
                  {data?.payouts.map((po) => (
                    <div key={po.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-ink font-mono">{po.reference}</p>
                          <StatusBadge status={po.status} />
                        </div>
                        <p className="text-[11px] text-navy-400 font-mono mt-0.5">
                          Requested on {new Date(po.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right font-bold text-navy-900 text-base">
                        ${(po.amountCents / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Banking & Ledger Notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Bank Profile</CardTitle>
              <CardDescription>Verified disbursement method</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-xs text-navy-600">
              <div className="flex justify-between py-1 border-b border-line">
                <span>Payout Method:</span>
                <span className="font-semibold text-ink">ACH Direct Deposit</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Account Status:</span>
                <span className="font-semibold text-success">Verified</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line">
                <span>Platform Commission Tier:</span>
                <span className="font-semibold text-ink">Standard 15%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
