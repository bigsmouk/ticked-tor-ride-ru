import React, { useState, useRef, useCallback } from 'react';
import { EUROPE_CITIES, EUROPE_ROUTES, ROUTE_WAGON_POSITIONS } from '@/data/europeMap';
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

interface WagonPosition {
  x: number;
  y: number;
  angle: number;
}

interface RouteWagons {
  wagons: WagonPosition[];
}

const getCityPosition = (cityId: string): { x: number; y: number } => {
  const city = EUROPE_CITIES.find(c => c.id === cityId);
  return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
};

const getDefaultWagons = (route: typeof EUROPE_ROUTES[0]): WagonPosition[] => {
  // First check if we have saved positions
  const savedPositions = ROUTE_WAGON_POSITIONS[route.id];
  if (savedPositions && savedPositions.length === route.length) {
    return savedPositions;
  }
  
  // Otherwise calculate default positions
  const startCity = getCityPosition(route.cities[0]);
  const endCity = getCityPosition(route.cities[1]);
  
  const hasParallel = route.parallelRouteId || 
    EUROPE_ROUTES.some(r => r.parallelRouteId === route.id);
  const defaultOffset = hasParallel ? (route.parallelRouteId ? 8 : -8) : 0;
  
  const dx = endCity.x - startCity.x;
  const dy = endCity.y - startCity.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / length;
  const perpY = dx / length;
  
  const startX = startCity.x + perpX * defaultOffset;
  const startY = startCity.y + perpY * defaultOffset;
  const endX = endCity.x + perpX * defaultOffset;
  const endY = endCity.y + perpY * defaultOffset;
  
  const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  
  const wagons: WagonPosition[] = [];
  for (let i = 0; i < route.length; i++) {
    const t = (i + 0.5) / route.length;
    wagons.push({
      x: Math.round(startX + (endX - startX) * t),
      y: Math.round(startY + (endY - startY) * t),
      angle: Math.round(angle),
    });
  }
  
  return wagons;
};

// Check if route has been calibrated
const isRouteCalibrated = (routeId: string): boolean => {
  const route = EUROPE_ROUTES.find(r => r.id === routeId);
  if (!route) return false;
  const saved = ROUTE_WAGON_POSITIONS[routeId];
  return saved !== undefined && saved.length === route.length;
};

const RouteCalibration = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCities, setShowCities] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showOnlyUncalibrated, setShowOnlyUncalibrated] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routeWagons, setRouteWagons] = useState<Record<string, RouteWagons>>({});
  const [dragging, setDragging] = useState<{ routeId: string; wagonIndex: number } | null>(null);
  const [rotatingWagon, setRotatingWagon] = useState<{ routeId: string; wagonIndex: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMouseSVGPos = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * 800),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 550),
    };
  }, []);

  const getWagons = (route: typeof EUROPE_ROUTES[0]): WagonPosition[] => {
    return routeWagons[route.id]?.wagons || getDefaultWagons(route);
  };

  // Count stats
  const calibratedCount = EUROPE_ROUTES.filter(r => isRouteCalibrated(r.id)).length;
  const uncalibratedCount = EUROPE_ROUTES.length - calibratedCount;
  const filteredRoutes = showOnlyUncalibrated 
    ? EUROPE_ROUTES.filter(r => !isRouteCalibrated(r.id))
    : EUROPE_ROUTES;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getMouseSVGPos(e);
    setMousePos(pos);

    if (dragging) {
      const route = EUROPE_ROUTES.find(r => r.id === dragging.routeId);
      if (!route) return;

      setRouteWagons(prev => {
        const existing = prev[dragging.routeId]?.wagons || getDefaultWagons(route);
        const newWagons = [...existing];
        newWagons[dragging.wagonIndex] = {
          ...newWagons[dragging.wagonIndex],
          x: pos.x,
          y: pos.y,
        };
        return {
          ...prev,
          [dragging.routeId]: { wagons: newWagons },
        };
      });
    }

    if (rotatingWagon) {
      const route = EUROPE_ROUTES.find(r => r.id === rotatingWagon.routeId);
      if (!route) return;

      const wagons = routeWagons[rotatingWagon.routeId]?.wagons || getDefaultWagons(route);
      const wagon = wagons[rotatingWagon.wagonIndex];
      const angle = Math.atan2(pos.y - wagon.y, pos.x - wagon.x) * 180 / Math.PI;

      setRouteWagons(prev => {
        const existing = prev[rotatingWagon.routeId]?.wagons || getDefaultWagons(route);
        const newWagons = [...existing];
        newWagons[rotatingWagon.wagonIndex] = {
          ...newWagons[rotatingWagon.wagonIndex],
          angle: Math.round(angle),
        };
        return {
          ...prev,
          [rotatingWagon.routeId]: { wagons: newWagons },
        };
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setRotatingWagon(null);
  };

  const copyCoordinates = () => {
    const output: string[] = ['// Route wagon positions - paste into europeMap.ts'];
    output.push('export const ROUTE_WAGON_POSITIONS: Record<string, { x: number; y: number; angle: number }[]> = {');
    
    // Include both existing saved positions and modified ones
    const allPositions: Record<string, WagonPosition[]> = { ...ROUTE_WAGON_POSITIONS };
    
    // Override with modified positions
    Object.entries(routeWagons).forEach(([routeId, data]) => {
      allPositions[routeId] = data.wagons;
    });
    
    Object.entries(allPositions).forEach(([routeId, wagons]) => {
      const wagonsStr = wagons.map(w => `{ x: ${w.x}, y: ${w.y}, angle: ${w.angle} }`).join(', ');
      output.push(`  '${routeId}': [${wagonsStr}],`);
    });
    
    output.push('};');
    
    navigator.clipboard.writeText(output.join('\n'));
    toast.success(`Скопировано ${Object.keys(allPositions).length} маршрутов!`);
  };

  const resetRoute = (routeId: string) => {
    setRouteWagons(prev => {
      const newWagons = { ...prev };
      delete newWagons[routeId];
      return newWagons;
    });
  };

  const resetAll = () => {
    setRouteWagons({});
    toast.success('Все позиции сброшены');
  };

  const modifiedCount = Object.keys(routeWagons).length;

  return (
    <div className="min-h-screen bg-stone-900 p-4" onMouseUp={handleMouseUp}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white flex-wrap gap-2">
          <h1 className="text-xl font-bold">Калибровка вагонов</h1>
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
            <label className="flex items-center gap-2 text-sm text-amber-400">
              <input 
                type="checkbox" 
                checked={showOnlyUncalibrated} 
                onChange={(e) => setShowOnlyUncalibrated(e.target.checked)}
              />
              Только некалиброванные ({uncalibratedCount})
            </label>
            <div className="bg-stone-800 px-3 py-1 rounded font-mono text-sm">
              x={mousePos.x}, y={mousePos.y}
            </div>
            <div className="bg-green-800 px-3 py-1 rounded text-sm">
              ✓ Откалибровано: {calibratedCount}
            </div>
            <div className="bg-stone-700 px-3 py-1 rounded text-sm">
              Изменено: {modifiedCount}
            </div>
            <Button size="sm" variant="outline" onClick={resetAll}>
              Сбросить всё
            </Button>
            <Button size="sm" onClick={copyCoordinates}>
              📋 Копировать все
            </Button>
          </div>
        </div>

        <div className="mb-2 text-stone-400 text-sm">
          💡 Кликните на маршрут → перетащите вагоны (зелёные) | Shift+клик на вагон для поворота | 
          <span className="text-green-400 ml-2">Зелёная рамка = откалиброван</span>
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
            {showRoutes && filteredRoutes.map((route) => {
              const wagons = getWagons(route);
              const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
              const isSelected = selectedRoute === route.id;
              const isModified = !!routeWagons[route.id];
              const isCalibrated = isRouteCalibrated(route.id);
              
              // Determine border color: selected > modified > calibrated > default
              const borderColor = isSelected ? '#22c55e' : isModified ? '#f59e0b' : isCalibrated ? '#10b981' : '#666';
              
              return (
                <g 
                  key={route.id}
                  onClick={(e) => {
                    if (!(e.target as Element).classList.contains('wagon-handle')) {
                      setSelectedRoute(isSelected ? null : route.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Connection line between wagons */}
                  {wagons.length > 1 && (
                    <path
                      d={`M ${wagons.map(w => `${w.x} ${w.y}`).join(' L ')}`}
                      stroke={borderColor}
                      strokeWidth={1}
                      fill="none"
                      opacity={0.5}
                      strokeDasharray="4 2"
                    />
                  )}
                  
                  {/* Train car slots */}
                  {wagons.map((wagon, i) => (
                    <g 
                      key={i} 
                      transform={`translate(${wagon.x}, ${wagon.y}) rotate(${wagon.angle})`}
                    >
                      <rect
                        x={-12}
                        y={-5}
                        width={24}
                        height={10}
                        rx={2}
                        fill={color}
                        stroke={borderColor}
                        strokeWidth={isSelected ? 2 : isCalibrated ? 1.5 : 1}
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
                      
                      {/* Drag handle for selected route */}
                      {isSelected && (
                        <>
                          {/* Center drag handle */}
                          <circle
                            className="wagon-handle"
                            cx={0}
                            cy={0}
                            r={6}
                            fill="#22c55e"
                            stroke="white"
                            strokeWidth={2}
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              if (e.shiftKey) {
                                setRotatingWagon({ routeId: route.id, wagonIndex: i });
                              } else {
                                setDragging({ routeId: route.id, wagonIndex: i });
                              }
                            }}
                          />
                          {/* Rotation indicator */}
                          <line
                            x1={12}
                            y1={0}
                            x2={18}
                            y2={0}
                            stroke="#22c55e"
                            strokeWidth={2}
                          />
                        </>
                      )}
                    </g>
                  ))}
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
                    const calibrated = isRouteCalibrated(selectedRoute);
                    return (
                      <>
                        {city1?.name} → {city2?.name} | Длина: {route.length} | Цвет: {route.color}
                        {route.isTunnel && ' | Туннель'}
                        {route.ferryLocomotives && ` | Паром: ${route.ferryLocomotives}`}
                        {calibrated && <span className="text-green-400 ml-2">✓ Откалиброван</span>}
                      </>
                    );
                  })()}
                </div>
                {(routeWagons[selectedRoute] || ROUTE_WAGON_POSITIONS[selectedRoute]) && (
                  <div className="text-xs text-amber-400 mt-2 font-mono">
                    {(routeWagons[selectedRoute]?.wagons || ROUTE_WAGON_POSITIONS[selectedRoute])?.map((w, i) => (
                      <span key={i} className="mr-3">
                        [{i}] x:{w.x} y:{w.y} ∠{w.angle}°
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => resetRoute(selectedRoute)}>
                Сбросить
              </Button>
            </div>
          </div>
        )}
        
        {/* Uncalibrated routes list */}
        {uncalibratedCount > 0 && (
          <div className="mt-4 bg-stone-800 rounded-lg p-4">
            <h2 className="text-white font-bold mb-2">Некалиброванные маршруты ({uncalibratedCount}):</h2>
            <div className="grid grid-cols-4 gap-2 text-xs text-red-300">
              {EUROPE_ROUTES.filter(r => !isRouteCalibrated(r.id)).map((route) => {
                const city1 = EUROPE_CITIES.find(c => c.id === route.cities[0]);
                const city2 = EUROPE_CITIES.find(c => c.id === route.cities[1]);
                return (
                  <div 
                    key={route.id}
                    className={`px-2 py-1 rounded cursor-pointer hover:bg-stone-600 ${selectedRoute === route.id ? 'bg-green-900' : 'bg-stone-700'}`}
                    onClick={() => setSelectedRoute(route.id)}
                  >
                    {city1?.name} → {city2?.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Modified routes list */}
        {modifiedCount > 0 && (
          <div className="mt-4 bg-stone-800 rounded-lg p-4">
            <h2 className="text-white font-bold mb-2">Изменённые маршруты ({modifiedCount}):</h2>
            <div className="grid grid-cols-3 gap-2 text-xs text-amber-300">
              {Object.entries(routeWagons).map(([routeId]) => {
                const route = EUROPE_ROUTES.find(r => r.id === routeId);
                const city1 = route ? EUROPE_CITIES.find(c => c.id === route.cities[0]) : null;
                const city2 = route ? EUROPE_CITIES.find(c => c.id === route.cities[1]) : null;
                return (
                  <div 
                    key={routeId}
                    className={`px-2 py-1 rounded cursor-pointer hover:bg-stone-600 ${selectedRoute === routeId ? 'bg-green-900' : 'bg-stone-700'}`}
                    onClick={() => setSelectedRoute(routeId)}
                  >
                    {city1?.name} → {city2?.name}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteCalibration;
