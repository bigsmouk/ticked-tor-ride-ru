import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Import vintage wagon images
import wagonRed from '@/assets/wagons/wagon-red.png';
import wagonBlue from '@/assets/wagons/wagon-blue.png';
import wagonGreen from '@/assets/wagons/wagon-green.png';
import wagonYellow from '@/assets/wagons/wagon-yellow.png';
import wagonBlack from '@/assets/wagons/wagon-black.png';

// Map player colors to wagon images
const WAGON_IMAGES: Record<PlayerColor, string> = {
  red: wagonRed,
  blue: wagonBlue,
  green: wagonGreen,
  yellow: wagonYellow,
  black: wagonBlack,
};

// Fallback color mapping for glow effects
const PLAYER_GLOW_MAP: Record<PlayerColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#facc15',
  black: '#6b7280',
};

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: string;
}

// Memoized wagon component - uses vintage wagon images
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor }) => {
  const color = playerColor as PlayerColor;
  const wagonImage = WAGON_IMAGES[color] || wagonRed;
  const glowColor = PLAYER_GLOW_MAP[color] || '#6b7280';
  const filterId = `wagon-glow-${color}-${x}-${y}`;
  
  // Wagon dimensions on the map
  const width = 36;
  const height = 22;
  
  return (
    <g 
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      className="claimed-wagon"
    >
      {/* SVG filter for glow effect */}
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={glowColor} floodOpacity="0.7" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>
      
      {/* Background glow for visibility */}
      <rect
        x={-width / 2 - 2}
        y={-height / 2 - 2}
        width={width + 4}
        height={height + 4}
        rx={4}
        fill="hsl(40 30% 95%)"
        opacity={0.85}
        stroke="hsl(40 40% 80%)"
        strokeWidth={1}
      />
      
      {/* Vintage wagon image */}
      <image
        href={wagonImage}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        style={{
          filter: `url(#${filterId})`,
        }}
        preserveAspectRatio="xMidYMid meet"
      />
      
      {/* Border for extra visibility */}
      <rect
        x={-width / 2 - 1}
        y={-height / 2 - 1}
        width={width + 2}
        height={height + 2}
        rx={3}
        fill="none"
        stroke={glowColor}
        strokeWidth={1.5}
        opacity={0.6}
      />
    </g>
  );
});

ClaimedWagon.displayName = 'ClaimedWagon';