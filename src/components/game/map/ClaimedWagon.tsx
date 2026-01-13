import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Vibrant wagon fill colors - bright and saturated
const WAGON_FILL_MAP: Record<PlayerColor, string> = {
  red: '#FF2D2D',
  blue: '#2196F3',
  green: '#4CAF50',
  yellow: '#FFEB3B',
  black: '#424242',
};

// Gradient top colors for 3D effect
const WAGON_TOP_MAP: Record<PlayerColor, string> = {
  red: '#FF6B6B',
  blue: '#64B5F6',
  green: '#81C784',
  yellow: '#FFF176',
  black: '#757575',
};

// Dark stroke colors for depth
const WAGON_STROKE_MAP: Record<PlayerColor, string> = {
  red: '#B71C1C',
  blue: '#1565C0',
  green: '#2E7D32',
  yellow: '#F9A825',
  black: '#212121',
};

// Text/icon color for contrast
const TEXT_COLOR_MAP: Record<PlayerColor, string> = {
  red: '#FFFFFF',
  blue: '#FFFFFF',
  green: '#FFFFFF',
  yellow: '#1A1A1A',
  black: '#FFFFFF',
};

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: PlayerColor;
  playerName?: string;
  animationIndex?: number;
}

// Vibrant 3D wagon with gradient and highlights
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor, playerName, animationIndex = 0 }) => {
  const fillColor = WAGON_FILL_MAP[playerColor] || '#6b7280';
  const topColor = WAGON_TOP_MAP[playerColor] || '#9ca3af';
  const strokeColor = WAGON_STROKE_MAP[playerColor] || '#4b5563';
  const textColor = TEXT_COLOR_MAP[playerColor] || '#fff';
  
  // Wagon dimensions
  const width = 28;
  const height = 12;
  
  // Animation class with staggered delay
  const animationClass = `wagon-animated wagon-delay-${Math.min(animationIndex + 1, 8)}`;
  
  // Generate unique gradient ID
  const gradientId = `wagon-grad-${playerColor}-${x}-${y}`;
  
  return (
    <g 
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      className={animationClass}
      style={{ opacity: 0 }}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={topColor} />
          <stop offset="50%" stopColor={fillColor} />
          <stop offset="100%" stopColor={strokeColor} />
        </linearGradient>
      </defs>
      
      {/* Drop shadow */}
      <rect
        x={-width / 2 + 1.5}
        y={-height / 2 + 1.5}
        width={width}
        height={height}
        rx={2}
        ry={2}
        fill="rgba(0,0,0,0.5)"
      />
      
      {/* White outline for contrast */}
      <rect
        x={-width / 2 - 1.5}
        y={-height / 2 - 1.5}
        width={width + 3}
        height={height + 3}
        rx={3}
        ry={3}
        fill="white"
      />
      
      {/* Main wagon body with gradient */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={2}
        ry={2}
        fill={`url(#${gradientId})`}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      
      {/* Top shine effect */}
      <rect
        x={-width / 2 + 2}
        y={-height / 2 + 1}
        width={width - 4}
        height={3}
        rx={1}
        fill="rgba(255,255,255,0.5)"
      />
      
      {/* Mini train icon in center */}
      <g transform="translate(0, -0.5)">
        {/* Train body */}
        <rect
          x={-4}
          y={-2}
          width={8}
          height={4}
          rx={1}
          fill={textColor}
          opacity={0.9}
        />
        {/* Chimney */}
        <rect
          x={-3}
          y={-4}
          width={2}
          height={2}
          fill={textColor}
          opacity={0.9}
        />
        {/* Cabin window */}
        <rect
          x={1}
          y={-1}
          width={2}
          height={2}
          rx={0.5}
          fill={strokeColor}
          opacity={0.8}
        />
      </g>
      
      {/* Wheel indicators */}
      <circle cx={-width / 2 + 4} cy={height / 2 - 1} r={2} fill={strokeColor} />
      <circle cx={width / 2 - 4} cy={height / 2 - 1} r={2} fill={strokeColor} />
      
      {/* Tooltip on hover */}
      {playerName && <title>🚃 {playerName}</title>}
    </g>
  );
});

ClaimedWagon.displayName = 'ClaimedWagon';
