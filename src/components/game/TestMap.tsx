import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { City, Route, PlayerColor } from '@/types/game';
import { EUROPE_CITIES, EUROPE_ROUTES, ROUTE_WAGON_POSITIONS } from '@/data/europeMap';
import { PRELOADED_MAPS } from '@/hooks/useAssetPreloader';

// Use preloaded map image
const testMapBg = PRELOADED_MAPS.test;

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

// Get city position
const getCityPosition = (cityId: string): { x: number; y: number } => {
  const city = EUROPE_CITIES.find(c => c.id === cityId);
  return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
};

// Calculate route path with calibrated positions or fallback
const getRoutePath = (route: Route): { 
  segments: { x: number; y: number; angle: number }[]; 
  startPos: { x: number; y: number }; 
  endPos: { x: number; y: number };
} => {
  const calibrated = ROUTE_WAGON_POSITIONS[route.id];
  const startCity = getCityPosition(route.cities[0]);
  const endCity = getCityPosition(route.cities[1]);
  
  if (calibrated && calibrated.length === route.length) {
    return {
      segments: calibrated.map(w => ({ x: w.x, y: w.y, angle: w.angle })),
      startPos: startCity,
      endPos: endCity,
    };
  }
  
  // Fallback calculation
  const hasParallel = route.parallelRouteId || 
    EUROPE_ROUTES.some(r => r.parallelRouteId === route.id);
  const offset = hasParallel ? (route.parallelRouteId ? 8 : -8) : 0;
  
  const dx = endCity.x - startCity.x;
  const dy = endCity.y - startCity.y;
  const length = Math.sqrt(dx * dx + dy * dy);
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
  
  return { segments, startPos: { x: startX, y: startY }, endPos: { x: endX, y: endY } };
};

// Tooltip component
const RouteTooltip: React.FC<{
  route: Route;
  position: { x: number; y: number };
}> = ({ route, position }) => {
  const fromCity = EUROPE_CITIES.find(c => c.id === route.cities[0]);
  const toCity = EUROPE_CITIES.find(c => c.id === route.cities[1]);
  
  return (
    <div 
      className="absolute z-50 pointer-events-none bg-background/95 border border-border rounded-lg px-3 py-2 shadow-lg text-sm max-w-xs"
      style={{
        left: position.x,
        top: position.y - 60,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="font-bold text-foreground flex flex-wrap">
        {fromCity?.name} — {toCity?.name}
      </div>
      <div className="text-muted-foreground text-xs flex gap-2 mt-1 flex-wrap">
        <span>Длина: {route.length}</span>
        <span>•</span>
        <span className="capitalize">{route.color === 'gray' ? 'Любой' : route.color}</span>
        {route.isTunnel && <span>• 🚇 Туннель</span>}
        {route.ferryLocomotives && <span>• ⛵ Паром ({route.ferryLocomotives}🚂)</span>}
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
  const [hoveredRoute, setHoveredRoute] = useState<Route | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  
  // Pre-calculate route paths
  const routePaths = useMemo(() => {
    const paths: Record<string, ReturnType<typeof getRoutePath>> = {};
    for (const route of EUROPE_ROUTES) {
      paths[route.id] = getRoutePath(route);
    }
    return paths;
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
  const handleRouteHover = useCallback((route: Route | null, e?: React.MouseEvent) => {
    setHoveredRoute(route);
    if (route && e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);
  
  // Segment dimensions (same as EuropeMap)
  const segmentWidth = 26;
  const segmentHeight = 12;
  
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
        <div className="text-xs font-bold text-primary">🧪 Тестовая карта (Европа)</div>
        <div className="text-xs text-muted-foreground">800×550 • {EUROPE_CITIES.length} городов</div>
      </div>
      
      {/* Tooltip */}
      {hoveredRoute && (
        <RouteTooltip route={hoveredRoute} position={tooltipPosition} />
      )}
      
      <svg
        viewBox="0 0 800 550"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <defs>
          {/* Glow filter */}
          <filter id="test-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Hover glow */}
          <filter id="test-hover-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feFlood floodColor="#fbbf24" floodOpacity="0.6"/>
            <feComposite in2="blur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* City shadow */}
          <filter id="test-city-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
          
          {/* Claimed route glow */}
          <filter id="test-claimed-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
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
          width="800"
          height="550"
          preserveAspectRatio="xMidYMid slice"
        />
        
        {/* Routes layer */}
        <g className="routes-layer">
          {EUROPE_ROUTES.map((route) => {
            const routePath = routePaths[route.id];
            if (!routePath) return null;
            
            const { segments, startPos, endPos } = routePath;
            const routeState = routeStates[route.id] || {};
            const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
            const isSelected = selectedRouteId === route.id;
            const isClaimed = !!routeState.claimedBy;
            const isHovered = hoveredRoute?.id === route.id;
            const isSelectable = routeState.selectable && !isClaimed;
            const isDisabled = routeState.disabled;
            
            const claimedColor = routeState.claimedByColor 
              ? PLAYER_COLORS[routeState.claimedByColor] 
              : undefined;
            
            // Build path through all points
            const allPoints = [startPos, ...segments.map(s => ({ x: s.x, y: s.y })), endPos];
            const pathD = allPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            
            return (
              <g 
                key={route.id}
                className={`route-group ${isSelectable ? 'cursor-pointer' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                onMouseEnter={(e) => handleRouteHover(route, e)}
                onMouseLeave={() => handleRouteHover(null)}
                onClick={() => !isClaimed && !isDisabled && onRouteClick?.(route.id)}
              >
                {/* Invisible hit area */}
                <path
                  d={pathD}
                  stroke="transparent"
                  strokeWidth={24}
                  fill="none"
                  strokeLinecap="round"
                  style={{ cursor: isSelectable ? 'pointer' : undefined, pointerEvents: 'stroke' }}
                />
                
                {isClaimed && claimedColor ? (
                  // Claimed route - show wagons
                  <>
                    {/* Outer glow */}
                    <path
                      d={pathD}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth={14}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* White outline */}
                    <path
                      d={pathD}
                      stroke="rgba(255,255,255,0.8)"
                      strokeWidth={10}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Player colored dashed line */}
                    <path
                      d={pathD}
                      stroke={claimedColor}
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="16 8"
                      filter="url(#test-claimed-glow)"
                    />
                    {/* Wagon segments */}
                    {segments.map((segment, i) => (
                      <g 
                        key={i}
                        transform={`translate(${segment.x}, ${segment.y}) rotate(${segment.angle})`}
                      >
                        <rect
                          x={-segmentWidth / 2}
                          y={-segmentHeight / 2}
                          width={segmentWidth}
                          height={segmentHeight}
                          rx={3}
                          fill={claimedColor}
                          stroke="white"
                          strokeWidth={2}
                        />
                      </g>
                    ))}
                    {/* End markers */}
                    <circle cx={startPos.x} cy={startPos.y} r={5} fill={claimedColor} stroke="white" strokeWidth={2} />
                    <circle cx={endPos.x} cy={endPos.y} r={5} fill={claimedColor} stroke="white" strokeWidth={2} />
                  </>
                ) : (
                  // Unclaimed route - show wagon slots
                  <>
                    {/* Highlight for selectable routes */}
                    {isSelectable && (
                      <path
                        d={pathD}
                        stroke="rgba(251, 191, 36, 0.4)"
                        strokeWidth={18}
                        fill="none"
                        strokeLinecap="round"
                        filter="url(#test-hover-glow)"
                      />
                    )}
                    
                    {/* Hover highlight */}
                    {isHovered && !isSelectable && (
                      <path
                        d={pathD}
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth={16}
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                    
                    {/* Wagon slots */}
                    {segments.map((segment, i) => (
                      <g 
                        key={i}
                        transform={`translate(${segment.x}, ${segment.y}) rotate(${segment.angle})`}
                        style={{ pointerEvents: 'none' }}
                      >
                        <rect
                          x={-segmentWidth / 2}
                          y={-segmentHeight / 2}
                          width={segmentWidth}
                          height={segmentHeight}
                          rx={3}
                          fill={color}
                          stroke="#78716c"
                          strokeWidth={1.5}
                          opacity={isHovered ? 1 : 0.85}
                        />
                        
                        {/* Ferry locomotive indicator */}
                        {route.ferryLocomotives && i < route.ferryLocomotives && (
                          <text x={0} y={3} textAnchor="middle" fontSize={8} fill="#000">
                            🚂
                          </text>
                        )}
                        
                        {/* Tunnel indicator on first wagon */}
                        {route.isTunnel && i === 0 && (
                          <text x={0} y={3} textAnchor="middle" fontSize={7} fill="#000">
                            ⛰️
                          </text>
                        )}
                      </g>
                    ))}
                  </>
                )}
              </g>
            );
          })}
        </g>
        
        {/* Cities layer */}
        <g className="cities-layer">
          {EUROPE_CITIES.map((city) => (
            <g
              key={city.id}
              className="city-marker"
              style={{ cursor: onCityClick ? 'pointer' : 'default' }}
              onClick={() => onCityClick?.(city.id)}
            >
              {/* City circle - fixed size, no hover change */}
              <circle
                cx={city.x}
                cy={city.y}
                r={10}
                fill="#fef3c7"
                stroke="#78716c"
                strokeWidth={2}
                filter="url(#test-city-shadow)"
                style={{ pointerEvents: 'all' }}
              />
              <circle
                cx={city.x}
                cy={city.y}
                r={6}
                fill="#f59e0b"
                style={{ pointerEvents: 'none' }}
              />
              
              {/* City name label - positioned absolutely, no transform on hover */}
              {showCityNames && (
                <text
                  x={city.x}
                  y={city.y + 18}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#1f2937"
                  stroke="#fff"
                  strokeWidth={3}
                  paintOrder="stroke"
                  style={{ 
                    fontFamily: 'system-ui, sans-serif',
                    pointerEvents: 'none',
                  }}
                >
                  {city.name}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default TestMap;
