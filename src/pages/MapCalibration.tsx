import React, { useState } from 'react';
import { EUROPE_CITIES } from '@/data/europeMap';
import europeMapImage from '@/assets/europe-map.jpg';

const MapCalibration = () => {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 550;
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  };

  return (
    <div className="min-h-screen bg-stone-900 p-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-4 flex items-center justify-between text-white">
          <h1 className="text-xl font-bold">Калибровка карты</h1>
          <div className="bg-stone-800 px-4 py-2 rounded font-mono">
            Курсор: x={mousePos.x}, y={mousePos.y}
          </div>
        </div>
        
        <div className="bg-stone-800 rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 800 550"
            className="w-full h-auto"
            onMouseMove={handleMouseMove}
          >
            {/* Background image */}
            <image
              href={europeMapImage}
              x="0"
              y="0"
              width="800"
              height="550"
              preserveAspectRatio="xMidYMid slice"
            />
            
            {/* Cities */}
            {EUROPE_CITIES.map((city) => (
              <g 
                key={city.id}
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* City marker */}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={hoveredCity === city.id ? 10 : 6}
                  fill={hoveredCity === city.id ? '#22c55e' : '#ef4444'}
                  stroke="white"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                />
                
                {/* City name label */}
                <text
                  x={city.x}
                  y={city.y - 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="bold"
                  style={{ 
                    textShadow: '1px 1px 2px black, -1px -1px 2px black',
                    pointerEvents: 'none'
                  }}
                >
                  {city.name}
                </text>
                
                {/* Coordinates on hover */}
                {hoveredCity === city.id && (
                  <text
                    x={city.x}
                    y={city.y + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#22c55e"
                    fontWeight="bold"
                    style={{ 
                      textShadow: '1px 1px 2px black',
                      pointerEvents: 'none'
                    }}
                  >
                    x={city.x}, y={city.y}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
        
        {/* City list */}
        <div className="mt-4 bg-stone-800 rounded-lg p-4 max-h-60 overflow-y-auto">
          <h2 className="text-white font-bold mb-2">Координаты городов:</h2>
          <div className="grid grid-cols-3 gap-2 text-sm font-mono text-stone-300">
            {EUROPE_CITIES.map((city) => (
              <div 
                key={city.id}
                className={`px-2 py-1 rounded ${hoveredCity === city.id ? 'bg-green-900 text-green-300' : ''}`}
              >
                {city.name}: ({city.x}, {city.y})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapCalibration;
