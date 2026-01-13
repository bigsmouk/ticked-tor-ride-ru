import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { City, Route, PlayerColor } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { PRELOADED_MAPS } from '@/hooks/useAssetPreloader';
import { ROUTE_WAGON_POSITIONS } from '@/data/europeMap';
import { RouteSegment } from './map/RouteSegment';
import { CityMarker } from './map/CityMarker';
import { StationMarker } from './map/StationMarker';

// Use preloaded map image
const europeMapImage = PRELOADED_MAPS.europe;

interface EuropeMapProps {
  cities: City[];
  routes: Route[];
  onRouteClick?: (routeId: string) => void;
  onCityClick?: (cityId: string) => void;
  selectedRoute?: string | null;
}


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
    // Use calibrated positions - path goes through all wagon centers
    const startCity = getCityPosition(route.cities[0], cities);
    const endCity = getCityPosition(route.cities[1], cities);
    
    // Build path that goes: city -> first wagon -> ... -> last wagon -> city
    const allPoints = [
      startCity,
      ...calibrated.map(w => ({ x: w.x, y: w.y })),
      endCity
    ];
    
    const pathPoints = allPoints.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`);
    
    return {
      path: pathPoints.join(' '),
      segments: calibrated.map(w => ({ x: w.x, y: w.y, angle: w.angle })),
      startPos: startCity,
      endPos: endCity,
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
  
  // Build path through all segment centers for consistency
  const allPoints = [
    { x: startX, y: startY },
    ...segments.map(s => ({ x: s.x, y: s.y })),
    { x: endX, y: endY }
  ];
  const pathPoints = allPoints.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`);
  
  return {
    path: pathPoints.join(' '),
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
  const [showCityNames, setShowCityNames] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState<Route | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for RAF optimization
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);
  const pendingScaleRef = useRef<number | null>(null);
  
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;

  // RAF-based state updater for smooth animations
  const scheduleUpdate = useCallback(() => {
    if (rafIdRef.current !== null) return; // Already scheduled
    
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      
      if (pendingPositionRef.current !== null) {
        setPosition(pendingPositionRef.current);
        pendingPositionRef.current = null;
      }
      
      if (pendingScaleRef.current !== null) {
        setScale(pendingScaleRef.current);
        pendingScaleRef.current = null;
      }
    });
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  
  // Handle mouse wheel zoom with RAF
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    
    setScale(prev => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta));
      pendingScaleRef.current = newScale;
      scheduleUpdate();
      return prev; // Don't update immediately, let RAF handle it
    });
    
    // Actually update via RAF
    pendingScaleRef.current = Math.min(MAX_SCALE, Math.max(MIN_SCALE, (pendingScaleRef.current ?? scale) * delta));
    scheduleUpdate();
  }, [scale, scheduleUpdate]);
  
  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  }, [position]);
  
  // Handle mouse move for panning with RAF
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      pendingPositionRef.current = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      scheduleUpdate();
    }
  }, [isDragging, scheduleUpdate]);
  
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

  // Memoize route path calculations - only recalculate when routes or cities change
  const routePathsCache = useMemo(() => {
    const cache: Record<string, { path: string; segments: { x: number; y: number; angle: number }[] }> = {};
    routes.forEach(route => {
      const { path, segments } = getRoutePath(route, cities, routes);
      cache[route.id] = { path, segments };
    });
    return cache;
  }, [routes, cities]);
  
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
      
      {/* Route tooltip */}
      {hoveredRoute && !isDragging && (
        <div 
          className="absolute z-50 pointer-events-none bg-background/95 border border-border rounded-lg px-3 py-2 shadow-lg text-sm"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y - 60,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-bold text-foreground flex items-center gap-2">
            {cities.find(c => c.id === hoveredRoute.cities[0])?.name} — {cities.find(c => c.id === hoveredRoute.cities[1])?.name}
            {hoveredRoute.isTunnel && <span>🚇</span>}
            {hoveredRoute.ferryLocomotives && <span>⛵</span>}
          </div>
          <div className="text-muted-foreground text-xs flex gap-2 mt-1">
            <span>Длина: {hoveredRoute.length}</span>
            <span>•</span>
            <span className="capitalize">{hoveredRoute.color === 'gray' ? 'Любой' : hoveredRoute.color}</span>
            {hoveredRoute.isTunnel && <span>• Туннель</span>}
            {hoveredRoute.ferryLocomotives && <span>• Паром ({hoveredRoute.ferryLocomotives}🚂)</span>}
          </div>
        </div>
      )}
      
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
        
        {/* Routes - using memoized components with cached paths */}
        <g className="routes">
          {routes.map((route) => {
            const cached = routePathsCache[route.id];
            if (!cached) return null;
            
            const { path, segments } = cached;
            const isSelected = selectedRoute === route.id;
            const isClaimed = !!route.claimedBy;
            const isClaimable = !isClaimed && canClaimRoute(route.id);
            
            // Find claiming player for color
            const claimingPlayer = isClaimed && gameState
              ? gameState.players.find(p => p.id === route.claimedBy)
              : null;

            return (
              <RouteSegment
                key={route.id}
                route={route}
                path={path}
                segments={segments}
                isSelected={isSelected}
                isClaimable={isClaimable}
                claimingPlayerColor={claimingPlayer?.color || null}
                onClick={() => onRouteClick?.(route.id)}
                onMouseEnter={(e) => {
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setTooltipPosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                  setHoveredRoute(route);
                }}
                onMouseMove={(e) => {
                  if (containerRef.current && hoveredRoute) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setTooltipPosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredRoute(null)}
              />
            );
          })}
        </g>
        
        {/* Cities - using memoized components */}
        <g className="cities">
          {cities.map((city) => (
            <CityMarker
              key={city.id}
              x={city.x}
              y={city.y}
              name={city.name}
              showName={showCityNames}
              onClick={() => onCityClick?.(city.id)}
            />
          ))}
        </g>
        
        {/* Stations - displayed on top of cities */}
        <g className="stations">
          {gameState?.placedStations.map((station) => {
            const city = cities.find(c => c.id === station.cityId);
            const player = gameState.players.find(p => p.id === station.playerId);
            if (!city || !player) return null;
            
            return (
              <StationMarker
                key={`station-${station.cityId}`}
                x={city.x + 15}
                y={city.y - 10}
                playerColor={player.color}
                playerName={player.name}
              />
            );
          })}
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
