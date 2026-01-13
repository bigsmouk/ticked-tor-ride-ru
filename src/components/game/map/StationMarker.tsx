import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Player color mapping for station
const PLAYER_COLOR_MAP: Record<PlayerColor, string> = {
  red: '#c92a2a',
  blue: '#1971c2',
  green: '#2b8a3e',
  yellow: '#f59f00',
  black: '#343a40',
};

interface StationMarkerProps {
  x: number;
  y: number;
  playerColor: PlayerColor;
  playerName: string;
}

// Large, visible station marker with glow effect
export const StationMarker = memo<StationMarkerProps>(({ x, y, playerColor, playerName }) => {
  const color = PLAYER_COLOR_MAP[playerColor] || '#6b7280';
  const size = 22; // Increased from 14
  
  return (
    <g className="station-marker" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
      {/* Glow effect behind station */}
      <circle
        cx={x}
        cy={y}
        r={size / 1.5}
        fill={color}
        opacity={0.4}
        className="station-glow"
      />
      
      {/* Main station building - house shape */}
      <path
        d={`
          M ${x} ${y - size / 2}
          L ${x + size / 2} ${y}
          L ${x + size / 2} ${y + size / 2}
          L ${x - size / 2} ${y + size / 2}
          L ${x - size / 2} ${y}
          Z
        `}
        fill={color}
        stroke="white"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      
      {/* Roof highlight */}
      <path
        d={`M ${x} ${y - size / 2 + 3} L ${x + size / 3} ${y} L ${x - size / 3} ${y} Z`}
        fill="rgba(255,255,255,0.4)"
      />
      
      {/* Door indicator */}
      <rect
        x={x - 3}
        y={y + size / 6}
        width={6}
        height={size / 3}
        fill="rgba(0,0,0,0.3)"
        rx={1}
      />
      
      {/* Station flag/chimney */}
      <rect
        x={x + size / 4}
        y={y - size / 4}
        width={3}
        height={size / 3}
        fill="white"
        rx={0.5}
      />
      
      {/* Tooltip on hover */}
      <title>🏛️ Станция: {playerName}</title>
    </g>
  );
});

StationMarker.displayName = 'StationMarker';