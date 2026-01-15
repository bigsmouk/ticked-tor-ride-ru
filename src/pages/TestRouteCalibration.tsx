import React, { useState, useRef, useCallback } from 'react';
import { TEST_CITIES, TEST_ROUTES } from '@/data/testMap';
import testMapBg from '@/assets/test-map-bg.jpg';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Bright route colors
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

interface WagonPosition {
  x: number;
  y: number;
  angle: number;
}

const getCityPosition = (cityId: string): { x: number; y: number } => {
  const city = TEST_CITIES.find(c => c.id === cityId);
  return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
};

const getDefaultWagons = (route: typeof TEST_ROUTES[0]): WagonPosition[] => {
  const startCity = getCityPosition(route.from);
  const endCity = getCityPosition(route.to);
  
  const hasParallel = route.parallel !== undefined;
  const defaultOffset = hasParallel ? (route.parallel === 1 ? 15 : -15) : 0;
  
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

const TestRouteCalibration = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCities, setShowCities] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routeWagons, setRouteWagons] = useState<Record<string, WagonPosition[]>>({});
  const [dragging, setDragging] = useState<{ routeId: string; wagonIndex: number } | null>(null);
  const [rotatingWagon, setRotatingWagon] = useState<{ routeId: string; wagonIndex: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMouseSVGPos = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * 1920),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 1440),
    };
  }, []);

  const getWagons = (route: typeof TEST_ROUTES[0]): WagonPosition[] => {
    return routeWagons[route.id] || getDefaultWagons(route);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getMouseSVGPos(e);
    setMousePos(pos);

    if (dragging) {
      const route = TEST_ROUTES.find(r => r.id === dragging.routeId);
      if (!route) return;

      setRouteWagons(prev => {
        const existing = prev[dragging.routeId] || getDefaultWagons(route);
        const newWagons = [...existing];
        newWagons[dragging.wagonIndex] = {
          ...newWagons[dragging.wagonIndex],
          x: pos.x,
          y: pos.y,
        };
        return {
          ...prev,
          [dragging.routeId]: newWagons,
        };
      });
    }

    if (rotatingWagon) {
      const route = TEST_ROUTES.find(r => r.id === rotatingWagon.routeId);
      if (!route) return;

      const wagons = routeWagons[rotatingWagon.routeId] || getDefaultWagons(route);
      const wagon = wagons[rotatingWagon.wagonIndex];
      const angle = Math.atan2(pos.y - wagon.y, pos.x - wagon.x) * 180 / Math.PI;

      setRouteWagons(prev => {
        const existing = prev[rotatingWagon.routeId] || getDefaultWagons(route);
        const newWagons = [...existing];
        newWagons[rotatingWagon.wagonIndex] = {
          ...newWagons[rotatingWagon.wagonIndex],
          angle: Math.round(angle),
        };
        return {
          ...prev,
          [rotatingWagon.routeId]: newWagons,
        };
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setRotatingWagon(null);
  };

  const copyCoordinates = () => {
    const output: string[] = ['// Test route wagon positions - paste into testMap.ts'];
    output.push('export const TEST_ROUTE_WAGON_POSITIONS: Record<string, { x: number; y: number; angle: number }[]> = {');
    
    Object.entries(routeWagons).forEach(([routeId, wagons]) => {
      const wagonsStr = wagons.map(w => `{ x: ${w.x}, y: ${w.y}, angle: ${w.angle} }`).join(', ');
      output.push(`  '${routeId}': [${wagonsStr}],`);
    });
    
    output.push('};');
    
    navigator.clipboard.writeText(output.join('\n'));
    toast.success(`Скопировано ${Object.keys(routeWagons).length} маршрутов!`);
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
          <h1 className="text-xl font-bold">🚃 Калибровка вагонов (Тестовая карта)</h1>
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
            <div className="bg-amber-800 px-3 py-1 rounded text-sm">
              Изменено: {modifiedCount}
            </div>
            <Button size="sm" variant="outline" onClick={resetAll}>
              Сбросить всё
            </Button>
            <Button size="sm" onClick={copyCoordinates}>
              📋 Копировать все
            </Button>
            <a href="/test-calibration" className="text-blue-400 hover:underline text-sm">
              → Калибровка городов
            </a>
          </div>
        </div>

        <div className="mb-2 text-stone-400 text-sm">
          💡 Кликните на маршрут → перетащите вагоны (зелёные) | Shift+клик на вагон для поворота | viewBox: 1920×1440
        </div>
        
        <div className="bg-stone-800 rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 1920 1440"
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <image
              href={testMapBg}
              x="0"
              y="0"
              width="1920"
              height="1440"
              preserveAspectRatio="xMidYMid meet"
            />
            
            {/* Routes */}
            {showRoutes && TEST_ROUTES.map((route) => {
              const wagons = getWagons(route);
              const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
              const isSelected = selectedRoute === route.id;
              const isModified = !!routeWagons[route.id];
              
              const borderColor = isSelected ? '#22c55e' : isModified ? '#f59e0b' : '#666';
              
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
                      strokeWidth={2}
                      fill="none"
                      opacity={0.5}
                      strokeDasharray="8 4"
                    />
                  )}
                  
                  {/* Train car slots */}
                  {wagons.map((wagon, i) => (
                    <g 
                      key={i} 
                      transform={`translate(${wagon.x}, ${wagon.y}) rotate(${wagon.angle})`}
                    >
                      <rect
                        x={-24}
                        y={-10}
                        width={48}
                        height={20}
                        rx={4}
                        fill={color}
                        stroke={borderColor}
                        strokeWidth={isSelected ? 3 : 2}
                        opacity={0.9}
                      />
                      {route.type === 'tunnel' && (
                        <rect
                          x={-24}
                          y={-10}
                          width={48}
                          height={20}
                          rx={4}
                          fill="none"
                          stroke="#000"
                          strokeWidth={2}
                          strokeDasharray="8 4"
                        />
                      )}
                      {route.ferryLocomotives && route.ferryLocomotives > 0 && i < route.ferryLocomotives && (
                        <text
                          x={0}
                          y={6}
                          textAnchor="middle"
                          fontSize="14"
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
                            r={10}
                            fill="#22c55e"
                            stroke="white"
                            strokeWidth={3}
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
                            x1={24}
                            y1={0}
                            x2={36}
                            y2={0}
                            stroke="#22c55e"
                            strokeWidth={3}
                          />
                        </>
                      )}
                    </g>
                  ))}
                </g>
              );
            })}
            
            {/* Cities */}
            {showCities && TEST_CITIES.map((city) => (
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
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                  style={{ textShadow: '2px 2px 4px black', pointerEvents: 'none' }}
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
                    const route = TEST_ROUTES.find(r => r.id === selectedRoute);
                    if (!route) return null;
                    const city1 = TEST_CITIES.find(c => c.id === route.from);
                    const city2 = TEST_CITIES.find(c => c.id === route.to);
                    return (
                      <>
                        {city1?.name} → {city2?.name} | Длина: {route.length} | Цвет: {route.color}
                        {route.type === 'tunnel' && ' | Туннель'}
                        {route.type === 'ferry' && ` | Паром${route.ferryLocomotives ? `: ${route.ferryLocomotives}🚂` : ''}`}
                        {route.parallel !== undefined && ` | Параллельный: ${route.parallel}`}
                      </>
                    );
                  })()}
                </div>
                {routeWagons[selectedRoute] && (
                  <div className="text-xs text-amber-400 mt-2 font-mono">
                    {routeWagons[selectedRoute].map((w, i) => (
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
        
        {/* Route list */}
        <div className="mt-4 bg-stone-800 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h2 className="text-white font-bold mb-2">Все маршруты ({TEST_ROUTES.length}):</h2>
          <div className="grid grid-cols-3 gap-2 text-xs text-stone-300">
            {TEST_ROUTES.map((route) => {
              const city1 = TEST_CITIES.find(c => c.id === route.from);
              const city2 = TEST_CITIES.find(c => c.id === route.to);
              const isModified = !!routeWagons[route.id];
              return (
                <div 
                  key={route.id}
                  className={`px-2 py-1 rounded cursor-pointer hover:bg-stone-700 ${
                    selectedRoute === route.id ? 'bg-green-900 text-green-300' : 
                    isModified ? 'bg-amber-900 text-amber-300' : ''
                  }`}
                  onClick={() => setSelectedRoute(route.id)}
                >
                  {city1?.name} → {city2?.name} ({route.length})
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRouteCalibration;
