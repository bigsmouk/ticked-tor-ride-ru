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
  small: { width: 140, height: 50, fontSize: 10, routeFontSize: 11 },
  medium: { width: 180, height: 60, fontSize: 12, routeFontSize: 13 },
  large: { width: 220, height: 70, fontSize: 14, routeFontSize: 15 },
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
  
  const pointsValue = isFailed ? `-${ticket.points}` : `+${ticket.points}`;
  
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
          ? 'linear-gradient(135deg, hsl(35 50% 85%) 0%, hsl(25 45% 75%) 100%)'
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
      
      {/* Points badge - top left */}
      <div 
        className="absolute top-1.5 left-1.5 min-w-[32px] h-6 px-2 rounded flex items-center justify-center font-display font-bold"
        style={{
          background: isCompleted 
            ? 'linear-gradient(180deg, hsl(140 60% 50%) 0%, hsl(140 55% 40%) 100%)'
            : isFailed
            ? 'linear-gradient(180deg, hsl(0 65% 55%) 0%, hsl(0 60% 45%) 100%)'
            : ticket.isLongRoute
            ? 'linear-gradient(180deg, hsl(25 60% 50%) 0%, hsl(25 55% 40%) 100%)'
            : 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
          border: '2px solid hsl(30 50% 30%)',
          fontSize: dimensions.fontSize,
          color: 'white',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {pointsValue}
      </div>
      
      {/* Long route badge */}
      {ticket.isLongRoute && (
        <div 
          className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-display font-bold"
          style={{
            background: 'hsl(25 60% 45%)',
            color: 'white',
            fontSize: dimensions.fontSize - 3,
          }}
        >
          ★
        </div>
      )}
      
      {/* Route text - center, prominent */}
      <div 
        className="absolute inset-0 flex items-center justify-center px-10"
      >
        <div 
          className="font-display font-bold text-center leading-tight"
          style={{ 
            fontSize: dimensions.routeFontSize,
            color: 'hsl(30 40% 20%)',
            textShadow: '0 1px 0 hsl(40 30% 90%)',
          }}
        >
          {city1?.name || ticket.cities[0]} — {city2?.name || ticket.cities[1]}
        </div>
      </div>
      
      {/* Status icon */}
      {(isCompleted || isFailed) && (
        <div 
          className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: statusColor,
            fontSize: 12,
            color: 'white',
          }}
        >
          {isCompleted ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};