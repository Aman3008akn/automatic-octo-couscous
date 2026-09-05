import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getMyResellerStatus } from "@/server/reseller-onboarding";

export default async function ResellerProgramPage() {
  let resellerStatus: Awaited<ReturnType<typeof getMyResellerStatus>> | null = null;
  try {
    resellerStatus = await getMyResellerStatus();
  } catch {
    // not signed in
  }

  const isApproved = resellerStatus?.hasProfile && resellerStatus.status === "APPROVED";
  const isPending = resellerStatus?.hasProfile && resellerStatus.status === "PENDING_REVIEW";

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 text-paper p-8 sm:p-12 shadow-xl mb-16">
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-amber-400/20 px-3 py-1 text-xs font-mono font-semibold text-amber-400 mb-6">
            Cartigo Partner Program
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
            Sell verified products as an Approved Cartigo Reseller.
          </h1>
          <p className="text-lg text-navy-100 mb-8 leading-relaxed">
            Cartigo is an exclusive reseller-only marketplace. Unlike open platforms, every seller is vetted, verified, and backed by Cartigo&apos;s authenticity and fulfillment standard.
          </p>
          <div className="flex flex-wrap gap-4">
            {isApproved ? (
              <Link href="/reseller/dashboard">
                <Button variant="primary" className="bg-amber-400 text-navy-900 hover:bg-amber-500 text-base px-6 py-3 font-semibold">
                  Go to Seller Dashboard →
                </Button>
              </Link>
            ) : isPending ? (
              <Link href="/reseller/status">
                <Button variant="primary" className="bg-amber-400 text-navy-900 hover:bg-amber-500 text-base px-6 py-3 font-semibold">
                  Check Application Status →
                </Button>
              </Link>
            ) : (
              <Link href="/reseller/apply">
                <Button variant="primary" className="bg-amber-400 text-navy-900 hover:bg-amber-500 text-base px-6 py-3 font-semibold">
                  Apply for Reseller Account →
                </Button>
              </Link>
            )}

            {!isApproved && (
              <Link href="/reseller/status">
                <Button variant="tertiary" className="text-white hover:bg-white/10 text-base px-6 py-3 border border-white/20">
                  Check Application Status
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Subtle grid accent background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </section>

      {/* Why Cartigo Section */}
      <section className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-display font-bold text-ink">Why top distributors sell on Cartigo</h2>
          <p className="text-navy-600 mt-2">Built specifically for high-volume verified suppliers, brands, and liquidators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-navy-400 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-card bg-navy-50 text-navy-900 flex items-center justify-center font-bold mb-3">
                01
              </div>
              <CardTitle>Protected Marketplace</CardTitle>
              <CardDescription>
                Zero race to the bottom against unverified counter-fit sellers. Only approved partners can list items.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-navy-400 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-card bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold mb-3">
                02
              </div>
              <CardTitle>Fast Payout Cadence</CardTitle>
              <CardDescription>
                Transparent commission tiers and automated bi-weekly payouts straight to your merchant bank account.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-navy-400 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-card bg-navy-50 text-navy-900 flex items-center justify-center font-bold mb-3">
                03
              </div>
              <CardTitle>Guided 10-Step Submissions</CardTitle>
              <CardDescription>
                Structured listing wizard with automated attribute validation and priority admin moderation queues.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 4-Step Onboarding Process */}
      <section className="mb-16 bg-white rounded-2xl border border-line p-8 sm:p-12">
        <h2 className="text-2xl font-display font-bold text-ink mb-8">Application & Onboarding Workflow</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-paper">1</span>
              <h3 className="font-semibold text-ink">Submit Application</h3>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed pl-11">
              Provide business identity, tax documents, contact details, and target product categories.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-paper">2</span>
              <h3 className="font-semibold text-ink">Admin Moderation</h3>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed pl-11">
              Cartigo compliance officers review your business registration and catalog fit within 24-48 hours.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-paper">3</span>
              <h3 className="font-semibold text-ink">Account Approval</h3>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed pl-11">
              Once approved, your account transitions to APPROVED_RESELLER with full dashboard access.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-navy-900">4</span>
              <h3 className="font-semibold text-ink">List & Sell</h3>
            </div>
            <p className="text-xs text-navy-600 leading-relaxed pl-11">
              Submit product listings for catalog moderation and start receiving customer orders.
            </p>
          </div>
        </div>
      </section>

      {/* Program Policies & Requirements */}
      <section className="mb-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Reseller Qualification Standards</CardTitle>
            <CardDescription>Criteria required for approval on Cartigo marketplace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-navy-600">
            <div className="flex items-start gap-2">
              <span className="text-success font-bold">✓</span>
              <p>Registered legal business entity (LLC, Corporation, Sole Proprietorship with Tax ID).</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-success font-bold">✓</span>
              <p>Proof of authorized distribution or verified product sourcing invoice.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-success font-bold">✓</span>
              <p>Ability to process and ship customer orders within 48 hours.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-success font-bold">✓</span>
              <p>Agreement to Cartigo&apos;s mandatory 14-day customer return policy.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prohibited Product Policy</CardTitle>
            <CardDescription>Items that cannot be sold under any circumstances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-navy-600">
            <div className="flex items-start gap-2">
              <span className="text-danger font-bold">✕</span>
              <p>Counterfeit goods, replicas, or unlicensed trademark infringements.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-danger font-bold">✕</span>
              <p>Hazardous materials, restricted chemicals, or prescription items.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-danger font-bold">✕</span>
              <p>Stolen inventory, unverified grey-market imports, or recalled products.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-danger font-bold">✕</span>
              <p>Used merchandise represented as &quot;Brand New&quot; condition.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Call to Action Footer */}
      <section className="text-center py-8">
        <h3 className="text-2xl font-display font-bold text-ink mb-4">
          {isApproved ? "Manage your seller catalog" : "Ready to expand your distribution?"}
        </h3>
        {isApproved ? (
          <Link href="/reseller/dashboard">
            <Button variant="primary" className="py-3 px-8 text-base bg-amber-500 text-navy-900 font-bold hover:bg-amber-600">
              Open Seller Dashboard →
            </Button>
          </Link>
        ) : (
          <Link href="/reseller/apply">
            <Button variant="primary" className="py-3 px-8 text-base">
              Start Reseller Application Now
            </Button>
          </Link>
        )}
      </section>
    </main>
  );
}
