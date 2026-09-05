import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "../../theme/colors";

interface CartigoLogoProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export function CartigoLogo({
  size = 36,
  color = colors.navy[900],
  accentColor = colors.amber[500],
}: CartigoLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Outer abstract C shape representing commerce / digital ecosystem */}
      <Path
        d="M80 30C75 20 63 15 50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C63 85 75 80 80 70"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Shopping cart handle emerging from the C */}
      <Path
        d="M80 30L90 30"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Cart Basket */}
      <Path
        d="M28 45L40 70H75L85 45H28Z"
        fill={accentColor}
      />
      {/* Cart Wheels */}
      <Circle cx="48" cy="80" r="5" fill={color} />
      <Circle cx="68" cy="80" r="5" fill={color} />
      {/* Speed / Delivery lines for dynamic modern feel */}
      <Path
        d="M2 40L10 40M5 55L15 55M2 70L10 70"
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </Svg>
  );
}
