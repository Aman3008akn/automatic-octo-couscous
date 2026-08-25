"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AppDownloadBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50); // Haptic feedback
    }

    if (!deferredPrompt) {
      alert("App is already installed or your browser does not support it.");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-tr from-green-50 to-emerald-100 border border-emerald-200 flex flex-col md:flex-row items-center justify-between shadow-sm p-8 sm:p-12">
      
      {/* Left side: Text and Action */}
      <div className="w-full md:w-3/5 z-10 flex flex-col items-center md:items-start text-center md:text-left mb-8 md:mb-0">
        <h2 className="text-3xl md:text-4xl font-display font-black text-emerald-950 mb-3">
          Get the <span className="text-emerald-600">Cartigo App</span>
        </h2>
        <p className="text-emerald-800 font-medium mb-6 max-w-md">
          Shop on the go, get real-time order updates, and unlock exclusive app-only deals! Experience butter-smooth animations and haptics.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button 
            onClick={handleInstallClick}
            className="bg-emerald-600 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-[0_10px_20px_rgba(5,150,105,0.3)] hover:scale-105 hover:bg-emerald-700 active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2 group"
          >
            <span className="text-2xl group-hover:animate-bounce">⬇️</span> 
            Install App Now
          </button>
          
          <div className="flex gap-2">
            <div className="bg-emerald-950 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-semibold">
              <span>🍎</span> iOS
            </div>
            <div className="bg-emerald-950 text-white px-3 py-1.5 rounded flex items-center gap-2 text-xs font-semibold">
              <span>▶️</span> Android
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Mockup Phone */}
      <div className="w-full md:w-2/5 flex justify-center md:justify-end relative h-48 md:h-64">
        {/* Simple CSS Phone Mockup */}
        <div className="w-48 md:w-56 h-[300px] md:h-[400px] absolute -top-10 bg-white rounded-[2rem] border-8 border-gray-800 shadow-2xl flex flex-col overflow-hidden rotate-6 hover:rotate-0 transition-transform duration-500">
          <div className="bg-emerald-600 w-full pt-6 pb-4 px-4 flex flex-col items-center">
            <div className="w-1/2 h-4 bg-black absolute top-0 rounded-b-xl"></div>
            <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center font-bold text-xl mb-2">C</div>
            <div className="w-full h-8 bg-white/20 rounded-full mt-2"></div>
          </div>
          <div className="flex-1 bg-gray-50 p-3 flex flex-col gap-3">
            <div className="w-full h-24 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="text-3xl animate-pulse">🎉</span></div>
            <div className="flex gap-2">
              <div className="w-1/2 h-32 bg-gray-200 rounded-xl"></div>
              <div className="w-1/2 h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
