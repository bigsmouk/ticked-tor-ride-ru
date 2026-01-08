import React, { useState } from 'react';
import { EUROPE_CITIES, EUROPE_ROUTES } from '@/data/europeMap';
import europeMapImage from '@/assets/europe-map.jpg';

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

const getCityPosition = (cityId: string): { x: number; y: number } => {
  const city = EUROPE_CITIES.find(c => c.id === cityId);
  return city ? { x: city.x, y: city.y } : { x: 0, y: 0 };
};

const getRoutePath = (route: typeof EUROPE_ROUTES[0]) => {
  const start = getCityPosition(route.cities[0]);
  const end = getCityPosition(route.cities[1]);
  
  const hasParallel = route.parallelRouteId || 
    EUROPE_ROUTES.some(r => r.parallelRouteId === route.id);
  
  const offset = hasParallel ? (route.parallelRouteId ? 8 : -8) : 0;
  
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const perpX = -dy / length;
  const perpY = dx / length;
  
  const startX = start.x + perpX * offset;
  const startY = start.y + perpY * offset;
  const endX = end.x + perpX * offset;
  const endY = end.y + perpY * offset;
  
  const segments: { x: number; y: number }[] = [];
  
  for (let i = 0; i < route.length; i++) {
    const t = (i + 0.5) / route.length;
    segments.push({
      x: startX + (endX - startX) * t,
      y: startY + (endY - startY) * t,
    });
  }
  
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
  
  return { startX, startY, endX, endY, segments, angle };
};

const RouteCalibration = () => {
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showCities, setShowCities] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 550;
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  };

  return (
    <div className="min-h-screen bg-stone-900 p-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white">
          <h1 className="text-xl font-bold">Калибровка маршрутов</h1>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={showCities} 
                onChange={(e) => setShowCities(e.target.checked)}
              />
              Города
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={showRoutes} 
                onChange={(e) => setShowRoutes(e.target.checked)}
              />
              Маршруты
            </label>
            <div className="bg-stone-800 px-4 py-2 rounded font-mono">
              Курсор: x={mousePos.x}, y={mousePos.y}
            </div>
          </div>
        </div>
        
        <div className="bg-stone-800 rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 800 550"
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
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
              const { startX, startY, endX, endY, segments, angle } = getRoutePath(route);
              const color = ROUTE_COLORS[route.color] || ROUTE_COLORS.gray;
              const isHovered = hoveredRoute === route.id;
              
              return (
                <g 
                  key={route.id}
                  onMouseEnter={() => setHoveredRoute(route.id)}
                  onMouseLeave={() => setHoveredRoute(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Route line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={isHovered ? '#22c55e' : color}
                    strokeWidth={isHovered ? 4 : 2}
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
                        stroke={isHovered ? '#22c55e' : '#333'}
                        strokeWidth={isHovered ? 2 : 1}
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
                  style={{ textShadow: '1px 1px 2px black' }}
                >
                  {city.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        {/* Hovered route info */}
        {hoveredRoute && (
          <div className="mt-4 bg-stone-800 rounded-lg p-4 text-white">
            <h3 className="font-bold text-green-400">
              {EUROPE_ROUTES.find(r => r.id === hoveredRoute)?.id}
            </h3>
            <div className="text-sm text-stone-300 mt-1">
              {(() => {
                const route = EUROPE_ROUTES.find(r => r.id === hoveredRoute);
                if (!route) return null;
                const city1 = EUROPE_CITIES.find(c => c.id === route.cities[0]);
                const city2 = EUROPE_CITIES.find(c => c.id === route.cities[1]);
                return `${city1?.name} → ${city2?.name} | Длина: ${route.length} | Цвет: ${route.color}${route.isTunnel ? ' | Туннель' : ''}${route.ferryLocomotives ? ` | Паром: ${route.ferryLocomotives}` : ''}`;
              })()}
            </div>
          </div>
        )}
        
        {/* Route list */}
        <div className="mt-4 bg-stone-800 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h2 className="text-white font-bold mb-2">Все маршруты ({EUROPE_ROUTES.length}):</h2>
          <div className="grid grid-cols-4 gap-1 text-xs font-mono text-stone-300">
            {EUROPE_ROUTES.map((route) => {
              const city1 = EUROPE_CITIES.find(c => c.id === route.cities[0]);
              const city2 = EUROPE_CITIES.find(c => c.id === route.cities[1]);
              return (
                <div 
                  key={route.id}
                  className={`px-2 py-1 rounded truncate ${hoveredRoute === route.id ? 'bg-green-900 text-green-300' : ''}`}
                  onMouseEnter={() => setHoveredRoute(route.id)}
                  onMouseLeave={() => setHoveredRoute(null)}
                >
                  {city1?.name}→{city2?.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCalibration;
