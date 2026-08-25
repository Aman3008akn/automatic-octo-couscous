"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const PRIZES = [
  { label: "10% OFF", code: "CARTIGO10", color: "#FF5733" },
  { label: "₹500 OFF", code: "FLAT500", color: "#FFC300" },
  { label: "FREE SHIP", code: "FREEDEL", color: "#33FF57" },
  { label: "15% OFF", code: "CARTIGO15", color: "#33C3FF" },
  { label: "OOPS!", code: null, color: "#8333FF" },
  { label: "20% OFF", code: "CARTIGO20", color: "#FF33F5" },
];

export function SpinWheel({ onClose }: { onClose: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<{ label: string; code: string | null } | null>(null);

  const handleSpin = () => {
    if (isSpinning || wonPrize) return;

    setIsSpinning(true);

    // Randomize the prize
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    
    // Calculate rotation
    // 6 segments = 60 degrees each. 
    // We want to land in the middle of the selected segment.
    // CSS rotation goes clockwise. Segment 0 is at top right by default if we don't offset.
    // Let's just do a random spin between 5 to 10 full rotations + offset for the specific prize
    const spins = Math.floor(Math.random() * 5) + 5; // 5 to 10 spins
    
    // The pointer is at the top (0 degrees).
    // Segment 0 is from 0 to 60 deg. Middle is 30 deg.
    // Segment 1 is from 60 to 120. Middle is 90 deg.
    // Because the wheel rotates clockwise, to land on Segment 1 at the top, we need to rotate backwards (or full circle - angle).
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    
    const finalRotation = (spins * 360) + targetAngle;
    
    setRotation(finalRotation);

    // Wait for animation to finish (5 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(PRIZES[prizeIndex]);
    }, 5000);
  };

  // Generate the conic gradient string
  const conicGradient = PRIZES.map((prize, index) => {
    const start = index * (360 / PRIZES.length);
    const end = (index + 1) * (360 / PRIZES.length);
    return `${prize.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl p-6 sm:p-10 flex flex-col items-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-navy-900 transition-colors font-bold"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-navy-900 uppercase tracking-tight mb-2">
            Spin & Win!
          </h2>
          <p className="text-navy-600 font-medium text-sm sm:text-base">
            Test your luck and win exclusive discounts!
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mb-8">
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-12 bg-navy-900 drop-shadow-lg pointer-events-none" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}></div>
          
          {/* Inner Pointer Dot */}
          <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-30 w-4 h-4 bg-amber-400 rounded-full shadow-inner pointer-events-none"></div>

          {/* The Wheel */}
          <div 
            className="w-full h-full rounded-full border-4 border-navy-900 shadow-[0_0_20px_rgba(0,0,0,0.2)] overflow-hidden relative"
            style={{ 
              background: `conic-gradient(${conicGradient})`,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
            }}
          >
            {/* Inner Ring */}
            <div className="absolute inset-2 rounded-full border-2 border-white/30 pointer-events-none"></div>

            {/* Prize Text */}
            {PRIZES.map((prize, index) => {
              const rotate = (index * (360 / PRIZES.length)) + (180 / PRIZES.length);
              return (
                <div 
                  key={index} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1/2 origin-bottom text-center pt-4 sm:pt-6 pointer-events-none"
                  style={{ transform: `rotate(${rotate}deg)` }}
                >
                  <span className="text-white font-bold text-xs sm:text-sm drop-shadow-md whitespace-nowrap block" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}>
                    {prize.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Button / Hub */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || wonPrize !== null}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center border-4 border-navy-900 shadow-xl z-10 font-black text-navy-900 text-sm sm:text-base uppercase tracking-widest transition-transform ${isSpinning || wonPrize !== null ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}`}
          >
            SPIN
          </button>
        </div>

        {/* Result Area */}
        <div className="h-24 w-full flex flex-col items-center justify-center">
          {wonPrize ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-center w-full">
              {wonPrize.code ? (
                <>
                  <p className="text-sm font-bold text-success uppercase tracking-widest mb-1">Congratulations!</p>
                  <div className="bg-amber-100 border border-amber-300 rounded-lg py-3 px-4 w-full flex items-center justify-between">
                    <span className="font-mono font-bold text-lg text-amber-900">{wonPrize.code}</span>
                    <Button size="sm" variant="outline" className="h-8 text-xs bg-white" onClick={() => {
                      navigator.clipboard.writeText(wonPrize.code!);
                      alert("Copied to clipboard!");
                    }}>Copy</Button>
                  </div>
                  <p className="text-xs text-navy-500 mt-2">Use this code at checkout for {wonPrize.label}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-danger uppercase tracking-widest mb-1">Oh no!</p>
                  <p className="font-bold text-navy-900 text-lg">{wonPrize.label}</p>
                  <p className="text-xs text-navy-500 mt-1">Better luck next time!</p>
                </>
              )}
            </div>
          ) : (
             <p className="text-sm text-navy-400 font-medium">
               {isSpinning ? "Fingers crossed..." : "Tap SPIN to play!"}
             </p>
          )}
        </div>
      </div>
    </div>
  );
}
