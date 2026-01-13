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

// Compact station marker - small house/station symbol
export const StationMarker = memo<StationMarkerProps>(({ x, y, playerColor, playerName }) => {
  const color = PLAYER_COLOR_MAP[playerColor] || '#6b7280';
  const size = 14;
  
  return (
    <g className="station-marker">
      {/* Simple station icon - small house shape */}
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
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      
      {/* Small roof highlight */}
      <path
        d={`M ${x} ${y - size / 2 + 2} L ${x + size / 3} ${y} L ${x - size / 3} ${y} Z`}
        fill="rgba(255,255,255,0.3)"
      />
      
      {/* Tooltip on hover */}
      <title>🏛️ Станция: {playerName}</title>
    </g>
  );
});

StationMarker.displayName = 'StationMarker';