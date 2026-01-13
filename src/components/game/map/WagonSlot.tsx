import React, { memo } from 'react';

interface WagonSlotProps {
  x: number;
  y: number;
  angle: number;
  color: string;
  isTunnel?: boolean;
  isFerryLocomotive?: boolean;
}

// Memoized wagon slot component for unclaimed routes
export const WagonSlot = memo<WagonSlotProps>(({ x, y, angle, color, isTunnel, isFerryLocomotive }) => (
  <g 
    transform={`translate(${x}, ${y}) rotate(${angle})`}
    className="wagon-slot"
  >
    {/* Slot background */}
    <rect
      x={-12}
      y={-5}
      width={24}
      height={10}
      rx={2}
      fill={color}
      stroke="hsl(30 30% 50%)"
      strokeWidth={1.5}
      opacity={0.9}
      className="wagon-rect"
    />
    
    {/* Tunnel indicator - zigzag border */}
    {isTunnel && (
      <>
        {/* Outer zigzag frame */}
        <rect
          x={-14}
          y={-7}
          width={28}
          height={14}
          rx={0}
          fill="none"
          stroke="hsl(30 50% 20%)"
          strokeWidth={2}
          strokeDasharray="3 2"
        />
        {/* Mountain symbol */}
        <path
          d="M -8 3 L -4 -2 L 0 3 L 4 -2 L 8 3"
          stroke="hsl(30 40% 35%)"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    
    {/* Ferry locomotive indicator */}
    {isFerryLocomotive && (
      <text
        x={0}
        y={4}
        textAnchor="middle"
        fontSize="8"
        fill="hsl(30 20% 30%)"
        fontWeight="bold"
      >
        🚂
      </text>
    )}
  </g>
));

WagonSlot.displayName = 'WagonSlot';
