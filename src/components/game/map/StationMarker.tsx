import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';
import stationIcon from '@/assets/station-icon.png';

// Player color to actual SVG color mapping
const PLAYER_COLOR_MAP: Record<PlayerColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  black: '#1f2937',
};

// Player color to glow filter color
const PLAYER_GLOW_MAP: Record<PlayerColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#facc15',
  black: '#374151',
};

interface StationMarkerProps {
  x: number;
  y: number;
  playerColor: PlayerColor;
  playerName: string;
}

// Memoized station marker component - displays a vintage station icon on the map
export const StationMarker = memo<StationMarkerProps>(({ x, y, playerColor, playerName }) => {
  const color = PLAYER_COLOR_MAP[playerColor] || '#6b7280';
  const glowColor = PLAYER_GLOW_MAP[playerColor] || '#6b7280';
  const filterId = `station-glow-${playerColor}-${x}-${y}`;
  const size = 28;
  
  return (
    <g className="station-marker">
      {/* SVG filter for player color glow */}
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={glowColor} floodOpacity="0.8" />
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>
      
      {/* Base ring in player color */}
      <circle
        cx={x}
        cy={y}
        r={size / 2 + 4}
        fill="none"
        stroke={color}
        strokeWidth={3}
        style={{ 
          filter: `drop-shadow(0 0 4px ${glowColor})`,
        }}
      />
      
      {/* Station image */}
      <image
        href={stationIcon}
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        style={{
          filter: `url(#${filterId})`,
        }}
        preserveAspectRatio="xMidYMid meet"
      />
      
      {/* Small player color badge */}
      <circle
        cx={x + size / 2 - 2}
        cy={y - size / 2 + 2}
        r={5}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
      
      {/* Tooltip on hover */}
      <title>🏛️ Станция: {playerName}</title>
    </g>
  );
});

StationMarker.displayName = 'StationMarker';