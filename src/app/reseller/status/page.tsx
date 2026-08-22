"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getMyResellerStatus } from "@/server/reseller-onboarding";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function ResellerStatusPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof getMyResellerStatus>> | null>(null);

  useEffect(() => {
    if (session) {
      getMyResellerStatus()
        .then((res) => setData(res))
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
          <p className="text-sm font-medium text-navy-600">Fetching application status...</p>
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
            <CardDescription>Sign in to check your Cartigo reseller application status.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login?callbackUrl=/reseller/status">
              <Button variant="primary">Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!data?.hasProfile) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display">No Reseller Application Found</CardTitle>
            <CardDescription>
              You haven&apos;t submitted a reseller onboarding application yet. Join Cartigo&apos;s verified seller program today.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-4">
            <Link href="/reseller/apply">
              <Button variant="primary" className="bg-amber-500 text-navy-900 hover:bg-amber-600 font-bold px-6 py-2.5">
                Apply as Reseller Now →
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const { status, legalName, contactPerson, contactEmail, categories, submittedAt, decidedAt, rejectionReason } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono font-medium tracking-widest text-navy-400 uppercase">Cartigo Onboarding</p>
          <h1 className="text-3xl font-display font-bold text-ink">Reseller Application Status</h1>
        </div>
        <div>
          <StatusBadge status={status ?? "DRAFT"} />
        </div>
      </div>

      {/* DRAFT STATE */}
      {status === "DRAFT" && (
        <Card className="border-navy-200">
          <CardHeader>
            <CardTitle>Application Draft in Progress</CardTitle>
            <CardDescription>
              You have a saved draft application for <strong>{legalName}</strong>. Complete the application steps to submit for review.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/reseller/apply">
              <Button variant="primary">Continue Application →</Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* PENDING_REVIEW STATE */}
      {status === "PENDING_REVIEW" && (
        <Card className="border-amber-400/40 bg-amber-50/20">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              Under Compliance Review
            </div>
            <CardTitle className="text-2xl font-display">Application Under Review</CardTitle>
            <CardDescription>
              Your application for <strong>{legalName}</strong> was received on{" "}
              {submittedAt ? new Date(submittedAt).toLocaleDateString() : "recently"}. Our compliance officers verify business registrations within 24–48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs text-navy-600">
            <div className="rounded-card bg-white border border-line p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-navy-400 uppercase tracking-wider text-[10px]">Contact Person</p>
                <p className="font-medium text-ink mt-0.5">{contactPerson}</p>
              </div>
              <div>
                <p className="font-semibold text-navy-400 uppercase tracking-wider text-[10px]">Contact Email</p>
                <p className="font-medium text-ink mt-0.5">{contactEmail}</p>
              </div>
              <div>
                <p className="font-semibold text-navy-400 uppercase tracking-wider text-[10px]">Categories</p>
                <p className="font-medium text-ink mt-0.5">{categories.join(", ") || "General"}</p>
              </div>
              <div>
                <p className="font-semibold text-navy-400 uppercase tracking-wider text-[10px]">Fulfillment Mode</p>
                <p className="font-medium text-ink mt-0.5 capitalize">{data.fulfillmentMode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* INFO_REQUESTED STATE */}
      {status === "INFO_REQUESTED" && (
        <Card className="border-amber-500 bg-white shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm mb-1">
              ⚠️ Additional Action Required
            </div>
            <CardTitle className="text-2xl font-display">Additional Information Requested</CardTitle>
            <CardDescription>
              Our moderation team reviewed your application for <strong>{legalName}</strong> and requires additional clarification before finalizing approval.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Link href="/reseller/apply">
              <Button variant="primary" className="bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
                Update & Resubmit Application →
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* APPROVED STATE */}
      {status === "APPROVED" && (
        <Card className="border-success/40 bg-success/5 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-success font-semibold text-sm mb-1">
              🎉 Congratulations! Account Verified
            </div>
            <CardTitle className="text-2xl font-display text-ink">Reseller Account Approved</CardTitle>
            <CardDescription>
              Your partner account for <strong>{legalName}</strong> was approved on{" "}
              {decidedAt ? new Date(decidedAt).toLocaleDateString() : "recently"}. You now have full access to submit listings and manage orders.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <Link href="/reseller/dashboard">
              <Button variant="primary" className="bg-navy-900 text-paper font-semibold hover:bg-navy-600 px-6 py-2.5">
                Go to Seller Dashboard →
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* REJECTED STATE */}
      {status === "REJECTED" && (
        <Card className="border-danger/30 bg-danger/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-danger font-semibold text-sm mb-1">
              ✕ Application Decision
            </div>
            <CardTitle className="text-2xl font-display text-ink">Application Not Approved</CardTitle>
            <CardDescription>
              We regret to inform you that your reseller application for <strong>{legalName}</strong> could not be approved at this time.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {/* STRICT PRIVACY RULE ENFORCED: Show ONLY rejectionReason if provided, NEVER internalNotes! */}
            {rejectionReason ? (
              <div className="rounded-card bg-white border border-danger/20 p-4">
                <p className="text-xs font-semibold text-danger uppercase tracking-wider mb-1">Decision Reason</p>
                <p className="text-sm text-navy-900">{rejectionReason}</p>
              </div>
            ) : (
              <p className="text-xs text-navy-600">
                Your application did not meet Cartigo qualification criteria for authorized distribution.
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-4 border-t border-line">
            <Link href="/reseller/apply">
              <Button variant="secondary" className="text-xs">
                Submit New Application
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* SUSPENDED STATE */}
      {status === "SUSPENDED" && (
        <Card className="border-danger/50 bg-white">
          <CardHeader>
            <div className="flex items-center gap-2 text-danger font-semibold text-sm mb-1">
              ⛔ Account Suspended
            </div>
            <CardTitle className="text-2xl font-display text-ink">Reseller Account Suspended</CardTitle>
            <CardDescription>
              Your partner account for <strong>{legalName}</strong> has been suspended due to compliance or operational policy review.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-navy-600">
            If you believe this suspension is in error, please contact Cartigo Merchant Support with your seller ID.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
