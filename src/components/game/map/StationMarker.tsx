import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Player color to actual SVG color mapping
const PLAYER_COLOR_MAP: Record<PlayerColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  black: '#1f2937',
};

interface StationMarkerProps {
  x: number;
  y: number;
  playerColor: PlayerColor;
  playerName: string;
}

// Memoized station marker component - displays a station icon on the map
export const StationMarker = memo<StationMarkerProps>(({ x, y, playerColor, playerName }) => {
  const color = PLAYER_COLOR_MAP[playerColor] || '#6b7280';
  
  return (
    <g className="station-marker">
      {/* Station base circle with player color */}
      <circle
        cx={x}
        cy={y}
        r={12}
        fill={color}
        stroke="hsl(40 35% 92%)"
        strokeWidth={3}
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />
      
      {/* Station icon (🏛️ as simple pillars) */}
      <g transform={`translate(${x - 6}, ${y - 5})`}>
        {/* Roof */}
        <path
          d="M0 4 L6 0 L12 4"
          fill="none"
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pillars */}
        <line x1={2} y1={4} x2={2} y2={10} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={6} y1={4} x2={6} y2={10} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={10} y1={4} x2={10} y2={10} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
        {/* Base */}
        <line x1={0} y1={10} x2={12} y2={10} stroke="white" strokeWidth={1.5} strokeLinecap="round" />
      </g>
      
      {/* Tooltip on hover */}
      <title>Станция: {playerName}</title>
    </g>
  );
});

StationMarker.displayName = 'StationMarker';
