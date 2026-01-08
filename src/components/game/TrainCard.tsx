import React from 'react';
import { TrainCardType } from '@/types/game';

// Import card images
import locomotiveCard from '@/assets/cards/locomotive.png';
import redCard from '@/assets/cards/red.png';
import blueCard from '@/assets/cards/blue.png';
import greenCard from '@/assets/cards/green.png';
import yellowCard from '@/assets/cards/yellow.png';
import orangeCard from '@/assets/cards/orange.png';
import pinkCard from '@/assets/cards/pink.png';
import whiteCard from '@/assets/cards/white.png';
import blackCard from '@/assets/cards/black.png';
import cardBack from '@/assets/cards/card-back.png';

interface TrainCardProps {
  type: TrainCardType;
  count?: number;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
  showCount?: boolean;
}

const CARD_IMAGES: Record<TrainCardType, string> = {
  red: redCard,
  blue: blueCard,
  green: greenCard,
  yellow: yellowCard,
  orange: orangeCard,
  pink: pinkCard,
  white: whiteCard,
  black: blackCard,
  gray: whiteCard, // fallback to white for gray
  locomotive: locomotiveCard,
};

const SIZES = {
  small: { width: 50, height: 70 },
  medium: { width: 60, height: 84 },
  large: { width: 90, height: 126 },
};

export const TrainCard: React.FC<TrainCardProps> = ({
  type,
  count,
  onClick,
  isSelected,
  isDisabled,
  size = 'medium',
  showBack = false,
  showCount = true,
}) => {
  const dimensions = SIZES[size];
  const cardImage = CARD_IMAGES[type];
  
  if (showBack) {
    return (
      <div
        className={`
          relative rounded-lg overflow-hidden transition-all duration-200
          ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
        `}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          boxShadow: '0 4px 10px hsl(0 0% 0% / 0.3)',
        }}
        onClick={onClick}
      >
        <img 
          src={cardBack} 
          alt="Card back"
          className="w-full h-full object-contain"
          style={{ transform: 'rotate(90deg) scale(1.4)' }}
          draggable={false}
        />
        
        {/* Card count badge */}
        {count !== undefined && count > 0 && (
          <div 
            className="absolute -bottom-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center font-display font-bold"
            style={{
              background: 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
              border: '2px solid hsl(30 50% 30%)',
              fontSize: 11,
              color: 'hsl(30 30% 15%)',
              boxShadow: '0 2px 4px hsl(0 0% 0% / 0.3)',
            }}
          >
            {count}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div
      className={`
        relative rounded-lg overflow-hidden transition-all duration-200
        ${onClick && !isDisabled ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''}
        ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${isSelected ? 'ring-4 ring-yellow-400 -translate-y-2 shadow-2xl scale-105' : ''}
      `}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        boxShadow: isSelected 
          ? '0 8px 25px hsl(43 80% 50% / 0.5)' 
          : '0 4px 10px hsl(0 0% 0% / 0.3)',
      }}
      onClick={!isDisabled ? onClick : undefined}
    >
      <img 
        src={cardImage} 
        alt={`${type} card`}
        className="w-full h-full object-contain"
        style={{ transform: 'rotate(90deg) scale(1.4)' }}
        draggable={false}
      />
      
      {/* Selection glow overlay */}
      {isSelected && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 15px hsl(43 80% 50% / 0.5)',
          }}
        />
      )}
      
      {/* Card count badge */}
      {showCount && count !== undefined && count > 1 && (
        <div 
          className="absolute -bottom-2 -right-2 min-w-[26px] h-[26px] px-1.5 rounded-full flex items-center justify-center font-display font-bold"
          style={{
            background: 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
            border: '2px solid hsl(30 50% 30%)',
            fontSize: 13,
            color: 'hsl(30 30% 15%)',
            boxShadow: '0 2px 6px hsl(0 0% 0% / 0.3)',
          }}
        >
          {count}
        </div>
      )}
    </div>
  );
};
