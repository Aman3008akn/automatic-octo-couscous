"use client";

import { useEffect, useState } from "react";
import { CartigoLogoIcon } from "@/components/ui/cartigo-logo";
import { Smartphone, Download, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export function AppDownloadBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {}
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } else {
      // Show guided instructions for Android / iOS browser install
      setShowGuideModal(true);
    }
  };

  return (
    <section id="cartigo-app-download" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B0F19] via-[#12172B] to-[#0B0F19] border border-navy-700/60 shadow-xl p-8 sm:p-12 my-12 scroll-mt-20">
      {/* Amber Radial Glow */}
      <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Side: Content */}
        <div className="w-full lg:w-3/5 text-center lg:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold tracking-wider uppercase">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Official Mobile Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
            Download the <span className="text-amber-400">Cartigo App</span>
          </h2>

          <p className="text-navy-200 text-sm sm:text-base max-w-xl leading-relaxed">
            Experience our ultra-fast mobile application with instant order tracking, real-time verified price drops, and 1-tap checkout. No bloated app store download required.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-navy-200 justify-center lg:justify-start">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Instant Launch</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-navy-200 justify-center lg:justify-start">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Buyer Protection</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-navy-200 justify-center lg:justify-start">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Real-Time Sync</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 active:scale-98 text-navy-950 font-black text-sm px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(232,163,61,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span>DOWNLOAD & INSTALL APP</span>
            </button>

            <button
              onClick={() => setShowGuideModal(true)}
              className="text-xs font-semibold text-navy-300 hover:text-white transition-colors underline underline-offset-4 py-2"
            >
              How to install on Android & iOS?
            </button>
          </div>
        </div>

        {/* Right Side: Phone Graphic Mockup */}
        <div className="w-full lg:w-2/5 flex justify-center relative">
          <div className="relative w-64 h-[340px] bg-[#070A12] rounded-[2.5rem] border-4 border-navy-700 shadow-2xl p-3 flex flex-col overflow-hidden">
            {/* Phone Notch & Speaker */}
            <div className="w-20 h-4 bg-navy-800 rounded-full mx-auto mb-3" />

            {/* App UI Simulation */}
            <div className="flex-1 rounded-2xl bg-[#12172B] p-4 flex flex-col justify-between border border-navy-700/50">
              {/* App Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CartigoLogoIcon className="w-6 h-6 text-amber-400" />
                  <span className="font-display font-black text-sm text-white tracking-wider">CARTIGO</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  LIVE
                </span>
              </div>

              {/* Sample Mini Cards */}
              <div className="space-y-2 my-auto">
                <div className="bg-navy-800/80 p-2.5 rounded-xl border border-navy-700">
                  <div className="text-[10px] font-bold text-amber-400 uppercase">Cartigo Drop</div>
                  <div className="text-xs font-bold text-white truncate">Premium Tech Accessories</div>
                  <div className="text-[11px] text-navy-300 font-mono">₹2,499 (29% OFF)</div>
                </div>

                <div className="bg-navy-800/50 p-2.5 rounded-xl border border-navy-700/60">
                  <div className="text-[10px] font-bold text-emerald-400">Verified Marketplace</div>
                  <div className="text-xs font-semibold text-navy-200">Express 2-Day Delivery</div>
                </div>
              </div>

              {/* Bottom Quick Button */}
              <div className="w-full py-2 bg-amber-500 text-navy-950 text-center rounded-lg text-xs font-extrabold">
                TAP TO OPEN APP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                <span>Install Cartigo on Phone</span>
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-navy-400 hover:text-white text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-navy-200 leading-relaxed">
              <div className="bg-navy-800/70 p-3 rounded-xl border border-navy-700/60">
                <p className="font-bold text-amber-400 mb-1">Android (Chrome / Samsung Internet):</p>
                <p>1. Top-right me <strong className="text-white">3 dots (⋮)</strong> menu par tap karein.</p>
                <p>2. <strong className="text-white">"Install app"</strong> ya <strong className="text-white">"Add to Home screen"</strong> select karein.</p>
                <p>3. Confirm karein. Cartigo ka icon aapki home screen par add ho jayega!</p>
              </div>

              <div className="bg-navy-800/70 p-3 rounded-xl border border-navy-700/60">
                <p className="font-bold text-amber-400 mb-1">iPhone / iPad (Safari):</p>
                <p>1. Bottom bar me <strong className="text-white">Share (⎋)</strong> icon par tap karein.</p>
                <p>2. Scroll karke <strong className="text-white">"Add to Home Screen"</strong> par tap karein.</p>
                <p>3. Top-right me <strong className="text-white">"Add"</strong> tap karein.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowGuideModal(false);
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                }
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
