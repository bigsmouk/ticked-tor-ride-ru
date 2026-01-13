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

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: string;
  animationIndex?: number;
}

// Highly visible wagon with white outline, shadow, and appear animation
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor, animationIndex = 0 }) => {
  const color = playerColor as PlayerColor;
  const fillColor = WAGON_FILL_MAP[color] || '#6b7280';
  const strokeColor = WAGON_STROKE_MAP[color] || '#4b5563';
  
  // Wagon dimensions
  const width = 30;
  const height = 12;
  
  // Animation class with staggered delay
  const animationClass = `wagon-animated wagon-delay-${Math.min(animationIndex + 1, 8)}`;
  
  return (
    <g 
      transform={`translate(${x}, ${y}) rotate(${angle})`}
      className={animationClass}
      style={{ opacity: 0 }}
    >
      {/* Drop shadow for depth */}
      <rect
        x={-width / 2 + 1}
        y={-height / 2 + 1.5}
        width={width}
        height={height}
        rx={2.5}
        ry={2.5}
        fill="rgba(0,0,0,0.4)"
      />
      
      {/* White outline border for contrast against any background */}
      <rect
        x={-width / 2 - 1.5}
        y={-height / 2 - 1.5}
        width={width + 3}
        height={height + 3}
        rx={3.5}
        ry={3.5}
        fill="white"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={0.5}
      />
      
      {/* Main wagon body */}
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={2.5}
        ry={2.5}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
      />
      
      {/* Top highlight for 3D effect */}
      <rect
        x={-width / 2 + 3}
        y={-height / 2 + 2}
        width={width - 6}
        height={3}
        rx={1.5}
        fill="rgba(255,255,255,0.4)"
      />
      
      {/* Small wheel indicators at ends */}
      <circle
        cx={-width / 2 + 5}
        cy={height / 2 - 1}
        r={2}
        fill={strokeColor}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={0.5}
      />
      <circle
        cx={width / 2 - 5}
        cy={height / 2 - 1}
        r={2}
        fill={strokeColor}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={0.5}
      />
    </g>
  );
});

ClaimedWagon.displayName = 'ClaimedWagon';
