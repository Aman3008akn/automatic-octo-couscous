"use client";

import { useEffect, useState } from "react";

export function TeamScrollPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the popup shortly after the page loads
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    // Optional: Hide if the user scrolls past a certain point
    const handleScroll = () => {
      if (window.scrollY > 2000) {
        setIsVisible(false);
      } else if (window.scrollY < 2000 && !document.getElementById("team-section")?.getBoundingClientRect().top) {
        // Just keeping it simple for now based on scroll position
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTeam = () => {
    setIsVisible(false);
    const teamSection = document.getElementById("team-section");
    if (teamSection) {
      teamSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="relative group">
        {/* Pulse effect behind button */}
        <div className="absolute -inset-1 bg-amber-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
        
        <button
          onClick={scrollToTeam}
          className="relative flex items-center gap-3 rounded-full bg-navy-900 border border-amber-500/50 px-5 py-3 shadow-2xl hover:bg-navy-800 transition-all transform hover:scale-105"
        >
          <div className="flex -space-x-2">
            <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold border border-navy-900 z-30">C</div>
            <div className="h-6 w-6 rounded-full bg-navy-600 flex items-center justify-center text-[10px] font-bold border border-navy-900 z-20 text-white">4+</div>
          </div>
          <span className="text-sm font-bold text-amber-400 tracking-wide pr-2">Meet the Visionaries Behind Cartigo ✨</span>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="ml-2 h-6 w-6 rounded-full bg-navy-800 flex items-center justify-center text-navy-400 hover:text-white hover:bg-navy-700 transition-colors"
            title="Close"
          >
            ✕
          </button>
        </button>
      </div>
    </div>
  );
}
