import React from 'react';
import { TrainCard } from './TrainCard';
import { DestinationCard } from './DestinationCard';
import { TrainCardType, DestinationTicket } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlayerHandProps {
  trainCards: TrainCardType[];
  destinationTickets: DestinationTicket[];
  selectedCardIndices: number[];
  onCardSelect: (card: TrainCardType, index: number) => void;
  onTicketClick?: (ticket: DestinationTicket) => void;
  onTicketHover?: (ticket: DestinationTicket | null) => void;
  routeRequirement?: { color: string; count: number } | null;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  trainCards,
  destinationTickets,
  selectedCardIndices,
  onCardSelect,
  onTicketClick,
  onTicketHover,
  routeRequirement,
}) => {
  // Group cards by type with individual indices
  const cardGroups: { type: TrainCardType; indices: number[] }[] = [];
  const cardTypeCounts: Record<string, number[]> = {};
  
  trainCards.forEach((card, index) => {
    if (!cardTypeCounts[card]) {
      cardTypeCounts[card] = [];
    }
    cardTypeCounts[card].push(index);
  });
  
  Object.entries(cardTypeCounts).forEach(([type, indices]) => {
    cardGroups.push({ 
      type: type as TrainCardType, 
      indices,
    });
  });
  
  // Sort: locomotive first, then by count
  cardGroups.sort((a, b) => {
    if (a.type === 'locomotive') return -1;
    if (b.type === 'locomotive') return 1;
    return b.indices.length - a.indices.length;
  });
  
  // Check if a card type is valid for the current route
  const isCardValidForRoute = (cardType: TrainCardType) => {
    if (!routeRequirement) return true;
    if (cardType === 'locomotive') return true;
    if (routeRequirement.color === 'gray') return true;
    return cardType === routeRequirement.color;
  };
  
  return (
    <div className="ttr-hand-panel parchment rounded-lg border-2 border-ornament p-4 shadow-vintage">
      <div className="ttr-hand-sections flex items-start gap-6">
        {/* Train cards */}
        <div className="ttr-train-section flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-display font-semibold text-foreground">
              Карты вагонов
            </span>
            <span className="text-xs text-muted-foreground">
              ({trainCards.length} карт)
            </span>
            {selectedCardIndices.length > 0 && routeRequirement && (
              <span className="text-xs text-gold font-bold animate-pulse">
                Выбрано: {selectedCardIndices.length} / {routeRequirement.count}
              </span>
            )}
          </div>
          
          <div className="ttr-train-grid flex flex-wrap gap-2">
            {cardGroups.map(({ type, indices }) => {
              // Count how many of this type are selected
              const selectedOfType = indices.filter(i => selectedCardIndices.includes(i)).length;
              const totalCount = indices.length;
              const isValid = isCardValidForRoute(type);
              
              // Card type names in Russian
              const cardNames: Record<TrainCardType, string> = {
                locomotive: 'Локомотив',
                red: 'Красный',
                blue: 'Синий',
                green: 'Зелёный',
                yellow: 'Жёлтый',
                orange: 'Оранжевый',
                pink: 'Розовый',
                white: 'Белый',
                black: 'Чёрный',
                gray: 'Серый',
              };
              
              return (
                <div key={type} className="ttr-train-item relative flex flex-col items-center" data-card-color={type}>
                  <TrainCard
                    type={type}
                    count={totalCount}
                    size="medium"
                    showCount={false}
                    onClick={() => {
                      // Если есть невыбранные карты этого типа, добавляем первую невыбранную
                      const unselectedIndex = indices.find(i => !selectedCardIndices.includes(i));
                      if (unselectedIndex !== undefined) {
                        onCardSelect(type, unselectedIndex);
                      } else {
                        // Иначе убираем последнюю выбранную
                        const lastSelected = [...indices].reverse().find(i => selectedCardIndices.includes(i));
                        if (lastSelected !== undefined) {
                          onCardSelect(type, lastSelected);
                        }
                      }
                    }}
                    isSelected={selectedOfType > 0}
                    isDisabled={!isValid && routeRequirement !== null}
                  />
                  
                  {/* Card name label */}
                  <span className="text-[10px] text-muted-foreground mt-1 font-medium truncate max-w-[60px] text-center">
                    {cardNames[type]}
                  </span>
                  
                  {/* Actual inventory count, never the temporary selected count. */}
                  <span className="ttr-card-stack-count" aria-label={`Всего карт: ${totalCount}`}>{totalCount}</span>
                  {selectedOfType > 0 && <span className="ttr-card-selected-count" aria-label={`Выбрано карт: ${selectedOfType}`}>✓ {selectedOfType}</span>}
                </div>
              );
            })}
            
            {trainCards.length === 0 && (
              <div className="text-sm text-muted-foreground italic">
                Нет карт в руке
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="ttr-hand-divider w-px min-h-[120px] bg-ornament/30" />
        
        {/* Destination tickets */}
        <div className="ttr-tickets-section flex flex-col">
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <span className="text-sm font-display font-semibold text-foreground">
              Маршруты
            </span>
            <span className="text-xs text-muted-foreground">
              ({destinationTickets.length})
            </span>
          </div>
          
          <ScrollArea className="ttr-tickets-scroll flex-1 min-h-0">
            <div className="flex flex-col gap-2 pr-3">
              {destinationTickets.map((ticket) => (
                <div key={ticket.id} onMouseEnter={() => onTicketHover?.(ticket)} onMouseLeave={() => onTicketHover?.(null)} onFocus={() => onTicketHover?.(ticket)} onBlur={() => onTicketHover?.(null)} tabIndex={0} aria-label="Подсветить города маршрута">
                <DestinationCard
                  ticket={ticket}
                  size="small"
                  isCompleted={ticket.isCompleted}
                  onClick={onTicketClick ? () => onTicketClick(ticket) : undefined}
                />
                </div>
              ))}
              
              {destinationTickets.length === 0 && (
                <div className="text-sm text-muted-foreground italic">
                  Нет маршрутов
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};