import React, { memo } from 'react';

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: string;
}

// Memoized wagon component - only re-renders when props change
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor }) => (
  <g 
    transform={`translate(${x}, ${y}) rotate(${angle})`}
    className="claimed-wagon"
  >
    {/* Wagon body shadow */}
    <rect
      x={-13}
      y={-4}
      width={26}
      height={12}
      rx={3}
      fill="hsl(0 0% 0% / 0.4)"
    />
    {/* Wagon body */}
    <rect
      x={-12}
      y={-6}
      width={24}
      height={12}
      rx={3}
      fill={playerColor}
      stroke="hsl(0 0% 100% / 0.9)"
      strokeWidth={1.5}
    />
    {/* Wagon window/detail stripe */}
    <rect
      x={-10}
      y={-3}
      width={20}
      height={3}
      rx={1}
      fill="hsl(0 0% 100% / 0.4)"
    />
    {/* Wheels */}
    <circle cx={-6} cy={5} r={2.5} fill="hsl(0 0% 20%)" stroke="hsl(0 0% 40%)" strokeWidth={0.5} />
    <circle cx={6} cy={5} r={2.5} fill="hsl(0 0% 20%)" stroke="hsl(0 0% 40%)" strokeWidth={0.5} />
  </g>
));

ClaimedWagon.displayName = 'ClaimedWagon';
