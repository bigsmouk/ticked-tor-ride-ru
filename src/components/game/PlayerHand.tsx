import React from 'react';
import { TrainCard } from './TrainCard';
import { DestinationCard } from './DestinationCard';
import { TrainCardType, DestinationTicket } from '@/types/game';

interface PlayerHandProps {
  trainCards: TrainCardType[];
  destinationTickets: DestinationTicket[];
  selectedCards: TrainCardType[];
  onCardSelect: (card: TrainCardType, index: number) => void;
  onTicketClick?: (ticket: DestinationTicket) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  trainCards,
  destinationTickets,
  selectedCards,
  onCardSelect,
  onTicketClick,
}) => {
  // Group cards by type and count
  const cardGroups: { type: TrainCardType; count: number; indices: number[] }[] = [];
  const cardTypeCounts: Record<string, { count: number; indices: number[] }> = {};
  
  trainCards.forEach((card, index) => {
    if (!cardTypeCounts[card]) {
      cardTypeCounts[card] = { count: 0, indices: [] };
    }
    cardTypeCounts[card].count++;
    cardTypeCounts[card].indices.push(index);
  });
  
  Object.entries(cardTypeCounts).forEach(([type, data]) => {
    cardGroups.push({ 
      type: type as TrainCardType, 
      count: data.count,
      indices: data.indices,
    });
  });
  
  // Sort: locomotive first, then by count
  cardGroups.sort((a, b) => {
    if (a.type === 'locomotive') return -1;
    if (b.type === 'locomotive') return 1;
    return b.count - a.count;
  });
  
  // Count selected cards by type
  const selectedCounts: Record<string, number> = {};
  selectedCards.forEach(card => {
    selectedCounts[card] = (selectedCounts[card] || 0) + 1;
  });
  
  return (
    <div className="parchment rounded-lg border-2 border-ornament p-4 shadow-vintage">
      <div className="flex items-start gap-6">
        {/* Train cards */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-display font-semibold text-foreground">
              Карты вагонов
            </span>
            <span className="text-xs text-muted-foreground">
              ({trainCards.length} карт)
            </span>
            {selectedCards.length > 0 && (
              <span className="text-xs text-gold font-bold animate-pulse">
                Выбрано: {selectedCards.length}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {cardGroups.map(({ type, count, indices }) => {
              const selectedCount = selectedCounts[type] || 0;
              const isPartiallySelected = selectedCount > 0 && selectedCount < count;
              const isFullySelected = selectedCount >= count;
              
              return (
                <div key={type} className="relative">
                  <TrainCard
                    type={type}
                    count={count}
                    size="large"
                    onClick={() => onCardSelect(type, indices[0])}
                    isSelected={isFullySelected}
                  />
                  
                  {/* Partial selection indicator */}
                  {isPartiallySelected && (
                    <div 
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-xs"
                      style={{
                        background: 'linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)',
                        border: '2px solid hsl(30 50% 30%)',
                        color: 'hsl(30 30% 15%)',
                      }}
                    >
                      {selectedCount}
                    </div>
                  )}
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
        <div className="w-px min-h-[120px] bg-ornament/30" />
        
        {/* Destination tickets */}
        <div className="w-72">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-display font-semibold text-foreground">
              Маршруты
            </span>
            <span className="text-xs text-muted-foreground">
              ({destinationTickets.length})
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {destinationTickets.map((ticket) => (
              <DestinationCard
                key={ticket.id}
                ticket={ticket}
                size="small"
                isCompleted={ticket.isCompleted}
                onClick={onTicketClick ? () => onTicketClick(ticket) : undefined}
              />
            ))}
            
            {destinationTickets.length === 0 && (
              <div className="text-sm text-muted-foreground italic">
                Нет маршрутов
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
