"use client";

import Link from "next/link";

export function TrendingBanner() {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-100 flex flex-col md:flex-row items-center shadow-sm">
      
      {/* Left side: Editorial Image area */}
      <div 
        className="w-full md:w-1/2 h-64 md:h-80 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/summer-edit-banner.png')" }}
      >
        {/* We removed the faux typography since the image itself is rich */}
      </div>

      {/* Right side: Text and CTA */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-center md:text-left z-10 bg-amber-50">
        <h3 className="text-sm font-bold text-amber-600 uppercase tracking-widest mb-2">#TrendingNow</h3>
        <h2 className="text-3xl md:text-4xl font-display font-black text-navy-900 mb-4 leading-tight">
          The New <br className="hidden md:block" /> Arrivals
        </h2>
        <p className="text-navy-600 text-sm md:text-base mb-8 max-w-sm mx-auto md:mx-0">
          Discover this season's most coveted styles. From breezy linens to sunset hues, elevate your everyday wardrobe.
        </p>
        
        <Link 
          href="/products?category=trending" 
          className="inline-block bg-navy-900 text-white font-bold uppercase tracking-widest text-xs px-8 py-3 w-max mx-auto md:mx-0 hover:bg-amber-600 transition-colors"
        >
          Explore Collection
        </Link>
      </div>

    </div>
  );
}
