import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center text-center px-4 py-12">
      <div className="rounded-2xl border border-line bg-white p-8 shadow-lg w-full space-y-6">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto">
          🔒
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-ink">Admin Privileges Required</h1>
          <p className="text-xs text-navy-600">
            The Admin Console is restricted to authorized Cartigo Super Admins and Team Executives.
          </p>
        </div>

        <div className="rounded-card bg-navy-50 p-4 border border-line text-left text-xs space-y-2 font-mono">
          <p className="font-bold text-navy-900 font-sans uppercase text-[10px] tracking-wider">Super Admin Login Accounts:</p>
          <div className="space-y-1">
            <p className="text-ink"><strong>1. Aman Shukla:</strong> amanshukla@cartigo.admin</p>
            <p className="text-ink"><strong>2. Sumit Gautam:</strong> sumitgautam@cartigo.admin</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/login?callbackUrl=/admin"
            className="block w-full rounded-card bg-navy-900 py-2.5 text-xs font-bold text-amber-400 hover:bg-navy-600 transition-colors shadow-md"
          >
            Sign In with Super Admin Account →
          </Link>

          <Link
            href="/"
            className="block w-full rounded-card border border-line py-2 text-xs font-semibold text-navy-600 hover:bg-navy-50 transition-colors"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
