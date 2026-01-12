import React, { useState, useRef, useCallback, useEffect } from 'react';
import { City, Route, PlayerColor } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import europeMapImage from '@/assets/europe-map.jpg';
import { ROUTE_WAGON_POSITIONS } from '@/data/europeMap';

interface EuropeMapProps {
  cities: City[];
  routes: Route[];
  onRouteClick?: (routeId: string) => void;
  onCityClick?: (cityId: string) => void;
  selectedRoute?: string | null;
}

// Color mappings for routes - bright and vibrant
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

// Player color mappings - very bright and saturated
const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#ff3333',
  blue: '#4488ff',
  green: '#33ff66',
  yellow: '#ffee00',
  black: '#555555',
};

// Get city position
const getCityPosition = (cityId: string, cities: City[]): { x: number; y: number } => {
  const city = cities.find(c => c.id === cityId);
  return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
};

// Calculate route path with curves and offsets for parallel routes
const getRoutePath = (
  route: Route, 
  cities: City[], 
  allRoutes: Route[]
): { path: string; segments: { x: number; y: number; angle: number }[]; startPos: {x: number, y: number}; endPos: {x: number, y: number} } => {
  // Check if we have calibrated positions for this route
  const calibrated = ROUTE_WAGON_POSITIONS[route.id];
  if (calibrated && calibrated.length === route.length) {
    // Use calibrated positions
    const pathPoints = calibrated.map(w => `${w.x} ${w.y}`);
    const startPos = { x: calibrated[0].x, y: calibrated[0].y };
    const endPos = { x: calibrated[calibrated.length - 1].x, y: calibrated[calibrated.length - 1].y };
    return {
      path: `M ${pathPoints.join(' L ')}`,
      segments: calibrated.map(w => ({ x: w.x, y: w.y, angle: w.angle })),
      startPos,
      endPos,
    };
  }
  
  // Fallback to calculated positions
  const start = getCityPosition(route.cities[0], cities);
  const end = getCityPosition(route.cities[1], cities);
  
  // Check if this is a parallel route
  const hasParallel = route.parallelRouteId || 
    allRoutes.some(r => r.parallelRouteId === route.id);
  
  // Offset for parallel routes
  const offset = hasParallel ? (route.parallelRouteId ? 8 : -8) : 0;
  
  // Calculate perpendicular offset
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / length;
  const perpY = dx / length;
  
  const startX = start.x + perpX * offset;
  const startY = start.y + perpY * offset;
  const endX = end.x + perpX * offset;
  const endY = end.y + perpY * offset;
  
  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  
  // Calculate segments
  const segments: { x: number; y: number; angle: number }[] = [];
  
  for (let i = 0; i < route.length; i++) {
    const t = (i + 0.5) / route.length;
    segments.push({
      x: startX + (endX - startX) * t,
      y: startY + (endY - startY) * t,
      angle,
    });
  }
  
  return {
    path: `M ${startX} ${startY} L ${endX} ${endY}`,
    segments,
    startPos: { x: startX, y: startY },
    endPos: { x: endX, y: endY },
  };
};

export const EuropeMap: React.FC<EuropeMapProps> = ({
  cities,
  routes,
  onRouteClick,
  onCityClick,
  selectedRoute,
}) => {
  const { gameState, canClaimRoute } = useGameStore();
  
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCityNames, setShowCityNames] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  
  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta)));
  }, []);
  
  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);
  
  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={() => setScale(prev => Math.min(MAX_SCALE, prev * 1.2))}
          className="w-8 h-8 bg-background/90 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors"
        >
          +
        </button>
        <button 
          onClick={() => setScale(prev => Math.max(MIN_SCALE, prev * 0.8))}
          className="w-8 h-8 bg-background/90 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors"
        >
          −
        </button>
        <button 
          onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
          className="w-8 h-8 bg-background/90 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors text-xs"
        >
          ⟲
        </button>
        <button 
          onClick={() => setShowCityNames(prev => !prev)}
          className={`w-8 h-8 bg-background/90 border border-border rounded flex items-center justify-center hover:bg-accent transition-colors text-xs ${showCityNames ? 'bg-primary text-primary-foreground' : ''}`}
          title={showCityNames ? 'Скрыть названия' : 'Показать названия'}
        >
          🏙️
        </button>
      </div>
      
      {/* Scale indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-background/90 border border-border rounded px-2 py-1 text-xs">
        {Math.round(scale * 100)}%
      </div>
      
      <svg
        viewBox="0 0 800 550"
        className="w-full h-full"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* Map background image */}
        <defs>
          {/* Tunnel pattern */}
          <pattern id="tunnel" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="none" />
            <rect x="0" y="0" width="4" height="8" fill="currentColor" />
          </pattern>
          
          {/* Glow filter for active routes */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Strong glow for claimed routes */}
          <filter id="claimed-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Hover glow effect */}
          <filter id="hover-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Drop shadow for cities */}
          <filter id="city-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Background image */}
        <image
          href={europeMapImage}
          x="0"
          y="0"
          width="800"
          height="550"
          preserveAspectRatio="xMidYMid slice"
        />
        
        {/* Routes */}
        <g className="routes">
          {routes.map((route) => {
            const { path, segments, startPos, endPos } = getRoutePath(route, cities, routes);
            const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
            const isSelected = selectedRoute === route.id;
            const isClaimed = !!route.claimedBy;
            const isClaimable = !isClaimed && canClaimRoute(route.id);
            
            // Find claiming player for color
            const claimingPlayer = isClaimed && gameState
              ? gameState.players.find(p => p.id === route.claimedBy)
              : null;
            
            const playerColor = claimingPlayer ? PLAYER_COLORS[claimingPlayer.color] : null;
            
            return (
              <g 
                key={route.id}
                className={`route-segment ${isClaimable ? 'cursor-pointer' : ''} ${!isClaimed ? 'route-hoverable' : ''}`}
                onClick={() => !isClaimed && onRouteClick?.(route.id)}
              >
                {isClaimed && playerColor ? (
                  // Claimed route - show as dashed line in player color
                  <>
                    {/* Outer glow/shadow for visibility */}
                    <path
                      d={path}
                      stroke="hsl(0 0% 0% / 0.4)"
                      strokeWidth={12}
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* White outline for contrast */}
                    <path
                      d={path}
                      stroke="hsl(0 0% 100% / 0.8)"
                      strokeWidth={10}
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Player colored dashed line */}
                    <path
                      d={path}
                      stroke={playerColor}
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="12 6"
                      filter="url(#claimed-glow)"
                      className="claimed-route-line"
                    />
                    {/* Start and end markers */}
                    <circle
                      cx={startPos.x}
                      cy={startPos.y}
                      r={5}
                      fill={playerColor}
                      stroke="white"
                      strokeWidth={2}
                    />
                    <circle
                      cx={endPos.x}
                      cy={endPos.y}
                      r={5}
                      fill={playerColor}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </>
                ) : (
                  // Unclaimed route - show wagon slots
                  <>
                    {/* Route background line - dimmed for unclaimed */}
                    <path
                      d={path}
                      stroke={isSelected ? 'hsl(43 80% 50%)' : 'hsl(30 30% 40%)'}
                      strokeWidth={isSelected ? 14 : 10}
                      fill="none"
                      strokeLinecap="round"
                      opacity={isSelected ? 1 : 0.3}
                    />
                    
                    {/* Individual train car slots */}
                    {segments.map((seg, i) => (
                      <g 
                        key={i} 
                        transform={`translate(${seg.x}, ${seg.y}) rotate(${seg.angle})`}
                        className="wagon-slot"
                      >
                        {/* Slot background */}
                        <rect
                          x={-12}
                          y={-5}
                          width={24}
                          height={10}
                          rx={2}
                          fill={color}
                          stroke="hsl(30 30% 50%)"
                          strokeWidth={1.5}
                          opacity={0.9}
                          className="wagon-rect"
                        />
                        
                        {/* Tunnel indicator */}
                        {route.isTunnel && (
                          <rect
                            x={-12}
                            y={-5}
                            width={24}
                            height={10}
                            rx={2}
                            fill="none"
                            stroke="hsl(30 20% 30%)"
                            strokeWidth={1}
                            strokeDasharray="4 2"
                          />
                        )}
                        
                        {/* Ferry locomotive indicator */}
                        {route.ferryLocomotives && route.ferryLocomotives > 0 && i < route.ferryLocomotives && (
                          <text
                            x={0}
                            y={4}
                            textAnchor="middle"
                            fontSize="8"
                            fill="hsl(30 20% 30%)"
                            fontWeight="bold"
                          >
                            🚂
                          </text>
                        )}
                      </g>
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
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Cities */}
        <g className="cities">
          {cities.map((city) => (
            <g 
              key={city.id}
              onClick={() => onCityClick?.(city.id)}
            >
              {/* City circle */}
              <circle
                cx={city.x}
                cy={city.y}
                r={8}
                fill="hsl(40 35% 92%)"
                stroke="hsl(30 50% 30%)"
                strokeWidth={2}
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Inner circle */}
              <circle
                cx={city.x}
                cy={city.y}
                r={4}
                fill="hsl(30 60% 40%)"
                style={{ pointerEvents: 'none' }}
              />
              
              {/* City name - only shown when toggled */}
              {showCityNames && (
                <>
                  <rect
                    x={city.x - 30}
                    y={city.y + 10}
                    width={60}
                    height={14}
                    rx={2}
                    fill="hsl(30 20% 15% / 0.85)"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={city.x}
                    y={city.y + 20}
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
                    {city.name}
                  </text>
                </>
              )}
            </g>
          ))}
        </g>
        
        {/* Score legend */}
        <g transform="translate(20, 60)">
          <rect
            x={0}
            y={0}
            width={80}
            height={100}
            rx={4}
            fill="hsl(40 30% 92%)"
            stroke="hsl(30 40% 50%)"
            strokeWidth={2}
          />
          <text x={40} y={18} textAnchor="middle" fontSize="10" fontWeight="bold" fill="hsl(30 40% 25%)">
            ОЧКИ
          </text>
          {[
            { length: 1, points: 1 },
            { length: 2, points: 2 },
            { length: 3, points: 4 },
            { length: 4, points: 7 },
            { length: 5, points: 10 },
            { length: 6, points: 15 },
          ].map((item, i) => (
            <text 
              key={item.length} 
              x={40} 
              y={35 + i * 11} 
              textAnchor="middle" 
              fontSize="9" 
              fill="hsl(30 30% 35%)"
            >
              {item.length} → {item.points}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};
