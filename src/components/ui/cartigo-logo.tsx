export function CartigoLogoIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer abstract C shape representing commerce / digital ecosystem */}
      <path
        d="M80 30C75 20 63 15 50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C63 85 75 80 80 70"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-navy-900"
      />
      {/* Shopping cart handle and body emerging from the C */}
      <path
        d="M80 30L90 30"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
        className="text-navy-900"
      />
      <path
        d="M28 45L40 70H75L85 45H28Z"
        fill="currentColor"
        className="text-amber-500"
      />
      {/* Cart Wheels */}
      <circle cx="48" cy="80" r="5" fill="currentColor" className="text-navy-900" />
      <circle cx="68" cy="80" r="5" fill="currentColor" className="text-navy-900" />
      
      {/* Speed / Delivery lines for dynamic modern feel */}
      <path
        d="M2 40L10 40M5 55L15 55M2 70L10 70"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        className="text-amber-400"
      />
    </svg>
  );
}
