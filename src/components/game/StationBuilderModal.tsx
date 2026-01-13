import React, { useState, useMemo } from 'react';
import { TrainCardType, City } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { TrainCard } from './TrainCard';

interface StationBuilderModalProps {
  cities: City[];
  cost: number;
  onConfirm: (cityId: string, cardsUsed: TrainCardType[]) => void;
  onCancel: () => void;
}

export const StationBuilderModal: React.FC<StationBuilderModalProps> = ({
  cities,
  cost,
  onConfirm,
  onCancel,
}) => {
  const { gameState, localPlayerId, canBuildStation } = useGameStore();
  
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<TrainCardType[]>([]);
  
  const player = gameState?.players.find(p => p.id === localPlayerId);
  
  // Get available cities (no station yet)
  const availableCities = useMemo(() => {
    if (!gameState) return [];
    const stationCityIds = new Set(gameState.placedStations.map(s => s.cityId));
    return cities.filter(city => !stationCityIds.has(city.id));
  }, [cities, gameState]);
  
  // Group player cards by type
  const cardGroups = useMemo(() => {
    if (!player) return [];
    const counts: Record<string, number> = {};
    player.trainCards.forEach(card => {
      counts[card] = (counts[card] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({ type: type as TrainCardType, count }))
      .sort((a, b) => {
        if (a.type === 'locomotive') return 1;
        if (b.type === 'locomotive') return -1;
        return b.count - a.count;
      });
  }, [player]);
  
  // Check if selected cards are valid for the cost
  const isValidSelection = useMemo(() => {
    if (selectedCards.length !== cost) return false;
    
    // For cost > 1, all non-locomotive cards must be the same color
    if (cost > 1) {
      const nonLocos = selectedCards.filter(c => c !== 'locomotive');
      if (nonLocos.length > 0) {
        const firstColor = nonLocos[0];
        if (!nonLocos.every(c => c === firstColor)) return false;
      }
    }
    
    return true;
  }, [selectedCards, cost]);
  
  // Toggle card selection
  const toggleCard = (cardType: TrainCardType) => {
    if (!player) return;
    
    // Count how many of this card are selected
    const selectedOfType = selectedCards.filter(c => c === cardType).length;
    const availableOfType = player.trainCards.filter(c => c === cardType).length;
    
    if (selectedOfType < availableOfType && selectedCards.length < cost) {
      // Can add more of this type
      setSelectedCards([...selectedCards, cardType]);
    } else if (selectedOfType > 0) {
      // Remove one of this type
      const index = selectedCards.indexOf(cardType);
      if (index > -1) {
        setSelectedCards(selectedCards.filter((_, i) => i !== index));
      }
    }
  };
  
  // Get selected count for a card type
  const getSelectedCount = (cardType: TrainCardType) => {
    return selectedCards.filter(c => c === cardType).length;
  };
  
  const handleConfirm = () => {
    if (selectedCityId && isValidSelection) {
      onConfirm(selectedCityId, selectedCards);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="parchment rounded-xl border-4 border-ornament p-6 shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">
          🏛️ Построить станцию
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Стоимость: {cost} {cost === 1 ? 'карта любого цвета' : `карты одного цвета`}
        </p>
        
        {/* City selection */}
        <div className="mb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-3">
            Выберите город:
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-background/50 rounded-lg">
            {availableCities.map(city => (
              <button
                key={city.id}
                onClick={() => setSelectedCityId(city.id)}
                className={`
                  px-2 py-1.5 text-xs rounded-lg border-2 transition-all duration-200
                  ${selectedCityId === city.id 
                    ? 'border-gold bg-gold/20 text-foreground shadow-md' 
                    : 'border-border bg-background hover:border-gold/50 text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Card selection */}
        <div className="mb-6">
          <h3 className="text-lg font-display font-semibold text-foreground mb-3">
            Выберите карты ({selectedCards.length}/{cost}):
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {cardGroups.map(({ type, count }) => {
              const selectedOfType = getSelectedCount(type);
              return (
                <div
                  key={type}
                  className="relative"
                >
                  <div
                    onClick={() => toggleCard(type)}
                    className={`
                      cursor-pointer transition-all duration-200
                      ${selectedOfType > 0 ? 'ring-4 ring-gold shadow-lg -translate-y-1' : 'opacity-80 hover:opacity-100'}
                    `}
                  >
                    <TrainCard type={type} size="medium" />
                  </div>
                  {/* Card count badge */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-background border-2 border-border rounded-full flex items-center justify-center text-xs font-bold">
                    {count}
                  </div>
                  {/* Selected count badge */}
                  {selectedOfType > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {selectedOfType}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Selected cards preview */}
          {selectedCards.length > 0 && (
            <div className="mt-4 p-3 bg-accent/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Выбранные карты:</div>
              <div className="flex justify-center gap-2">
                {selectedCards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedCards(selectedCards.filter((_, i) => i !== index));
                    }}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <TrainCard type={card} size="small" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Validation message */}
          {cost > 1 && selectedCards.length > 0 && !isValidSelection && (
            <p className="text-sm text-destructive text-center mt-2">
              Все карты должны быть одного цвета (или локомотивы)
            </p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="btn-vintage px-6 py-2 rounded-lg"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCityId || !isValidSelection}
            className="btn-gold px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Построить
          </button>
        </div>
      </div>
    </div>
  );
};
