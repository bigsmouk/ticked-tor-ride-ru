import React from 'react';
import { TrainCard } from './TrainCard';
import { TrainCardType } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';

interface CardDeckAreaProps {
  faceUpCards: TrainCardType[];
  deckCount: number;
  onDrawFromDeck: () => void;
  onDrawFaceUp: (index: number) => void;
  canDraw: boolean;
  currentAction: string;
}

export const CardDeckArea: React.FC<CardDeckAreaProps> = ({
  faceUpCards,
  deckCount,
  onDrawFromDeck,
  onDrawFaceUp,
  canDraw,
  currentAction,
}) => {
  const isSelectingFirstCard = currentAction === 'selectingFirstCard';
  const isDrawingSecondCard = currentAction === 'drawTrainCards';
  
  return (
    <div className="flex items-center gap-3 p-4 parchment rounded-lg border-2 border-ornament shadow-vintage">
      {/* Draw deck */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs font-display text-muted-foreground">Колода</div>
        <div className="relative">
          {/* Deck stack effect */}
          <div 
            className="absolute top-1 left-0.5 w-[60px] h-[84px] rounded-lg opacity-60"
            style={{
              background: 'linear-gradient(135deg, hsl(24 60% 30%) 0%, hsl(24 60% 20%) 100%)',
              border: '2px solid hsl(30 50% 30%)',
            }}
          />
          <div 
            className="absolute top-0.5 left-0.25 w-[60px] h-[84px] rounded-lg opacity-80"
            style={{
              background: 'linear-gradient(135deg, hsl(24 60% 30%) 0%, hsl(24 60% 20%) 100%)',
              border: '2px solid hsl(30 50% 30%)',
            }}
          />
          
          <TrainCard
            type="locomotive"
            showBack
            size="medium"
            onClick={canDraw ? onDrawFromDeck : undefined}
          />
          
          {/* Card count */}
          <div 
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-display font-bold"
            style={{
              background: 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
              border: '2px solid hsl(30 50% 30%)',
              color: 'hsl(30 30% 15%)',
            }}
          >
            {deckCount}
          </div>
        </div>
      </div>
      
      {/* Divider */}
      <div className="w-px h-24 bg-ornament/30" />
      
      {/* Face-up cards */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs font-display text-muted-foreground">
          Открытые карты
          {isSelectingFirstCard && (
            <span className="ml-2 text-gold animate-pulse">(выберите 1-ю карту)</span>
          )}
          {isDrawingSecondCard && (
            <span className="ml-2 text-gold animate-pulse">(выберите 2-ю карту)</span>
          )}
        </div>
        <div className="flex gap-2">
          {faceUpCards.map((card, index) => {
            // Can't take locomotive as second card
            const canTakeThis = canDraw && !(isDrawingSecondCard && card === 'locomotive');
            
            return (
              <TrainCard
                key={`${card}-${index}`}
                type={card}
                size="medium"
                onClick={canTakeThis ? () => onDrawFaceUp(index) : undefined}
              />
            );
          })}
          
          {/* Fill empty slots */}
          {Array.from({ length: 5 - faceUpCards.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-[60px] h-[84px] rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
            >
              <span className="text-muted-foreground/50 text-2xl">?</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
