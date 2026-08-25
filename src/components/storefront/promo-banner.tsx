import Link from "next/link";

export function PromoBanner() {
  return (
    <section className="my-10 rounded-xl overflow-hidden relative shadow-md">
      {/* Background Graphic/Color */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
      
      <div className="relative p-6 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Flashy Badge */}
          <div className="bg-yellow-400 text-black font-display font-black text-3xl sm:text-5xl px-4 py-2 rotate-[-3deg] shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            FLASH<br />SALE
          </div>
          
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight drop-shadow-md">
              Flat 15% Off
            </h2>
            <p className="text-lg sm:text-xl font-medium text-cyan-100">
              on Top Electronics & Appliances
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3 pt-2">
              <span className="bg-white/20 backdrop-blur-sm border border-white/40 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                2-3 PM
              </span>
              <span className="bg-white/20 backdrop-blur-sm border border-white/40 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                8-9 PM
              </span>
              <span className="bg-white/20 backdrop-blur-sm border border-white/40 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                10-12 AM
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 mt-4 md:mt-0">
          <Link
            href="/search?categorySlug=electronics"
            className="group relative inline-flex items-center justify-center bg-yellow-400 px-8 py-4 text-sm font-black text-black transition-all hover:bg-yellow-300 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)] uppercase tracking-widest rounded-full"
          >
            <span>Grab Deals Now</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
