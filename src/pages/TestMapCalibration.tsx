import React, { useState, useRef, useCallback } from 'react';
import { TEST_CITIES } from '@/data/testMap';
import testMapBg from '@/assets/test-map-bg.jpg';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CityPosition {
  id: string;
  name: string;
  x: number;
  y: number;
}

const TestMapCalibration = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cityPositions, setCityPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingCity, setDraggingCity] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getMouseSVGPos = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * 1920),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 1440),
    };
  }, []);

  const getCityPos = (city: typeof TEST_CITIES[0]): { x: number; y: number } => {
    return cityPositions[city.id] || { x: city.x, y: city.y };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const pos = getMouseSVGPos(e);
    setMousePos(pos);

    if (draggingCity) {
      setCityPositions(prev => ({
        ...prev,
        [draggingCity]: pos,
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingCity(null);
  };

  const copyCoordinates = () => {
    const output: string[] = ['// Updated TEST_CITIES positions - paste into testMap.ts'];
    output.push('export const TEST_CITIES: TestCity[] = [');
    
    TEST_CITIES.forEach(city => {
      const pos = getCityPos(city);
      output.push(`  { id: '${city.id}', name: '${city.name}', x: ${pos.x}, y: ${pos.y} },`);
    });
    
    output.push('];');
    
    navigator.clipboard.writeText(output.join('\n'));
    toast.success(`Скопировано ${TEST_CITIES.length} городов!`);
  };

  const resetCity = (cityId: string) => {
    setCityPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[cityId];
      return newPositions;
    });
  };

  const resetAll = () => {
    setCityPositions({});
    toast.success('Все позиции сброшены');
  };

  const modifiedCount = Object.keys(cityPositions).length;

  return (
    <div className="min-h-screen bg-stone-900 p-4" onMouseUp={handleMouseUp}>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white flex-wrap gap-2">
          <h1 className="text-xl font-bold">🗺️ Калибровка городов (Тестовая карта)</h1>
          <div className="flex gap-4 items-center flex-wrap">
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
            <a href="/test-routes" className="text-blue-400 hover:underline text-sm">
              → Калибровка маршрутов
            </a>
          </div>
        </div>

        <div className="mb-2 text-stone-400 text-sm">
          💡 Перетащите города на нужные позиции | Кликните для выделения | viewBox: 1920×1440
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
            
            {/* Cities */}
            {TEST_CITIES.map((city) => {
              const pos = getCityPos(city);
              const isModified = !!cityPositions[city.id];
              const isSelected = selectedCity === city.id;
              const isDragging = draggingCity === city.id;
              
              return (
                <g 
                  key={city.id}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggingCity(city.id);
                    setSelectedCity(city.id);
                  }}
                  onClick={() => setSelectedCity(city.id)}
                >
                  {/* City marker */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 20 : 15}
                    fill={isModified ? '#f59e0b' : '#ef4444'}
                    stroke={isSelected ? '#22c55e' : 'white'}
                    strokeWidth={isSelected ? 4 : 2}
                  />
                  
                  {/* City name label */}
                  <text
                    x={pos.x}
                    y={pos.y - 25}
                    textAnchor="middle"
                    fontSize="16"
                    fill="white"
                    fontWeight="bold"
                    style={{ 
                      textShadow: '2px 2px 4px black, -2px -2px 4px black',
                      pointerEvents: 'none'
                    }}
                  >
                    {city.name}
                  </text>
                  
                  {/* Coordinates */}
                  {isSelected && (
                    <text
                      x={pos.x}
                      y={pos.y + 35}
                      textAnchor="middle"
                      fontSize="14"
                      fill="#22c55e"
                      fontWeight="bold"
                      style={{ 
                        textShadow: '1px 1px 2px black',
                        pointerEvents: 'none'
                      }}
                    >
                      ({pos.x}, {pos.y})
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Selected city info */}
        {selectedCity && (
          <div className="mt-4 bg-stone-800 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-green-400">
                  {TEST_CITIES.find(c => c.id === selectedCity)?.name} ({selectedCity})
                </h3>
                <div className="text-sm text-stone-300 mt-1 font-mono">
                  Позиция: x={getCityPos(TEST_CITIES.find(c => c.id === selectedCity)!).x}, y={getCityPos(TEST_CITIES.find(c => c.id === selectedCity)!).y}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => resetCity(selectedCity)}>
                Сбросить
              </Button>
            </div>
          </div>
        )}
        
        {/* City list */}
        <div className="mt-4 bg-stone-800 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h2 className="text-white font-bold mb-2">Все города ({TEST_CITIES.length}):</h2>
          <div className="grid grid-cols-4 gap-2 text-xs text-stone-300 font-mono">
            {TEST_CITIES.map((city) => {
              const pos = getCityPos(city);
              const isModified = !!cityPositions[city.id];
              return (
                <div 
                  key={city.id}
                  className={`px-2 py-1 rounded cursor-pointer hover:bg-stone-700 ${
                    selectedCity === city.id ? 'bg-green-900 text-green-300' : 
                    isModified ? 'bg-amber-900 text-amber-300' : ''
                  }`}
                  onClick={() => setSelectedCity(city.id)}
                >
                  {city.name}: ({pos.x}, {pos.y})
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMapCalibration;
