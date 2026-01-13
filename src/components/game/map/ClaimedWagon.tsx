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
    {/* Outer glow for visibility */}
    <rect
      x={-16}
      y={-10}
      width={32}
      height={20}
      rx={5}
      fill={playerColor}
      opacity={0.35}
      filter="url(#claimed-glow)"
    />
    
    {/* Wagon body shadow - darker and larger */}
    <rect
      x={-14}
      y={-3}
      width={28}
      height={14}
      rx={3}
      fill="hsl(0 0% 0% / 0.6)"
    />
    
    {/* Wagon body - larger and more prominent */}
    <rect
      x={-13}
      y={-7}
      width={26}
      height={14}
      rx={3}
      fill={playerColor}
      stroke="hsl(0 0% 100%)"
      strokeWidth={2.5}
    />
    
    {/* Inner color band for depth */}
    <rect
      x={-11}
      y={-5}
      width={22}
      height={10}
      rx={2}
      fill={playerColor}
      stroke="hsl(0 0% 0% / 0.3)"
      strokeWidth={0.5}
    />
    
    {/* Wagon window stripe - brighter */}
    <rect
      x={-9}
      y={-3}
      width={18}
      height={3}
      rx={1}
      fill="hsl(0 0% 100% / 0.6)"
    />
    
    {/* Roof highlight */}
    <rect
      x={-10}
      y={-6}
      width={20}
      height={2}
      rx={1}
      fill="hsl(0 0% 100% / 0.25)"
    />
    
    {/* Wheels - larger and more detailed */}
    <circle cx={-7} cy={6} r={3} fill="hsl(0 0% 15%)" stroke="hsl(0 0% 50%)" strokeWidth={1} />
    <circle cx={-7} cy={6} r={1.5} fill="hsl(0 0% 30%)" />
    <circle cx={7} cy={6} r={3} fill="hsl(0 0% 15%)" stroke="hsl(0 0% 50%)" strokeWidth={1} />
    <circle cx={7} cy={6} r={1.5} fill="hsl(0 0% 30%)" />
    
    {/* Coupling hooks */}
    <rect x={-15} y={-1} width={3} height={2} rx={0.5} fill="hsl(0 0% 40%)" />
    <rect x={12} y={-1} width={3} height={2} rx={0.5} fill="hsl(0 0% 40%)" />
  </g>
));

ClaimedWagon.displayName = 'ClaimedWagon';
