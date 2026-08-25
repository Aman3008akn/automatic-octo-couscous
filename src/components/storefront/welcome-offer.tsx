"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function WelcomeOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [scratched, setScratched] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the welcome offer
    const hasSeenOffer = localStorage.getItem("cartigo_welcome_offer");
    if (!hasSeenOffer) {
      // Delay popup slightly for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("cartigo_welcome_offer", "true");
  };

  const handleScratch = () => {
    setScratched(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-black/10 hover:bg-black/20 rounded-full w-8 h-8 flex items-center justify-center text-navy-900 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Content */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center text-white">
          <h2 className="font-display font-black text-3xl mb-1 drop-shadow-md">
            {scratched ? "YOU WON!" : "SURPRISE GIFT!"}
          </h2>
          <p className="font-medium text-amber-50">
            {scratched 
              ? "Use this code at checkout for 15% off."
              : "Scratch the card below to reveal your welcome offer!"}
          </p>
        </div>

        <div className="p-8 text-center flex flex-col items-center">
          <div 
            onClick={!scratched ? handleScratch : undefined}
            className={`relative w-full h-32 rounded-xl flex items-center justify-center border-4 border-dashed ${
              !scratched 
                ? "bg-gray-200 border-gray-400 cursor-pointer overflow-hidden group" 
                : "bg-success/10 border-success/30 cursor-default"
            }`}
          >
            {!scratched ? (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 flex items-center justify-center group-hover:opacity-90 transition-opacity">
                <span className="font-bold text-gray-500 tracking-wider">TAP TO SCRATCH</span>
              </div>
            ) : (
              <div className="animate-in zoom-in duration-500">
                <p className="text-xs font-bold text-success uppercase tracking-widest mb-1">Coupon Code</p>
                <p className="font-display font-black text-4xl text-navy-900 tracking-wider">WELCOME15</p>
              </div>
            )}
          </div>

          <Button 
            onClick={handleClose}
            variant={scratched ? "primary" : "secondary"}
            className={`w-full mt-6 py-6 text-base rounded-xl ${scratched ? "bg-navy-900 text-white" : ""}`}
          >
            {scratched ? "Awesome, thanks!" : "No thanks, close"}
          </Button>
        </div>
      </div>
    </div>
  );
}
