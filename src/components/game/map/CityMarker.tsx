import React, { memo } from 'react';

interface CityMarkerProps {
  x: number;
  y: number;
  name: string;
  showName: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  interactive?: boolean;
  unavailable?: boolean;
}

// Memoized city marker component
export const CityMarker = memo<CityMarkerProps>(({ x, y, name, showName, highlighted = false, onClick, interactive = false, unavailable = false }) => (
  <g onClick={interactive && !unavailable ? onClick : undefined} role={interactive ? 'button' : undefined} tabIndex={interactive && !unavailable ? 0 : undefined}
    aria-label={interactive ? (unavailable ? `${name}: станция уже есть` : `Выбрать город ${name} для станции`) : undefined}
    onKeyDown={interactive && !unavailable ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick?.(); } } : undefined}
    style={{ cursor: interactive ? unavailable ? 'not-allowed' : 'pointer' : undefined, pointerEvents: interactive ? 'all' : 'none' }}>
    {/* City circle */}
    <circle
      cx={x}
      cy={y}
      r={interactive ? 15 : highlighted ? 12 : 8}
      fill={interactive ? unavailable ? "#b7a79a" : "#ffeb9c" : "hsl(40 35% 92%)"}
      stroke={highlighted ? "#fbbf24" : "hsl(30 50% 30%)"}
      strokeWidth={highlighted ? 4 : 2}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
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
