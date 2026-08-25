"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 59, seconds: 59 });

  useEffect(() => {
    // Determine target time (5 hours from first load today, reset daily for demo)
    const target = new Date();
    target.setHours(target.getHours() + 4);
    target.setMinutes(target.getMinutes() + 59);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-black border border-gray-800 flex flex-col md:flex-row items-center shadow-xl">
      {/* Visual Effect */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-600/20 to-transparent skew-x-12 transform -translate-x-10 pointer-events-none"></div>
      
      {/* Left side: Text content */}
      <div className="flex-1 p-6 sm:p-8 z-10 text-center md:text-left flex flex-col justify-center">
        <div className="inline-block px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded mb-3 w-max mx-auto md:mx-0">Flash Sale</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">MEGA CLEARANCE</h2>
        <p className="text-gray-400 text-sm">Up to 80% OFF on Electronics, Fashion, and more. Prices drop every hour!</p>
      </div>

      {/* Right side: Timer */}
      <div className="bg-red-600 w-full md:w-auto p-6 sm:p-8 flex flex-col items-center justify-center shrink-0 z-10">
        <p className="text-red-100 text-xs font-bold uppercase tracking-widest mb-3">Ends In</p>
        <div className="flex items-center gap-3 text-white font-mono font-black text-3xl sm:text-4xl">
          <div className="flex flex-col items-center">
            <span className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm shadow-inner">{formatNumber(timeLeft.hours)}</span>
            <span className="text-[10px] uppercase text-red-200 mt-1 tracking-widest font-sans">Hrs</span>
          </div>
          <span className="text-red-300 -mt-5 animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm shadow-inner">{formatNumber(timeLeft.minutes)}</span>
            <span className="text-[10px] uppercase text-red-200 mt-1 tracking-widest font-sans">Min</span>
          </div>
          <span className="text-red-300 -mt-5 animate-pulse">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm shadow-inner">{formatNumber(timeLeft.seconds)}</span>
            <span className="text-[10px] uppercase text-red-200 mt-1 tracking-widest font-sans">Sec</span>
          </div>
        </div>
        
        <Link href="/products?category=clearance" className="mt-5 bg-white text-red-600 font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform">
          Shop Now
        </Link>
      </div>
    </div>
  );
}
