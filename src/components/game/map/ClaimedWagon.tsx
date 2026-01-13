import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Bright, saturated wagon colors for maximum visibility
const WAGON_FILL_MAP: Record<PlayerColor, string> = {
  red: '#e03131',
  blue: '#228be6',
  green: '#40c057',
  yellow: '#fab005',
  black: '#495057',
};

// Darker stroke for depth
const WAGON_STROKE_MAP: Record<PlayerColor, string> = {
  red: '#c92a2a',
  blue: '#1971c2',
  green: '#2f9e44',
  yellow: '#f59f00',
  black: '#343a40',
};

// Text color for contrast
const TEXT_COLOR_MAP: Record<PlayerColor, string> = {
  red: '#fff',
  blue: '#fff',
  green: '#fff',
  yellow: '#1a1a1a',
  black: '#fff',
};

// Short label for each color
const LABEL_MAP: Record<PlayerColor, string> = {
  red: 'К',
  blue: 'С',
  green: 'З',
  yellow: 'Ж',
  black: 'Ч',
};

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: string;
  playerName?: string;
  animationIndex?: number;
}

// Compact wagon with contrasting text label
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor, playerName, animationIndex = 0 }) => {
  const color = playerColor as PlayerColor;
  const fillColor = WAGON_FILL_MAP[color] || '#6b7280';
  const strokeColor = WAGON_STROKE_MAP[color] || '#4b5563';
  const textColor = TEXT_COLOR_MAP[color] || '#fff';
  const label = LABEL_MAP[color] || '?';
  
  // Smaller wagon dimensions
  const width = 26;
  const height = 12;
  
  // Animation class with staggered delay
  const animationClass = `wagon-animated wagon-delay-${Math.min(animationIndex + 1, 8)}`;
  
  return (
    <g 
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      className={animationClass}
      style={{ opacity: 0 }}
    >
      {/* Drop shadow */}
      <rect
        x={-width / 2 + 1}
        y={-height / 2 + 1}
        width={width}
        height={height}
        rx={2}
        ry={2}
        fill="rgba(0,0,0,0.35)"
      />
      
      {/* White outline for contrast */}
      <rect
        x={-width / 2 - 1}
        y={-height / 2 - 1}
        width={width + 2}
        height={height + 2}
        rx={3}
        ry={3}
        fill="white"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth={0.5}
      />
      
      {/* Main wagon body */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={2}
        ry={2}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.2}
      />
      
      {/* Contrasting text label */}
      <text
        x={0}
        y={0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontSize={8}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        style={{ 
          textShadow: color === 'yellow' ? 'none' : '0 1px 1px rgba(0,0,0,0.4)',
          pointerEvents: 'none'
        }}
      >
        {label}
      </text>
      
      {/* Tooltip on hover */}
      {playerName && <title>🚃 {playerName}</title>}
    </g>
  );
});

ClaimedWagon.displayName = 'ClaimedWagon';
