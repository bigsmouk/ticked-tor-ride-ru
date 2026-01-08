import React from 'react';
import { DestinationTicket } from '@/types/game';
import { EUROPE_CITIES } from '@/data/europeMap';

interface DestinationCardProps {
  ticket: DestinationTicket;
  isCompleted?: boolean;
  isFailed?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { width: 100, height: 60, fontSize: 8 },
  medium: { width: 140, height: 80, fontSize: 10 },
  large: { width: 180, height: 100, fontSize: 12 },
};

export const DestinationCard: React.FC<DestinationCardProps> = ({
  ticket,
  isCompleted,
  isFailed,
  onClick,
  isSelected,
  size = 'medium',
}) => {
  const dimensions = SIZES[size];
  
  const city1 = EUROPE_CITIES.find(c => c.id === ticket.cities[0]);
  const city2 = EUROPE_CITIES.find(c => c.id === ticket.cities[1]);
  
  const statusColor = isCompleted 
    ? 'hsl(140 60% 45%)' 
    : isFailed 
    ? 'hsl(0 65% 50%)' 
    : 'transparent';
  
  return (
    <div
      className={`
        ticket-card relative rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
        ${onClick ? 'hover:-translate-y-1 hover:shadow-lg' : ''}
        ${isSelected ? 'ring-3 ring-gold -translate-y-2' : ''}
      `}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: ticket.isLongRoute 
          ? 'linear-gradient(135deg, hsl(35 40% 88%) 0%, hsl(25 35% 78%) 100%)'
          : 'linear-gradient(135deg, hsl(40 35% 92%) 0%, hsl(35 30% 85%) 100%)',
        border: `3px solid ${ticket.isLongRoute ? 'hsl(25 50% 45%)' : 'hsl(30 40% 55%)'}`,
        boxShadow: isSelected 
          ? '0 8px 25px hsl(43 80% 50% / 0.4)' 
          : '0 4px 15px hsl(0 0% 0% / 0.15)',
      }}
      onClick={onClick}
    >
      {/* Status indicator border */}
      {(isCompleted || isFailed) && (
        <div 
          className="absolute inset-0 rounded-md"
          style={{
            border: `3px solid ${statusColor}`,
          }}
        />
      )}
      
      {/* Long route indicator */}
      {ticket.isLongRoute && (
        <div 
          className="absolute top-0 left-0 px-1.5 py-0.5 text-xs font-display font-bold"
          style={{
            background: 'hsl(25 60% 45%)',
            color: 'white',
            borderBottomRightRadius: 4,
            fontSize: dimensions.fontSize - 2,
          }}
        >
          LONG
        </div>
      )}
      
      {/* Mini map visualization */}
      <svg 
        className="absolute inset-0 opacity-30"
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid meet"
      >
        {city1 && city2 && (
          <>
            <line
              x1={city1.x / 8}
              y1={city1.y / 9}
              x2={city2.x / 8}
              y2={city2.y / 9}
              stroke="hsl(30 50% 40%)"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            <circle cx={city1.x / 8} cy={city1.y / 9} r={4} fill="hsl(0 70% 50%)" />
            <circle cx={city2.x / 8} cy={city2.y / 9} r={4} fill="hsl(210 70% 50%)" />
          </>
        )}
      </svg>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-2">
        {/* Cities */}
        <div className="flex-1 flex flex-col justify-center">
          <div 
            className="font-display font-bold text-center leading-tight"
            style={{ 
              fontSize: dimensions.fontSize,
              color: 'hsl(30 40% 25%)',
            }}
          >
            {city1?.name || ticket.cities[0]}
          </div>
          <div 
            className="text-center my-0.5"
            style={{ 
              fontSize: dimensions.fontSize - 2,
              color: 'hsl(30 30% 40%)',
            }}
          >
            ↔
          </div>
          <div 
            className="font-display font-bold text-center leading-tight"
            style={{ 
              fontSize: dimensions.fontSize,
              color: 'hsl(30 40% 25%)',
            }}
          >
            {city2?.name || ticket.cities[1]}
          </div>
        </div>
        
        {/* Points */}
        <div 
          className="absolute bottom-1 right-1 min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-display font-bold"
          style={{
            background: isCompleted 
              ? 'linear-gradient(180deg, hsl(140 60% 50%) 0%, hsl(140 55% 40%) 100%)'
              : isFailed
              ? 'linear-gradient(180deg, hsl(0 65% 55%) 0%, hsl(0 60% 45%) 100%)'
              : 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
            border: '2px solid hsl(30 50% 30%)',
            fontSize: dimensions.fontSize,
            color: isCompleted || isFailed ? 'white' : 'hsl(30 30% 15%)',
          }}
        >
          {isFailed ? `-${ticket.points}` : ticket.points}
        </div>
        
        {/* Status icon */}
        {(isCompleted || isFailed) && (
          <div 
            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: statusColor,
              fontSize: 12,
            }}
          >
            {isCompleted ? '✓' : '✗'}
          </div>
        )}
      </div>
    </div>
  );
};
