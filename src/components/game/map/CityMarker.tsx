import React, { memo } from 'react';

interface CityMarkerProps {
  x: number;
  y: number;
  name: string;
  showName: boolean;
  highlighted?: boolean;
  onClick?: () => void;
}

// Memoized city marker component
export const CityMarker = memo<CityMarkerProps>(({ x, y, name, showName, highlighted = false, onClick }) => (
  <g onClick={onClick}>
    {/* City circle */}
    <circle
      cx={x}
      cy={y}
      r={highlighted ? 12 : 8}
      fill="hsl(40 35% 92%)"
      stroke={highlighted ? "#fbbf24" : "hsl(30 50% 30%)"}
      strokeWidth={highlighted ? 4 : 2}
      style={{ pointerEvents: 'none' }}
    />
    
    {/* Inner circle */}
    <circle
      cx={x}
      cy={y}
      r={4}
      fill="hsl(30 60% 40%)"
      style={{ pointerEvents: 'none' }}
    />
    
    {/* City name - only shown when toggled */}
    {showName && (
      <>
        <rect
          x={x - 30}
          y={y + 10}
          width={60}
          height={14}
          rx={2}
          fill={highlighted ? "#78350f" : "hsl(30 20% 15% / 0.85)"}
          style={{ pointerEvents: 'none' }}
        />
        <text
          x={x}
          y={y + 20}
          textAnchor="middle"
          style={{
            fontSize: '10px',
            fill: '#ffffff',
            fontWeight: 700,
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '0.5px',
          }}
        >
          {name}
        </text>
      </>
    )}
  </g>
));

CityMarker.displayName = 'CityMarker';
