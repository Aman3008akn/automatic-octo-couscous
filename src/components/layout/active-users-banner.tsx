"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, X, ArrowRight, Store } from "lucide-react";

interface HighlightItem {
  badge: string;
  headline: string;
  detail: string;
  cta: string;
}

const RETAILER_HIGHLIGHTS: HighlightItem[] = [
  {
    badge: "LIVE DEMAND",
    headline: "Active Shoppers Online Now",
    detail: "High buyer traffic across 180+ Indian cities",
    cta: "List Products",
  },
  {
    badge: "RETAILER BOOM",
    headline: "1,840+ Orders Dispatched Today",
    detail: "Average reseller payout: ₹38,500/week (0% Commission)",
    cta: "Join as Seller",
  },
  {
    badge: "FAST TURNOVER",
    headline: "94% Inventory Sold Within 48 Hours",
    detail: "Electronics, fashion & lifestyle flying off shelves",
    cta: "Start Selling",
  },
];

const DEFAULT_HIGHLIGHT: HighlightItem = RETAILER_HIGHLIGHTS[0]!;

export function ActiveUsersBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeUsers, setActiveUsers] = useState(28492);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("cartygo_hide_active_users_banner");
    if (!dismissed) {
      // Pop up smoothly after 700ms on load
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(showTimer);
    }
  }, []);

  // Natural active users ticker simulation (e.g. +4, -2, +7)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const delta = Math.floor(Math.random() * 11) - 4; // between -4 and +6
        return Math.max(27500, Math.min(31200, prev + delta));
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Rotate retailer highlights every 5.5 seconds
  useEffect(() => {
    if (!isVisible) return;

    const cycleTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % RETAILER_HIGHLIGHTS.length);
    }, 5500);

    return () => clearInterval(cycleTimer);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("cartygo_hide_active_users_banner", "true");
  };

  const currentHighlight = RETAILER_HIGHLIGHTS[messageIndex] ?? DEFAULT_HIGHLIGHT;

  return (
    <div
      className={`relative w-full overflow-hidden transition-all duration-700 ease-out z-50 ${
        isVisible ? "max-h-16 sm:max-h-20 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
      }`}
    >
      {/* Rich Luxury Background Gradient & Animated Subtle Shimmer */}
      <div className="relative bg-gradient-to-r from-[#060D1E] via-[#101F42] to-[#060D1E] text-white border-b border-amber-500/30 px-2.5 sm:px-6 py-1.5 sm:py-2 shadow-lg">
        {/* Subtle decorative glow accents */}
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* DESKTOP VIEW (sm and above) - Kept exactly as configured */}
        <div className="hidden sm:flex mx-auto max-w-7xl items-center justify-between gap-4 relative">
          {/* Left: Live Status Radar + Active Users Counter */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-full px-2.5 py-1 text-xs font-semibold text-emerald-300 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono uppercase tracking-wider font-bold text-[10px]">
                {currentHighlight.badge}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-extrabold text-amber-300 tracking-tight transition-all duration-300">
                {activeUsers.toLocaleString("en-IN")}+
              </span>
              <span className="text-xs text-navy-100 font-medium">
                Live Shoppers
              </span>
            </div>
          </div>

          {/* Center: Dynamic Retailer Message & Demand Highlights */}
          <div className="flex-1 flex items-center justify-center min-w-0 text-center px-4">
            <div className="flex items-center justify-center gap-2 text-xs leading-tight transition-all duration-500">
              <div className="flex items-center gap-1.5 font-bold text-white truncate max-w-full">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{currentHighlight.headline}</span>
              </div>
              <span className="text-navy-400">•</span>
              <span className="text-xs text-amber-200/90 font-normal truncate">
                {currentHighlight.detail}
              </span>
            </div>
          </div>

          {/* Right: Retailer CTA + Close Action */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/reseller"
              className="group flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md hover:shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Store className="w-3 h-3 text-navy-950" />
              <span className="whitespace-nowrap">{currentHighlight.cta}</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss active users banner"
              className="p-1 rounded-full text-navy-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW (< sm) - Sleek single-line non-overlapping layout */}
        <div className="flex sm:hidden items-center justify-between gap-1.5 w-full relative">
          {/* Left: Compact Pulsing Dot + Live Count */}
          <div className="flex items-center gap-1.5 shrink-0 bg-emerald-950/90 border border-emerald-500/40 rounded-full px-2 py-0.5 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <span className="font-mono text-[11px] font-black text-amber-300">
              {activeUsers.toLocaleString("en-IN")}+
            </span>
            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
              Live
            </span>
          </div>

          {/* Center: Headline (Guaranteed single line, never wraps or overlaps) */}
          <div className="flex-1 min-w-0 text-center px-1">
            <p className="text-[11px] font-bold text-white truncate leading-none">
              {currentHighlight.headline}
            </p>
          </div>

          {/* Right: Compact Sell CTA + Close Button */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/reseller"
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow active:scale-95 transition-transform"
            >
              <Store className="w-2.5 h-2.5" />
              <span>Sell</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>

            <button
              onClick={handleDismiss}
              aria-label="Dismiss active users banner"
              className="p-1 text-navy-200 hover:text-white rounded-full transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
