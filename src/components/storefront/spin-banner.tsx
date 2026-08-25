"use client";

import { useState } from "react";
import { SpinWheel } from "@/components/storefront/spin-wheel";

export function SpinBanner() {
  const [showWheel, setShowWheel] = useState(false);

  return (
    <>
      <div 
        onClick={() => setShowWheel(true)}
        className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-indigo-900 to-purple-900 cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-pink-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>

        <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="text-center md:text-left text-white max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Live Now
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl mb-4 leading-tight">
              Spin to Win <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Amazing Prizes</span>
            </h2>
            <p className="text-indigo-100 font-medium sm:text-lg mb-6">
              Every spin is a chance to win flat discounts, free shipping, and exclusive offers on Cartigo!
            </p>
            <button className="bg-gradient-to-r from-amber-400 to-orange-500 text-navy-900 font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
              Tap to Spin
            </button>
          </div>

          {/* Decorative Wheel Icon on the right */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 shrink-0 pointer-events-none drop-shadow-2xl">
            <div className="w-full h-full rounded-full border-[6px] border-amber-400 bg-navy-900 relative overflow-hidden animate-[spin_8s_linear_infinite]" style={{ background: "conic-gradient(#FF5733 0 60deg, #FFC300 60deg 120deg, #33FF57 120deg 180deg, #33C3FF 180deg 240deg, #8333FF 240deg 300deg, #FF33F5 300deg 360deg)" }}>
              <div className="absolute inset-3 rounded-full bg-navy-900/40 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <span className="font-black text-white text-xl uppercase tracking-widest drop-shadow-md">Win!</span>
              </div>
            </div>
            {/* The fixed pointer over the spinning wheel */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-8 bg-white z-10 drop-shadow-md" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}></div>
          </div>
        </div>
      </div>

      {showWheel && <SpinWheel onClose={() => setShowWheel(false)} />}
    </>
  );
}
