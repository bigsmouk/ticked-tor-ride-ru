import React from 'react';
import { Player, PlayerColor } from '@/types/game';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  isLocalPlayer: boolean;
  position: 'left' | 'right';
  index: number;
}

const PLAYER_COLORS: Record<PlayerColor, { bg: string; border: string; text: string }> = {
  red: { 
    bg: 'linear-gradient(135deg, hsl(0 70% 50%) 0%, hsl(0 65% 40%) 100%)',
    border: 'hsl(0 60% 35%)',
    text: 'hsl(0 0% 100%)',
  },
  blue: { 
    bg: 'linear-gradient(135deg, hsl(210 75% 50%) 0%, hsl(210 70% 40%) 100%)',
    border: 'hsl(210 65% 35%)',
    text: 'hsl(0 0% 100%)',
  },
  green: { 
    bg: 'linear-gradient(135deg, hsl(140 55% 45%) 0%, hsl(140 50% 35%) 100%)',
    border: 'hsl(140 50% 30%)',
    text: 'hsl(0 0% 100%)',
  },
  yellow: { 
    bg: 'linear-gradient(135deg, hsl(48 90% 55%) 0%, hsl(45 85% 45%) 100%)',
    border: 'hsl(45 80% 35%)',
    text: 'hsl(40 30% 15%)',
  },
  black: { 
    bg: 'linear-gradient(135deg, hsl(0 0% 25%) 0%, hsl(0 0% 15%) 100%)',
    border: 'hsl(0 0% 10%)',
    text: 'hsl(0 0% 100%)',
  },
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isCurrentPlayer,
  isLocalPlayer,
  position,
  index,
}) => {
  const colors = PLAYER_COLORS[player.color];
  
  // Count cards by type
  const cardCounts: Record<string, number> = {};
  player.trainCards.forEach(card => {
    cardCounts[card] = (cardCounts[card] || 0) + 1;
  });
  
  return (
    <div 
      className={`
        player-panel relative w-44 min-w-0 transition-all duration-300
        ${isCurrentPlayer ? 'active glow-gold scale-105' : 'opacity-90'}
        ${isLocalPlayer ? 'ring-2 ring-gold/50' : ''}
      `}
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* Player color indicator */}
      <div 
        className="absolute -left-1 top-2 bottom-2 w-2 rounded-full"
        style={{ background: colors.border }}
      />
      
      {/* Active player indicator */}
      {isCurrentPlayer && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4">
          <div className="w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-gold animate-pulse" />
        </div>
      )}
      
      {/* Player info */}
      <div className="flex items-center gap-2 mb-2">
        {/* Avatar placeholder */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg font-bold"
          style={{ 
            background: 'hsl(40 30% 90%)',
            border: `2px solid ${colors.border}`,
            color: colors.border,
          }}
        >
          {player.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div 
            className="font-display font-semibold text-sm truncate"
            style={{ color: colors.text }}
          >
            {player.name}
            {isLocalPlayer && <span className="text-xs opacity-70 ml-1">(Вы)</span>}
          </div>
          
          {/* Score */}
          <div className="flex items-center gap-1">
            <span 
              className="text-xs font-display"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              Очки:
            </span>
            <span 
              className="font-bold text-lg font-display"
              style={{ color: colors.text }}
            >
              {player.score}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats row */}
      <div 
        className="flex items-center justify-between text-xs p-2 rounded"
        style={{ 
          background: 'hsl(0 0% 0% / 0.15)',
          color: colors.text,
        }}
      >
        {/* Trains remaining */}
        <div className="flex items-center gap-1" title="Вагоны">
          <span className="text-base">🚃</span>
          <span className="font-bold">{player.trainsRemaining}</span>
        </div>
        
        {/* Cards in hand */}
        <div className="flex items-center gap-1" title="Карты вагонов">
          <span className="text-base">🎴</span>
          <span className="font-bold">{player.trainCards.length}</span>
        </div>
        
        {/* Destination tickets */}
        <div className="flex items-center gap-1" title="Маршруты">
          <span className="text-base">🎫</span>
          <span className="font-bold">{player.destinationTickets.length}</span>
        </div>
      </div>
      
      {/* Show cards for local player */}
      {isLocalPlayer && Object.keys(cardCounts).length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/20">
          <div 
            className="text-[10px] mb-1 font-display"
            style={{ color: colors.text, opacity: 0.7 }}
          >
            Карты:
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(cardCounts).map(([cardType, count]) => (
              <div 
                key={cardType}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold"
                style={{
                  background: cardType === 'locomotive' ? 'hsl(280 60% 50%)' : 
                    cardType === 'red' ? 'hsl(0 70% 50%)' :
                    cardType === 'blue' ? 'hsl(210 70% 50%)' :
                    cardType === 'green' ? 'hsl(140 55% 45%)' :
                    cardType === 'yellow' ? 'hsl(48 90% 55%)' :
                    cardType === 'orange' ? 'hsl(25 90% 50%)' :
                    cardType === 'pink' ? 'hsl(330 60% 55%)' :
                    cardType === 'white' ? 'hsl(0 0% 90%)' :
                    cardType === 'black' ? 'hsl(0 0% 20%)' :
                    'hsl(0 0% 60%)',
                  color: ['yellow', 'white'].includes(cardType) ? 'hsl(0 0% 15%)' : 'white',
                }}
              >
                {cardType === 'locomotive' ? '🚂' : ''}{count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
