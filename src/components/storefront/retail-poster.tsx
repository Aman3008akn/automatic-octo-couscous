import Link from "next/link";
import Image from "next/image";

export function RetailPoster() {
  return (
    <Link href="/reseller/apply" className="block relative w-full overflow-hidden bg-navy-900 group cursor-pointer mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 opacity-90 transition-opacity group-hover:opacity-100"></div>
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/20 to-transparent transform skew-x-[-20deg]"></div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left z-10">
          <span className="mb-2 inline-flex items-center rounded-full bg-navy-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400 shadow-sm">
            🚀 Exclusive Partner Program
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-navy-900 tracking-tight leading-tight">
            Join Our Retail Team Today
          </h2>
          <p className="mt-2 text-lg sm:text-xl font-bold text-navy-800">
            Start selling on Cartigo and get a joining bonus up to <span className="text-white bg-navy-900 px-2 py-0.5 rounded shadow-sm">₹5,999</span>
          </p>
        </div>

        <div className="mt-6 sm:mt-0 flex items-center shrink-0 z-10">
          <div className="rounded-full bg-navy-900 px-8 py-4 font-bold text-amber-400 text-lg shadow-xl hover:bg-navy-800 transition-transform transform group-hover:scale-105 flex items-center gap-2">
            Start Retailing Now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
