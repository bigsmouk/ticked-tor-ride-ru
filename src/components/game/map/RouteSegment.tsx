import React, { memo, useCallback } from 'react';
import { Route, PlayerColor } from '@/types/game';
import { ClaimedWagon } from './ClaimedWagon';
import { WagonSlot } from './WagonSlot';

// Color mappings for routes
const ROUTE_COLORS: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#fbbf24',
  orange: '#f97316',
  pink: '#ec4899',
  white: '#fafafa',
  black: '#404040',
  gray: '#9ca3af',
};

// Player color mappings
const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#ff3333',
  blue: '#4488ff',
  green: '#33ff66',
  yellow: '#ffee00',
  black: '#555555',
};

interface Segment {
  x: number;
  y: number;
  angle: number;
}

interface RouteSegmentProps {
  route: Route;
  path: string;
  segments: Segment[];
  isSelected: boolean;
  isClaimable: boolean;
  claimingPlayerColor: PlayerColor | null;
  claimingPlayerName: string | null;
  onClick?: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

// Memoized route segment - complex comparison to avoid unnecessary re-renders
export const RouteSegment = memo<RouteSegmentProps>(({
  route,
  path,
  segments,
  isSelected,
  isClaimable,
  claimingPlayerColor,
  claimingPlayerName,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
  const isClaimed = !!route.claimedBy;

  const handleClick = useCallback(() => {
    if (!isClaimed && onClick) {
      onClick();
    }
  }, [isClaimed, onClick]);

  return (
    <g 
      className={`route-segment ${isClaimable ? 'cursor-pointer route-claimable' : ''} ${!isClaimed ? 'route-hoverable' : ''}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {isClaimed && claimingPlayerColor ? (
        // Claimed route - show player wagons on each segment
        <>
          {/* Dark outline for contrast */}
          <path
            d={path}
            stroke="hsl(0 0% 0% / 0.5)"
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
          />
          {/* Individual claimed wagon cars with staggered animation */}
          {segments.map((seg, i) => (
            <ClaimedWagon
              key={i}
              x={seg.x}
              y={seg.y}
              angle={seg.angle}
              playerColor={claimingPlayerColor}
              playerName={claimingPlayerName || undefined}
              animationIndex={i}
            />
          ))}
        </>
      ) : (
        // Unclaimed route - show wagon slots
        <>
          {/* Invisible clickable area - wide stroke for easy clicking */}
          <path
            d={path}
            stroke="transparent"
            strokeWidth={24}
            fill="none"
            strokeLinecap="round"
            style={{ cursor: isClaimable ? 'pointer' : 'default' }}
          />
          
          {/* Route background line - dimmed for unclaimed */}
          <path
            d={path}
            stroke={isSelected ? 'hsl(43 80% 50%)' : 'hsl(30 30% 40%)'}
            strokeWidth={isSelected ? 14 : 10}
            fill="none"
            strokeLinecap="round"
            opacity={isSelected ? 1 : isClaimable ? 0.5 : 0.3}
            pointerEvents="none"
          />
          
          {/* Individual train car slots */}
          {segments.map((seg, i) => (
            <WagonSlot
              key={i}
              x={seg.x}
              y={seg.y}
              angle={seg.angle}
              color={color}
              isTunnel={route.isTunnel}
              isFerryLocomotive={!!route.ferryLocomotives && route.ferryLocomotives > 0 && i < route.ferryLocomotives}
            />
          ))}
          
          {/* Hover highlight */}
          {isClaimable && (
            <path
              d={path}
              stroke="hsl(43 80% 50%)"
              strokeWidth={16}
              fill="none"
              strokeLinecap="round"
              opacity={0}
              className="transition-opacity hover:opacity-30"
              pointerEvents="none"
            />
          )}
        </>
      )}
    </g>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render when these change
  return (
    prevProps.route.id === nextProps.route.id &&
    prevProps.route.claimedBy === nextProps.route.claimedBy &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isClaimable === nextProps.isClaimable &&
    prevProps.claimingPlayerColor === nextProps.claimingPlayerColor &&
    prevProps.claimingPlayerName === nextProps.claimingPlayerName &&
    prevProps.path === nextProps.path
  );
});

RouteSegment.displayName = 'RouteSegment';
