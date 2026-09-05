"use client";

import { useEffect, useState } from "react";

export function PwaLaunchAnimation() {
  const [showSplash, setShowSplash] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 1. Check if running in PWA Standalone Mode or preview parameter
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://") ||
        new URLSearchParams(window.location.search).has("splash"));

    // 2. Only show once per session in PWA mode
    const alreadySeen = sessionStorage.getItem("cartigo_pwa_splash_seen");

    if (isStandalone && !alreadySeen) {
      setShowSplash(true);
      sessionStorage.setItem("cartigo_pwa_splash_seen", "true");

      // Tactile haptic tap on launch
      if ("vibrate" in navigator) {
        try {
          navigator.vibrate(30);
        } catch {}
      }

      // Haptic for amber sweep at 1200ms
      const hapticTimer = setTimeout(() => {
        if ("vibrate" in navigator) {
          try {
            navigator.vibrate([15, 30, 25]);
          } catch {}
        }
      }, 1200);

      // Start smooth exit transition at 1700ms
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 1700);

      // Complete and unmount at 2100ms
      const finishTimer = setTimeout(() => {
        setShowSplash(false);
      }, 2100);

      return () => {
        clearTimeout(hapticTimer);
        clearTimeout(exitTimer);
        clearTimeout(finishTimer);
      };
    }
  }, []);

  if (!showSplash) {
    return null;
  }

  const letters = ["A", "R", "T", "I", "G", "O"];

  return (
    <div
      id="cartigo-pwa-splash"
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#080D1A] overflow-hidden select-none transition-all duration-400 ease-out ${
        isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: "400ms",
      }}
    >
      {/* Ambient Radial Warmth Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#E8A33D]/[0.035] blur-3xl pointer-events-none" />

      {/* Main Logo Showcase */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Subtle 360 Amber Arc Sweep around the C */}
        <div className="absolute -left-7 -top-8 w-[110px] h-[110px] pointer-events-none arc-sweep-spin">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none">
            <defs>
              <linearGradient id="pwaAmberArc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5C26B" stopOpacity="0" />
                <stop offset="50%" stopColor="#E8A33D" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#D98E1B" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle
              cx="55"
              cy="55"
              r="48"
              stroke="url(#pwaAmberArc)"
              strokeWidth="2.5"
              strokeDasharray="80 180"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Wordmark Container */}
        <div className="relative flex items-center justify-center px-4 py-2 overflow-hidden wordmark-settle">
          {/* Initial 'C' */}
          <span className="text-4xl sm:text-5xl font-black text-white tracking-wider animate-c-reveal drop-shadow-[0_2px_12px_rgba(232,163,61,0.35)]">
            C
          </span>

          {/* Sequential Letters: A R T I G O */}
          {letters.map((letter, idx) => (
            <span
              key={letter + idx}
              className="text-4xl sm:text-5xl font-black text-[#F7F7F5] tracking-wider progressive-letter"
              style={{
                animationDelay: `${400 + idx * 75}ms`,
              }}
            >
              {letter}
            </span>
          ))}

          {/* Amber Shimmer Light Ray */}
          <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#E8A33D]/30 to-transparent -skew-x-12 pointer-events-none amber-shimmer" />
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-2 mt-4 animate-tagline">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" />
          <span className="text-[10px] sm:text-xs font-bold text-[#E8A33D] tracking-[0.3em] uppercase">
            Verified Marketplace
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" />
        </div>
      </div>

      {/* Bottom Security Assurance */}
      <div className="absolute bottom-10 flex items-center gap-2 text-[9px] font-semibold text-slate-400/50 tracking-[0.2em] uppercase animate-footer">
        <span>Buyer Protection</span>
        <span>•</span>
        <span>Transparent Math</span>
      </div>

      <style jsx>{`
        @keyframes cReveal {
          0% {
            opacity: 0;
            transform: scale(0.65) translateY(8px);
          }
          60% {
            opacity: 1;
            transform: scale(1.06) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-c-reveal {
          animation: cReveal 340ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 100ms;
          opacity: 0;
        }

        @keyframes letterPop {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateY(-1px) scale(1.04);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .progressive-letter {
          opacity: 0;
          display: inline-block;
          animation: letterPop 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes wordmarkBreathe {
          0%,
          75% {
            transform: scale(1);
          }
          85% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }

        .wordmark-settle {
          animation: wordmarkBreathe 1300ms ease-out forwards;
        }

        @keyframes arcSpin {
          0% {
            opacity: 0;
            transform: rotate(0deg) scale(0.7);
          }
          30% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: rotate(360deg) scale(1.3);
          }
        }

        .arc-sweep-spin {
          opacity: 0;
          animation: arcSpin 650ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 1100ms;
        }

        @keyframes shimmerSweep {
          0% {
            opacity: 0;
            transform: translateX(-150px) skewX(-20deg);
          }
          30% {
            opacity: 0.8;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateX(250px) skewX(-20deg);
          }
        }

        .amber-shimmer {
          opacity: 0;
          animation: shimmerSweep 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 1150ms;
        }

        @keyframes taglineFade {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-tagline {
          opacity: 0;
          animation: taglineFade 400ms ease-out forwards;
          animation-delay: 950ms;
        }

        .animate-footer {
          opacity: 0;
          animation: taglineFade 400ms ease-out forwards;
          animation-delay: 1050ms;
        }
      `}</style>
    </div>
  );
}
