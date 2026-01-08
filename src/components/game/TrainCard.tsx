import React from 'react';
import { TrainCardType } from '@/types/game';

interface TrainCardProps {
  type: TrainCardType;
  count?: number;
  onClick?: () => void;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
}

const CARD_COLORS: Record<TrainCardType, { bg: string; accent: string; icon: string }> = {
  red: { 
    bg: 'linear-gradient(135deg, hsl(0 75% 55%) 0%, hsl(0 70% 40%) 100%)',
    accent: 'hsl(0 80% 60%)',
    icon: '🚃',
  },
  blue: { 
    bg: 'linear-gradient(135deg, hsl(210 80% 55%) 0%, hsl(210 75% 40%) 100%)',
    accent: 'hsl(210 85% 60%)',
    icon: '🚃',
  },
  green: { 
    bg: 'linear-gradient(135deg, hsl(140 60% 50%) 0%, hsl(140 55% 35%) 100%)',
    accent: 'hsl(140 65% 55%)',
    icon: '🚃',
  },
  yellow: { 
    bg: 'linear-gradient(135deg, hsl(48 95% 60%) 0%, hsl(45 90% 45%) 100%)',
    accent: 'hsl(48 100% 65%)',
    icon: '🚃',
  },
  orange: { 
    bg: 'linear-gradient(135deg, hsl(25 95% 55%) 0%, hsl(25 90% 40%) 100%)',
    accent: 'hsl(25 100% 60%)',
    icon: '🚃',
  },
  pink: { 
    bg: 'linear-gradient(135deg, hsl(330 70% 60%) 0%, hsl(330 65% 45%) 100%)',
    accent: 'hsl(330 75% 65%)',
    icon: '🚃',
  },
  white: { 
    bg: 'linear-gradient(135deg, hsl(0 0% 95%) 0%, hsl(0 0% 80%) 100%)',
    accent: 'hsl(0 0% 100%)',
    icon: '🚃',
  },
  black: { 
    bg: 'linear-gradient(135deg, hsl(0 0% 30%) 0%, hsl(0 0% 15%) 100%)',
    accent: 'hsl(0 0% 40%)',
    icon: '🚃',
  },
  gray: {
    bg: 'linear-gradient(135deg, hsl(0 0% 55%) 0%, hsl(0 0% 40%) 100%)',
    accent: 'hsl(0 0% 65%)',
    icon: '🚃',
  },
  locomotive: { 
    bg: 'linear-gradient(135deg, hsl(280 70% 55%) 0%, hsl(280 65% 40%) 100%)',
    accent: 'hsl(280 75% 60%)',
    icon: '🚂',
  },
};

const SIZES = {
  small: { width: 40, height: 56, fontSize: 12, iconSize: 16 },
  medium: { width: 60, height: 84, fontSize: 14, iconSize: 24 },
  large: { width: 80, height: 112, fontSize: 16, iconSize: 32 },
};

export const TrainCard: React.FC<TrainCardProps> = ({
  type,
  count,
  onClick,
  isSelected,
  size = 'medium',
  showBack = false,
}) => {
  const colors = CARD_COLORS[type];
  const dimensions = SIZES[size];
  
  if (showBack) {
    return (
      <div
        className={`
          relative rounded-lg cursor-pointer transition-all duration-200
          ${onClick ? 'hover:-translate-y-1 hover:shadow-lg' : ''}
        `}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          background: 'linear-gradient(135deg, hsl(24 60% 30%) 0%, hsl(24 60% 20%) 100%)',
          border: '3px solid hsl(30 50% 35%)',
          boxShadow: '0 4px 10px hsl(0 0% 0% / 0.2)',
        }}
        onClick={onClick}
      >
        {/* Decorative pattern */}
        <div 
          className="absolute inset-2 rounded opacity-30"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, hsl(43 80% 50% / 0.3) 5px, hsl(43 80% 50% / 0.3) 10px)',
          }}
        />
        
        {/* Center icon */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: dimensions.iconSize }}
        >
          🚂
        </div>
        
        {/* Card count badge */}
        {count !== undefined && count > 0 && (
          <div 
            className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center font-display font-bold"
            style={{
              background: 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
              border: '2px solid hsl(30 50% 30%)',
              fontSize: 10,
              color: 'hsl(30 30% 15%)',
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
        train-card relative rounded-lg cursor-pointer transition-all duration-200
        ${onClick ? 'hover:-translate-y-1' : ''}
        ${isSelected ? 'ring-3 ring-gold -translate-y-2 shadow-xl' : ''}
      `}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        background: colors.bg,
        border: `3px solid hsl(30 50% 35%)`,
      }}
      onClick={onClick}
    >
      {/* Card shine effect */}
      <div 
        className="absolute inset-0 rounded-md opacity-20"
        style={{
          background: `linear-gradient(135deg, ${colors.accent} 0%, transparent 50%)`,
        }}
      />
      
      {/* Decorative border */}
      <div 
        className="absolute inset-1 rounded border-2 opacity-30"
        style={{ borderColor: colors.accent }}
      />
      
      {/* Card icon */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ 
          fontSize: dimensions.iconSize,
          textShadow: '0 2px 4px hsl(0 0% 0% / 0.3)',
        }}
      >
        <span>{colors.icon}</span>
        {type !== 'locomotive' && (
          <span 
            className="font-display font-bold uppercase"
            style={{ 
              fontSize: dimensions.fontSize - 4,
              color: ['yellow', 'white'].includes(type) ? 'hsl(0 0% 15%)' : 'white',
              textShadow: '0 1px 2px hsl(0 0% 0% / 0.3)',
            }}
          >
            {type.slice(0, 3)}
          </span>
        )}
        {type === 'locomotive' && (
          <span 
            className="font-display font-bold text-white"
            style={{ 
              fontSize: dimensions.fontSize - 4,
              textShadow: '0 1px 2px hsl(0 0% 0% / 0.3)',
            }}
          >
            WILD
          </span>
        )}
      </div>
      
      {/* Card count badge */}
      {count !== undefined && count > 0 && (
        <div 
          className="absolute -bottom-2 -right-2 min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-display font-bold"
          style={{
            background: 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
            border: '2px solid hsl(30 50% 30%)',
            fontSize: 12,
            color: 'hsl(30 30% 15%)',
            boxShadow: '0 2px 6px hsl(0 0% 0% / 0.2)',
          }}
        >
          {count}
        </div>
      )}
    </div>
  );
};
