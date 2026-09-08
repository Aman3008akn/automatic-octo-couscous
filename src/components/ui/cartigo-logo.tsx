export function CartigoLogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Luminous Gold-Amber Gradient for outer C so it's always bright & crystal clear */}
        <linearGradient id="cartigoCBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" /> {/* bright yellow-amber */}
          <stop offset="60%" stopColor="#F59E0B" /> {/* rich amber */}
          <stop offset="100%" stopColor="#D97706" /> {/* deep warm amber */}
        </linearGradient>

        {/* Dynamic Royal Blue Gradient for cart body */}
        <linearGradient id="cartigoCartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Outer bold C shape representing Cartigo - high-contrast amber */}
      <path
        d="M80 28C74 17 62 13 49 13C28 13 13 29 13 50C13 71 28 87 49 87C63 87 74 82 80 71"
        stroke="url(#cartigoCBrandGrad)"
        strokeWidth="13"
        strokeLinecap="round"
      />

      {/* Shopping cart handle emerging from the C */}
      <path
        d="M79 28L90 28"
        stroke="url(#cartigoCBrandGrad)"
        strokeWidth="13"
        strokeLinecap="round"
      />

      {/* Shopping cart basket */}
      <path
        d="M28 45L40 70H75L85 45H28Z"
        fill="url(#cartigoCartGrad)"
      />

      {/* Cart Wheels */}
      <circle cx="46" cy="81" r="5.5" fill="#F59E0B" />
      <circle cx="69" cy="81" r="5.5" fill="#F59E0B" />
      
      {/* Dynamic speed lines */}
      <path
        d="M2 40L9 40M4 55L13 55M2 70L9 70"
        stroke="#FDE047"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
