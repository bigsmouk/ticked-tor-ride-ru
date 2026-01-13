import React from 'react';
import { TurnAction } from '@/types/game';
import { Button } from '@/components/ui/button';

interface ActionPanelProps {
  isMyTurn: boolean;
  currentAction: TurnAction;
  selectedRouteId: string | null;
  selectedCards: string[];
  canClaimSelectedRoute: boolean;
  onDrawCards: () => void;
  onDrawDestinations: () => void;
  onClaimRoute: () => void;
  onCancelAction: () => void;
  onBuildStation?: () => void;
  trainsRemaining: number;
  stationsRemaining: number;
  routeRequirement?: { color: string; count: number } | null;
  claimError?: string | null;
  stationCost?: number;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  isMyTurn,
  currentAction,
  selectedRouteId,
  selectedCards,
  canClaimSelectedRoute,
  onDrawCards,
  onDrawDestinations,
  onClaimRoute,
  onCancelAction,
  onBuildStation,
  trainsRemaining,
  stationsRemaining,
  routeRequirement,
  claimError,
  stationCost = 1,
}) => {
  if (!isMyTurn) {
    return (
      <div className="parchment rounded-lg border-2 border-ornament p-4 shadow-vintage">
        <div className="text-center">
          <div className="text-lg font-display font-semibold text-muted-foreground">
            Ожидание хода...
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Сейчас ходит другой игрок
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="parchment rounded-lg border-2 border-ornament p-4 shadow-vintage">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-display font-semibold text-foreground">
          Ваш ход
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Вагонов:</span>
          <span className="font-display font-bold text-lg text-foreground">{trainsRemaining}</span>
        </div>
      </div>
      
      {currentAction === 'none' && (
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-vintage rounded-lg"
            onClick={onDrawCards}
          >
            🎴 Взять карты
          </button>
          
          <button
            className="btn-vintage rounded-lg"
            onClick={onDrawDestinations}
          >
            🎫 Взять маршруты
          </button>
          
          {stationsRemaining > 0 && onBuildStation && (
            <button
              className="btn-vintage rounded-lg"
              onClick={onBuildStation}
              title={`Построить станцию (${stationCost} карт)`}
            >
              🏛️ Станция ({stationCost})
            </button>
          )}
          
          {selectedRouteId && canClaimSelectedRoute && (
            <button
              className="btn-gold rounded-lg animate-pulse"
              onClick={onClaimRoute}
            >
              🚃 Построить путь
            </button>
          )}
          
          {selectedRouteId && !canClaimSelectedRoute && (
            <div className="flex items-center px-4 py-2 bg-destructive/20 rounded-lg text-sm text-destructive">
              ⚠️ {claimError || 'Недостаточно карт для этого маршрута'}
            </div>
          )}
        </div>
      )}
      
      {currentAction === 'buildStation' && (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gold font-display animate-pulse">
            Выберите город для станции
          </div>
          <button
            className="btn-vintage rounded-lg text-sm"
            onClick={onCancelAction}
          >
            ❌ Отмена
          </button>
        </div>
      )}
      
      {currentAction === 'selectingFirstCard' && (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gold font-display animate-pulse">
            Выберите первую карту из открытых или из колоды
          </div>
          <button
            className="btn-vintage rounded-lg text-sm"
            onClick={onCancelAction}
          >
            ❌ Отмена
          </button>
        </div>
      )}
      
      {currentAction === 'drawTrainCards' && (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gold font-display animate-pulse">
            Выберите вторую карту (локомотив недоступен)
          </div>
        </div>
      )}
      
      {currentAction === 'drawDestinations' && (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gold font-display animate-pulse">
            Выберите маршруты для сохранения (минимум 1)
          </div>
        </div>
      )}
      
      {selectedRouteId && currentAction === 'none' && routeRequirement && (
        <div className="mt-3 p-2 bg-accent/30 rounded border border-accent">
          <div className="text-sm text-foreground">
            <span className="font-display font-semibold">Выбран маршрут</span>
            <span className="text-muted-foreground ml-2">
              Нужно {routeRequirement.count} карт ({routeRequirement.color === 'gray' ? 'любого цвета' : routeRequirement.color})
            </span>
            <span className="text-gold ml-2 font-bold">
              Выбрано: {selectedCards.length} / {routeRequirement.count}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
