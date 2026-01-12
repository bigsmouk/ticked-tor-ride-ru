import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PlayerColor } from '@/types/game';
import { 
  TestCity, 
  TestRoute, 
  TEST_CITIES, 
  TEST_ROUTES, 
  getTestCity, 
  getParallelOffset 
} from '@/data/testMap';
import testMapBg from '@/assets/test-map-bg.jpg';
// Route state interface
export interface TestRouteState {
  claimedBy?: string;
  claimedByColor?: PlayerColor;
  selectable?: boolean;
  disabled?: boolean;
  highlighted?: boolean;
}

interface TestMapProps {
  routeStates?: Record<string, TestRouteState>;
  onRouteClick?: (routeId: string) => void;
  onCityClick?: (cityId: string) => void;
  selectedRouteId?: string | null;
}

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

// Calculate segments along a route
const calculateSegments = (
  route: TestRoute,
  offset: number
): { x: number; y: number; angle: number }[] => {
  const startCity = getTestCity(route.from);
  const endCity = getTestCity(route.to);
  if (!startCity || !endCity) return [];

  const dx = endCity.x - startCity.x;
  const dy = endCity.y - startCity.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Perpendicular vector for offset
  const perpX = -dy / length;
  const perpY = dx / length;
  
  const startX = startCity.x + perpX * offset;
  const startY = startCity.y + perpY * offset;
  const endX = endCity.x + perpX * offset;
  const endY = endCity.y + perpY * offset;
  
  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  
  const segments: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < route.length; i++) {
    const t = (i + 0.5) / route.length;
    segments.push({
      x: startX + (endX - startX) * t,
      y: startY + (endY - startY) * t,
      angle,
    });
  }
  
  return segments;
};

// Tooltip component
const RouteTooltip: React.FC<{
  route: TestRoute;
  position: { x: number; y: number };
}> = ({ route, position }) => {
  const fromCity = getTestCity(route.from);
  const toCity = getTestCity(route.to);
  
  return (
    <div 
      className="absolute z-50 pointer-events-none bg-background/95 border border-border rounded-lg px-3 py-2 shadow-lg text-sm"
      style={{
        left: position.x,
        top: position.y - 60,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="font-bold text-foreground">
        {fromCity?.name} — {toCity?.name}
      </div>
      <div className="text-muted-foreground text-xs flex gap-2 mt-1">
        <span>Длина: {route.length}</span>
        <span>•</span>
        <span className="capitalize">{route.color === 'gray' ? 'Любой' : route.color}</span>
        {route.type === 'tunnel' && <span>• 🚇 Туннель</span>}
        {route.type === 'ferry' && <span>• ⛵ Паром ({route.ferryLocomotives}🚂)</span>}
      </div>
    </div>
  );
};

export const TestMap: React.FC<TestMapProps> = ({
  routeStates = {},
  onRouteClick,
  onCityClick,
  selectedRouteId,
}) => {
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCityNames, setShowCityNames] = useState(true);
  const [hoveredRoute, setHoveredRoute] = useState<TestRoute | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3;
  
  // Pre-calculate route segments
  const routeSegments = useMemo(() => {
    const segments: Record<string, { x: number; y: number; angle: number }[]> = {};
    for (const route of TEST_ROUTES) {
      const offset = getParallelOffset(route, TEST_ROUTES);
      segments[route.id] = calculateSegments(route, offset);
    }
    return segments;
  }, []);
  
  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * delta)));
  }, []);
  
  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
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
  
  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);
  
  // Handle route hover
  const handleRouteHover = useCallback((route: TestRoute | null, e?: React.MouseEvent) => {
    setHoveredRoute(route);
    if (route && e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-50"
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
      
      {/* Info badge */}
      <div className="absolute top-4 left-4 z-10 bg-background/90 border border-border rounded px-3 py-2">
        <div className="text-xs font-bold text-primary">🧪 Тестовая карта</div>
        <div className="text-xs text-muted-foreground">1920×1080 • {TEST_CITIES.length} городов</div>
      </div>
      
      {/* Tooltip */}
      {hoveredRoute && (
        <RouteTooltip route={hoveredRoute} position={tooltipPosition} />
      )}
      
      <svg
        viewBox="0 0 1920 1080"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <defs>
          {/* Tunnel pattern */}
          <pattern id="test-tunnel-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="8" height="16" fill="currentColor" />
          </pattern>
          
          {/* Glow filter */}
          <filter id="test-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Hover glow */}
          <filter id="test-hover-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feFlood floodColor="#fbbf24" floodOpacity="0.6"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* City shadow */}
          <filter id="test-city-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
          
          {/* Claimed route glow */}
          <filter id="test-claimed-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background image */}
        <image
          href={testMapBg}
          x="0"
          y="0"
          width="1920"
          height="1080"
          preserveAspectRatio="xMidYMid slice"
        />
        
        {/* Routes layer */}
        <g className="routes-layer">
          {TEST_ROUTES.map((route) => {
            const segments = routeSegments[route.id] || [];
            const routeState = routeStates[route.id] || {};
            const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
            const isSelected = selectedRouteId === route.id;
            const isClaimed = !!routeState.claimedBy;
            const isHovered = hoveredRoute?.id === route.id;
            const isSelectable = routeState.selectable && !isClaimed;
            const isDisabled = routeState.disabled;
            const isHighlighted = routeState.highlighted;
            
            // Get start and end positions for line
            const startCity = getTestCity(route.from);
            const endCity = getTestCity(route.to);
            if (!startCity || !endCity) return null;
            
            const offset = getParallelOffset(route, TEST_ROUTES);
            const dx = endCity.x - startCity.x;
            const dy = endCity.y - startCity.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / length;
            const perpY = dx / length;
            
            const startX = startCity.x + perpX * offset;
            const startY = startCity.y + perpY * offset;
            const endX = endCity.x + perpX * offset;
            const endY = endCity.y + perpY * offset;
            
            const claimedColor = routeState.claimedByColor 
              ? PLAYER_COLORS[routeState.claimedByColor] 
              : undefined;
            
            return (
              <g 
                key={route.id}
                className={`route-group ${isSelectable ? 'cursor-pointer route-claimable' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                onMouseEnter={(e) => handleRouteHover(route, e)}
                onMouseLeave={() => handleRouteHover(null)}
                onClick={() => !isClaimed && !isDisabled && onRouteClick?.(route.id)}
              >
                {/* Invisible hit area */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="transparent"
                  strokeWidth={40}
                  strokeLinecap="round"
                  style={{ cursor: isSelectable ? 'pointer' : undefined }}
                />
                
                {isClaimed && claimedColor ? (
                  // Claimed route - show as dashed line through all wagon segments
                  (() => {
                    // Build path through cities and all wagon segments
                    const allPoints = [
                      { x: startX, y: startY },
                      ...segments.map(s => ({ x: s.x, y: s.y })),
                      { x: endX, y: endY }
                    ];
                    const pathD = allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    
                    return (
                      <>
                        {/* Outer glow/shadow for visibility */}
                        <path
                          d={pathD}
                          stroke="rgba(0,0,0,0.4)"
                          strokeWidth={20}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* White outline for contrast */}
                        <path
                          d={pathD}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={16}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Player colored dashed line */}
                        <path
                          d={pathD}
                          stroke={claimedColor}
                          strokeWidth={10}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="24 12"
                          filter="url(#test-claimed-glow)"
                          className="claimed-route-line"
                        />
                        {/* Start and end markers */}
                        <circle
                          cx={startX}
                          cy={startY}
                          r={8}
                          fill={claimedColor}
                          stroke="white"
                          strokeWidth={3}
                        />
                        <circle
                          cx={endX}
                          cy={endY}
                          r={8}
                          fill={claimedColor}
                          stroke="white"
                          strokeWidth={3}
                        />
                      </>
                    );
                  })()
                ) : (
                  // Unclaimed route - show wagon slots
                  <>
                    {/* Pulsing highlight for selectable routes */}
                    {(() => {
                      // Build path through cities and all wagon segments
                      const allPoints = [
                        { x: startX, y: startY },
                        ...segments.map(s => ({ x: s.x, y: s.y })),
                        { x: endX, y: endY }
                      ];
                      const pathD = allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      
                      return (
                        <>
                          {/* Pulsing highlight for selectable routes */}
                          {isSelectable && (
                            <path
                              d={pathD}
                              stroke="#fbbf24"
                              strokeWidth={22}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="route-claimable-line"
                            />
                          )}
                          
                          {/* Route background line */}
                          <path
                            d={pathD}
                            stroke={isSelected || isHighlighted ? '#fbbf24' : '#78716c'}
                            strokeWidth={isSelected || isHighlighted ? 20 : 16}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={isSelected || isHighlighted ? 1 : isSelectable ? 0.6 : 0.5}
                            filter={isHovered ? 'url(#test-hover-glow)' : undefined}
                          />
                          
                          {/* Tunnel/Ferry indicator on the line */}
                          {route.type === 'tunnel' && (
                            <path
                              d={pathD}
                              stroke={color}
                              strokeWidth={12}
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="20 10"
                              opacity={0.8}
                            />
                          )}
                        </>
                      );
                    })()}
                    
                    {/* Individual wagon segments */}
                    {segments.map((seg, i) => {
                      const segmentWidth = 48;
                      const segmentHeight = 20;
                      
                      return (
                        <g 
                          key={i} 
                          transform={`translate(${seg.x}, ${seg.y}) rotate(${seg.angle})`}
                          className="wagon-unclaimed"
                        >
                          {/* Wagon slot background */}
                          <rect
                            x={-segmentWidth / 2}
                            y={-segmentHeight / 2}
                            width={segmentWidth}
                            height={segmentHeight}
                            rx={4}
                            fill={color}
                            stroke="#78716c"
                            strokeWidth={2}
                            opacity={0.9}
                          />
                          
                          {/* Ferry locomotive indicator */}
                          {route.type === 'ferry' && route.ferryLocomotives && i < route.ferryLocomotives && (
                            <text
                              x={0}
                              y={4}
                              textAnchor="middle"
                              fontSize={12}
                              fill="#000"
                            >
                              🚂
                            </text>
                          )}
                          
                          {/* Tunnel indicator */}
                          {route.type === 'tunnel' && i === 0 && (
                            <text
                              x={0}
                              y={4}
                              textAnchor="middle"
                              fontSize={10}
                              fill="#000"
                            >
                              ⛰️
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Cities layer */}
        <g className="cities-layer">
          {TEST_CITIES.map((city) => (
            <g
              key={city.id}
              className="city-marker cursor-pointer"
              onClick={() => onCityClick?.(city.id)}
            >
              {/* City circle */}
              <circle
                cx={city.x}
                cy={city.y}
                r={16}
                fill="#fef3c7"
                stroke="#78716c"
                strokeWidth={3}
                filter="url(#test-city-shadow)"
              />
              <circle
                cx={city.x}
                cy={city.y}
                r={10}
                fill="#f59e0b"
              />
              
              {/* City name label */}
              {showCityNames && (
                <g transform={`translate(${city.x}, ${city.y + 28})`}>
                  {/* Text shadow/outline */}
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight="bold"
                    fill="#000"
                    stroke="#fff"
                    strokeWidth={4}
                    paintOrder="stroke"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {city.name}
                  </text>
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight="bold"
                    fill="#1f2937"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {city.name}
                  </text>
                </g>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default TestMap;
