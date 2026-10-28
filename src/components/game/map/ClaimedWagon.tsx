import React, { memo } from 'react';
import { PlayerColor } from '@/types/game';

// Claimed wagons use the OWNER'S player color, not the printed route color.
const PALETTE: Record<PlayerColor, { body: string; roof: string; dark: string; trim: string }> = {
  red: { body: '#e23b3b', roof: '#ff8880', dark: '#801c22', trim: '#ffe0d5' },
  blue: { body: '#256fe0', roof: '#88caff', dark: '#173b87', trim: '#e0f5ff' },
  green: { body: '#23a05b', roof: '#8be6a5', dark: '#145b36', trim: '#e4ffe5' },
  yellow: { body: '#f7c948', roof: '#fff3a1', dark: '#a36716', trim: '#422c12' },
  black: { body: '#323946', roof: '#8793a4', dark: '#101722', trim: '#f3f6fb' },
};

interface ClaimedWagonProps {
  x: number;
  y: number;
  angle: number;
  playerColor: PlayerColor;
  playerName?: string;
  animationIndex?: number;
}

/** Detailed miniature freight wagon, sized to fit one 24px map route slot. */
export const ClaimedWagon = memo<ClaimedWagonProps>(({ x, y, angle, playerColor, playerName, animationIndex = 0 }) => {
  const palette = PALETTE[playerColor] ?? PALETTE.black;
  const gradientId = `claimed-car-${playerColor}-${x}-${y}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}
       className={`wagon-animated wagon-delay-${Math.min(animationIndex + 1, 8)}`}
       pointerEvents="none">
      <title>{`Маршрут занят: ${playerName ?? 'игрок'} (${playerColor})`}</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.roof} />
          <stop offset="48%" stopColor={palette.body} />
          <stop offset="100%" stopColor={palette.dark} />
        </linearGradient>
      </defs>
      {/* Match the calibrated 24x10 wagon slot footprint, including on curves. */}
      <g transform="scale(0.78)">
      {/* Strong halo makes the claimed route legible on any map background. */}
      <rect x="-15" y="-9" width="30" height="18" rx="4"
        fill="#fff9e9" stroke="#1b2634" strokeWidth="1.8" />
      {/* Couplers and undercarriage */}
      <path d="M-16 1 H16" stroke={palette.dark} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="-12" y="3" width="24" height="2.6" rx="1" fill="#202630" />
      {/* Wheel sets */}
      <circle cx="-9" cy="6.2" r="2.8" fill="#15191f" stroke="#c6d1dd" strokeWidth=".8" />
      <circle cx="9" cy="6.2" r="2.8" fill="#15191f" stroke="#c6d1dd" strokeWidth=".8" />
      {/* Carriage body */}
      <path d="M-12 -5.5 Q-12 -7 -10 -7 H10 Q12 -7 12 -5.5 V3 H-12 Z"
        fill={`url(#${gradientId})`} stroke={palette.dark} strokeWidth="1.4" />
      {/* Raised roof and side panel ribs */}
      <path d="M-10 -7.5 H10 L12 -5.4 H-12 Z" fill={palette.roof}
        stroke={palette.dark} strokeWidth=".8" />
      <path d="M-7 -4 V1.5 M0 -4 V1.5 M7 -4 V1.5" stroke={palette.dark}
        strokeWidth="1" opacity=".8" />
      <rect x="-10" y="-3" width="20" height="3.4" rx=".6"
        fill={palette.body} opacity=".85" />
      {/* High contrast owner color mark */}
      <rect x="-3.5" y="-3.3" width="7" height="4.2" rx=".7"
        fill={palette.trim} stroke={palette.dark} strokeWidth=".6" />
      </g>
    </g>
  );
});
ClaimedWagon.displayName = 'ClaimedWagon';
