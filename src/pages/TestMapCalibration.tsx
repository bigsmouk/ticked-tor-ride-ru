import React, { useState, useCallback } from 'react';
import { TEST_CITIES, TestCity } from '@/data/testMap';
import testMapBg from '@/assets/test-map-bg.jpg';

const TestMapCalibration = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1920;
    const y = ((e.clientY - rect.top) / rect.height) * 1080;
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (selectedCity) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
      
      setCustomPositions(prev => ({
        ...prev,
        [selectedCity]: { x, y }
      }));
      setSelectedCity(null);
    }
  }, [selectedCity]);

  const getCityPosition = (city: TestCity) => {
    return customPositions[city.id] || { x: city.x, y: city.y };
  };

  const exportPositions = () => {
    const allPositions = TEST_CITIES.map(city => {
      const pos = getCityPosition(city);
      return `  { id: '${city.id}', name: '${city.name}', x: ${pos.x}, y: ${pos.y} },`;
    }).join('\n');
    
    console.log('// Updated TEST_CITIES coordinates:\n[\n' + allPositions + '\n]');
    navigator.clipboard.writeText('[\n' + allPositions + '\n]');
    alert('Координаты скопированы в буфер обмена!');
  };

  return (
    <div className="min-h-screen bg-stone-900 p-4">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white flex-wrap gap-4">
          <h1 className="text-xl font-bold">🧪 Калибровка тестовой карты (1920×1080)</h1>
          <div className="flex gap-4 items-center">
            <div className="bg-stone-800 px-4 py-2 rounded font-mono">
              Курсор: x={mousePos.x}, y={mousePos.y}
            </div>
            {selectedCity && (
              <div className="bg-yellow-900 px-4 py-2 rounded text-yellow-200">
                Выбран: {TEST_CITIES.find(c => c.id === selectedCity)?.name} - кликните на карту
              </div>
            )}
            <button 
              onClick={exportPositions}
              className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded font-bold"
            >
              Экспорт координат
            </button>
          </div>
        </div>
        
        <div className="bg-stone-800 rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 1920 1080"
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{ cursor: selectedCity ? 'crosshair' : 'default' }}
          >
            {/* Background image */}
            <image
              href={testMapBg}
              x="0"
              y="0"
              width="1920"
              height="1080"
              preserveAspectRatio="xMidYMid slice"
            />
            
            {/* Cities */}
            {TEST_CITIES.map((city) => {
              const pos = getCityPosition(city);
              const isHovered = hoveredCity === city.id;
              const isSelected = selectedCity === city.id;
              const isModified = !!customPositions[city.id];
              
              return (
                <g 
                  key={city.id}
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCity(city.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* City marker */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered || isSelected ? 20 : 14}
                    fill={isSelected ? '#fbbf24' : isModified ? '#22c55e' : '#ef4444'}
                    stroke="white"
                    strokeWidth={3}
                  />
                  
                  {/* City name label */}
                  <text
                    x={pos.x}
                    y={pos.y - 24}
                    textAnchor="middle"
                    fontSize="18"
                    fill="white"
                    fontWeight="bold"
                    style={{ 
                      textShadow: '2px 2px 4px black, -2px -2px 4px black',
                      pointerEvents: 'none'
                    }}
                  >
                    {city.name}
                  </text>
                  
                  {/* Coordinates on hover */}
                  {(isHovered || isSelected) && (
                    <text
                      x={pos.x}
                      y={pos.y + 40}
                      textAnchor="middle"
                      fontSize="16"
                      fill={isModified ? '#22c55e' : '#fbbf24'}
                      fontWeight="bold"
                      style={{ 
                        textShadow: '2px 2px 4px black',
                        pointerEvents: 'none'
                      }}
                    >
                      x={pos.x}, y={pos.y}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* City list */}
        <div className="mt-4 bg-stone-800 rounded-lg p-4 max-h-80 overflow-y-auto">
          <h2 className="text-white font-bold mb-2">Города ({Object.keys(customPositions).length} изменено):</h2>
          <div className="grid grid-cols-4 gap-2 text-sm font-mono text-stone-300">
            {TEST_CITIES.map((city) => {
              const pos = getCityPosition(city);
              const isModified = !!customPositions[city.id];
              return (
                <div 
                  key={city.id}
                  className={`px-2 py-1 rounded cursor-pointer hover:bg-stone-700 ${
                    selectedCity === city.id ? 'bg-yellow-900 text-yellow-300' :
                    isModified ? 'bg-green-900 text-green-300' : ''
                  }`}
                  onClick={() => setSelectedCity(city.id)}
                >
                  {city.name}: ({pos.x}, {pos.y})
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-stone-400 text-sm">
          <p>💡 Инструкция: кликните на город в списке или на карте, затем кликните на новое место на карте.</p>
          <p>Зелёные точки — изменённые позиции. Нажмите "Экспорт координат" для копирования.</p>
        </div>
      </div>
    </div>
  );
};

export default TestMapCalibration;
