import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="my-10 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-600 to-navy-900 p-8 sm:p-12 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-2 max-w-xl text-center md:text-left">
        <span className="inline-block rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
          CARTIGO GUARANTEE
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold">Big Savings. Verified Sellers. One Cart.</h2>
        <p className="text-xs sm:text-sm text-navy-100/90 leading-relaxed">
          Shop directly from pre-vetted reseller businesses. Every product is authenticated before shipping with 100% money-back buyer protection.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/search"
          className="rounded-card bg-amber-500 px-6 py-3 text-xs font-bold text-navy-900 shadow hover:bg-amber-400 transition-colors"
        >
          Explore All Deals →
        </Link>
      </div>
    </section>
  );
}
