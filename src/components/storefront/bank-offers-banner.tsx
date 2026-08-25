"use client";

import Link from "next/link";

export function BankOffersBanner() {
  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg text-white">
      {/* Decorative background shapes */}
      <div className="absolute -right-10 -top-20 w-64 h-64 border-[30px] border-white/5 rounded-full blur-sm pointer-events-none"></div>
      <div className="absolute -left-10 -bottom-20 w-48 h-48 border-[20px] border-white/5 rounded-full blur-sm pointer-events-none"></div>

      <div className="relative z-10 px-6 py-8 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Text Content */}
        <div className="text-center md:text-left flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="bg-amber-400 text-navy-900 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Festive Offer</span>
            <span className="text-blue-200 text-xs font-semibold tracking-wider uppercase">Valid till 31st Dec</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Flat 10% Instant Discount
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mb-0">
            On HDFC Bank Credit Cards & EMI Transactions. No minimum spend required. Max discount ₹2,000 per card.
          </p>
        </div>

        {/* Action / Card Graphic */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex -space-x-4 mb-4 drop-shadow-xl">
            {/* Fake Credit Card 1 */}
            <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 shadow-lg -rotate-12 flex items-center justify-center p-2 relative overflow-hidden">
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="absolute top-2 right-4 w-3 h-3 rounded-full bg-orange-500/80"></div>
              <div className="w-full h-2 bg-gray-600/50 rounded mt-4"></div>
            </div>
            {/* Fake Credit Card 2 */}
            <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-amber-200 to-amber-500 border border-amber-300 shadow-xl rotate-6 flex flex-col justify-between p-2 relative overflow-hidden z-10">
              <div className="text-[8px] font-bold text-amber-900">HDFC BANK</div>
              <div className="w-4 h-3 bg-amber-100/50 rounded-sm"></div>
            </div>
          </div>
          
          <Link href="/products?offer=hdfc" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors backdrop-blur-md">
            View Eligible Products
          </Link>
        </div>

      </div>
    </div>
  );
}
