import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Player color to wagon fill color (matching original board style)
const WAGON_FILL_MAP: Record<PlayerColor, string> = {
  red: '#c92a2a',
  blue: '#1971c2',
  green: '#2b8a3e',
  yellow: '#f59f00',
  black: '#343a40',
};

// Lighter stroke for contrast
const WAGON_STROKE_MAP: Record<PlayerColor, string> = {
  red: '#862e2e',
  blue: '#1864ab',
  green: '#1e7832',
  yellow: '#c27803',
  black: '#212529',
};

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: string;
}

// Simple wagon rectangle like the original board game
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor }) => {
  const color = playerColor as PlayerColor;
  const fillColor = WAGON_FILL_MAP[color] || '#6b7280';
  const strokeColor = WAGON_STROKE_MAP[color] || '#4b5563';
  
  // Wagon dimensions - fills the slot
  const width = 28;
  const height = 10;
  
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      {/* Main wagon body - simple rounded rectangle */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={2}
        ry={2}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      
      {/* Simple highlight line at top for 3D effect */}
      <rect
        x={-width / 2 + 2}
        y={-height / 2 + 1}
        width={width - 4}
        height={2}
        rx={1}
        fill="rgba(255,255,255,0.3)"
      />
    </g>
  );
});

ClaimedWagon.displayName = 'ClaimedWagon';