import React, { useState, useRef, useCallback } from 'react';
import { EUROPE_CITIES, EUROPE_ROUTES } from '@/data/europeMap';
import europeMapImage from '@/assets/europe-map.jpg';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ROUTE_COLORS: Record<string, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#eab308',
  orange: '#ea580c',
  pink: '#db2777',
  white: '#f5f5f4',
  black: '#1c1917',
  gray: '#78716c',
};

interface RouteOffset {
  routeId: string;
  startOffset: { x: number; y: number };
  endOffset: { x: number; y: number };
  angle?: number; // Custom angle override
}

const getCityPosition = (cityId: string): { x: number; y: number } => {
  const city = EUROPE_CITIES.find(c => c.id === cityId);
  return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
};

const RouteCalibration = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCities, setShowCities] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routeOffsets, setRouteOffsets] = useState<Record<string, RouteOffset>>({});
  const [dragging, setDragging] = useState<{ routeId: string; point: 'start' | 'end' } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMouseSVGPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * 800),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 550),
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getMouseSVGPos(e);
    setMousePos(pos);

    if (dragging) {
      const route = EUROPE_ROUTES.find(r => r.id === dragging.routeId);
      if (!route) return;

      const cityPos = getCityPosition(dragging.point === 'start' ? route.cities[0] : route.cities[1]);
      const offset = {
        x: pos.x - cityPos.x,
        y: pos.y - cityPos.y,
      };

      setRouteOffsets(prev => {
        const existing = prev[dragging.routeId] || {
          routeId: dragging.routeId,
          startOffset: { x: 0, y: 0 },
          endOffset: { x: 0, y: 0 },
        };
        return {
          ...prev,
          [dragging.routeId]: {
            ...existing,
            [dragging.point === 'start' ? 'startOffset' : 'endOffset']: offset,
          },
        };
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const getRouteData = (route: typeof EUROPE_ROUTES[0]) => {
    const startCity = getCityPosition(route.cities[0]);
    const endCity = getCityPosition(route.cities[1]);
    
    // Get offsets
    const offsets = routeOffsets[route.id];
    const startOffset = offsets?.startOffset || { x: 0, y: 0 };
    const endOffset = offsets?.endOffset || { x: 0, y: 0 };
    
    // Check if this is a parallel route for default offset
    const hasParallel = route.parallelRouteId || 
      EUROPE_ROUTES.some(r => r.parallelRouteId === route.id);
    const defaultOffset = hasParallel ? (route.parallelRouteId ? 8 : -8) : 0;
    
    const dx = endCity.x - startCity.x;
    const dy = endCity.y - startCity.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // Apply default parallel offset + custom offset
    const startX = startCity.x + perpX * defaultOffset + startOffset.x;
    const startY = startCity.y + perpY * defaultOffset + startOffset.y;
    const endX = endCity.x + perpX * defaultOffset + endOffset.x;
    const endY = endCity.y + perpY * defaultOffset + endOffset.y;
    
    // Calculate segments
    const segments: { x: number; y: number }[] = [];
    for (let i = 0; i < route.length; i++) {
      const t = (i + 0.5) / route.length;
      segments.push({
        x: startX + (endX - startX) * t,
        y: startY + (endY - startY) * t,
      });
    }
    
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    
    return { startX, startY, endX, endY, segments, angle };
  };

  const copyCoordinates = () => {
    const output: string[] = ['// Route waypoints - paste into europeMap.ts'];
    output.push('export const ROUTE_WAYPOINTS: Record<string, { start: {x: number, y: number}, end: {x: number, y: number} }> = {');
    
    Object.entries(routeOffsets).forEach(([routeId, offset]) => {
      if (offset.startOffset.x !== 0 || offset.startOffset.y !== 0 || 
          offset.endOffset.x !== 0 || offset.endOffset.y !== 0) {
        output.push(`  '${routeId}': { start: { x: ${offset.startOffset.x}, y: ${offset.startOffset.y} }, end: { x: ${offset.endOffset.x}, y: ${offset.endOffset.y} } },`);
      }
    });
    
    output.push('};');
    
    navigator.clipboard.writeText(output.join('\n'));
    toast.success('Координаты скопированы в буфер обмена!');
  };

  const resetRoute = (routeId: string) => {
    setRouteOffsets(prev => {
      const newOffsets = { ...prev };
      delete newOffsets[routeId];
      return newOffsets;
    });
  };

  const resetAll = () => {
    setRouteOffsets({});
    toast.success('Все смещения сброшены');
  };

  const modifiedCount = Object.keys(routeOffsets).length;

  return (
    <div className="min-h-screen bg-stone-900 p-4" onMouseUp={handleMouseUp}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white flex-wrap gap-2">
          <h1 className="text-xl font-bold">Калибровка маршрутов</h1>
          <div className="flex gap-4 items-center flex-wrap">
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showCities} 
                onChange={(e) => setShowCities(e.target.checked)}
              />
              Города
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={showRoutes} 
                onChange={(e) => setShowRoutes(e.target.checked)}
              />
              Маршруты
            </label>
            <div className="bg-stone-800 px-3 py-1 rounded font-mono text-sm">
              x={mousePos.x}, y={mousePos.y}
            </div>
            <div className="bg-stone-700 px-3 py-1 rounded text-sm">
              Изменено: {modifiedCount}
            </div>
            <Button size="sm" variant="outline" onClick={resetAll}>
              Сбросить всё
            </Button>
            <Button size="sm" onClick={copyCoordinates} disabled={modifiedCount === 0}>
              📋 Копировать
            </Button>
          </div>
        </div>

        <div className="mb-2 text-stone-400 text-sm">
          💡 Кликните на маршрут для выбора, затем перетащите зелёные точки на концах для калибровки
        </div>
        
        <div className="bg-stone-800 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 800 550"
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <image
              href={europeMapImage}
              x="0"
              y="0"
              width="800"
              height="550"
              preserveAspectRatio="xMidYMid slice"
            />
            
            {/* Routes */}
            {showRoutes && EUROPE_ROUTES.map((route) => {
              const { startX, startY, endX, endY, segments, angle } = getRouteData(route);
              const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
              const isSelected = selectedRoute === route.id;
              const isModified = !!routeOffsets[route.id];
              
              return (
                <g 
                  key={route.id}
                  onClick={() => setSelectedRoute(isSelected ? null : route.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Route line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isSelected ? '#22c55e' : isModified ? '#f59e0b' : color}
                    strokeWidth={isSelected ? 4 : 2}
                    opacity={0.6}
                  />
                  
                  {/* Train car slots */}
                  {segments.map((seg, i) => (
                    <g 
                      key={i} 
                      transform={`translate(${seg.x}, ${seg.y}) rotate(${angle})`}
                    >
                      <rect
                        x={-12}
                        y={-5}
                        width={24}
                        height={10}
                        rx={2}
                        fill={color}
                        stroke={isSelected ? '#22c55e' : isModified ? '#f59e0b' : '#333'}
                        strokeWidth={isSelected ? 2 : 1}
                        opacity={0.9}
                      />
                      {route.isTunnel && (
                        <rect
                          x={-12}
                          y={-5}
                          width={24}
                          height={10}
                          rx={2}
                          fill="none"
                          stroke="#000"
                          strokeWidth={1}
                          strokeDasharray="4 2"
                        />
                      )}
                      {route.ferryLocomotives && route.ferryLocomotives > 0 && i < route.ferryLocomotives && (
                        <text
                          x={0}
                          y={4}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#000"
                        >
                          🚂
                        </text>
                      )}
                    </g>
                  ))}
                  
                  {/* Drag handles for selected route */}
                  {isSelected && (
                    <>
                      <circle
                        cx={startX}
                        cy={startY}
                        r={8}
                        fill="#22c55e"
                        stroke="white"
                        strokeWidth={2}
                        style={{ cursor: 'grab' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDragging({ routeId: route.id, point: 'start' });
                        }}
                      />
                      <circle
                        cx={endX}
                        cy={endY}
                        r={8}
                        fill="#22c55e"
                        stroke="white"
                        strokeWidth={2}
                        style={{ cursor: 'grab' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDragging({ routeId: route.id, point: 'end' });
                        }}
                      />
                    </>
                  )}
                </g>
              );
            })}
            
            {/* Cities */}
            {showCities && EUROPE_CITIES.map((city) => (
              <g key={city.id}>
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={6}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={city.x}
                  y={city.y - 10}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold"
                  style={{ textShadow: '1px 1px 2px black', pointerEvents: 'none' }}
                >
                  {city.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Selected route info */}
        {selectedRoute && (
          <div className="mt-4 bg-stone-800 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-400">{selectedRoute}</h3>
                <div className="text-sm text-stone-300 mt-1">
                  {(() => {
                    const route = EUROPE_ROUTES.find(r => r.id === selectedRoute);
                    if (!route) return null;
                    const city1 = EUROPE_CITIES.find(c => c.id === route.cities[0]);
                    const city2 = EUROPE_CITIES.find(c => c.id === route.cities[1]);
                    const offset = routeOffsets[selectedRoute];
                    return (
                      <>
                        {city1?.name} → {city2?.name} | Длина: {route.length} | Цвет: {route.color}
                        {route.isTunnel && ' | Туннель'}
                        {route.ferryLocomotives && ` | Паром: ${route.ferryLocomotives}`}
                        {offset && (
                          <span className="text-amber-400 ml-2">
                            | Смещение: start({offset.startOffset.x}, {offset.startOffset.y}) end({offset.endOffset.x}, {offset.endOffset.y})
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => resetRoute(selectedRoute)}>
                Сбросить
              </Button>
            </div>
          </div>
        )}
        
        {/* Modified routes list */}
        {modifiedCount > 0 && (
          <div className="mt-4 bg-stone-800 rounded-lg p-4">
            <h2 className="text-white font-bold mb-2">Изменённые маршруты:</h2>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-amber-300">
              {Object.entries(routeOffsets).map(([routeId, offset]) => (
                <div 
                  key={routeId}
                  className="px-2 py-1 bg-stone-700 rounded cursor-pointer hover:bg-stone-600"
                  onClick={() => setSelectedRoute(routeId)}
                >
                  {routeId}: start({offset.startOffset.x}, {offset.startOffset.y}) end({offset.endOffset.x}, {offset.endOffset.y})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteCalibration;
