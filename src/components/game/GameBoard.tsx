import React, { useState, useContext, createContext } from 'react';
import { EuropeMap } from '@/components/game/EuropeMap';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { PlayerHand } from '@/components/game/PlayerHand';
import { CardDeckArea } from '@/components/game/CardDeckArea';
import { ActionPanel } from '@/components/game/ActionPanel';
import { useGameStore } from '@/stores/gameStore';
import { TrainCardType } from '@/types/game';
import { useGameSync, GameAction } from '@/hooks/useGameSync';

// Context для передачи sendActionToHost в дочерние компоненты
const GameSyncContext = createContext<{
  sendActionToHost: (action: GameAction) => void;
  isHost: boolean;
} | null>(null);

export const useGameSyncContext = () => useContext(GameSyncContext);

export const GameBoard: React.FC = () => {
  const { gameState, localPlayerId, currentRoom, drawTrainCard, claimRoute, canClaimRoute } = useGameStore();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<TrainCardType[]>([]);
  
  // Получаем функцию синхронизации
  const { sendActionToHost, isHost } = useGameSync(currentRoom?.id || null);

  if (!gameState) return <div className="flex items-center justify-center h-screen">Загрузка...</div>;

  const localPlayer = gameState.players.find(p => p.id === localPlayerId);
  const isMyTurn = gameState.currentPlayerId === localPlayerId;

  const handleRouteClick = (routeId: string) => {
    if (selectedRoute === routeId) {
      setSelectedRoute(null);
      setSelectedCards([]);
    } else {
      setSelectedRoute(routeId);
      setSelectedCards([]);
    }
  };

  const handleCardSelect = (card: TrainCardType) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  // Обёртка для действий - хост выполняет локально, не-хост отправляет хосту
  const handleDrawTrainCard = (fromFaceUp: boolean, cardIndex?: number) => {
    if (isHost) {
      drawTrainCard(fromFaceUp, cardIndex);
    } else {
      sendActionToHost({ type: 'drawTrainCard', fromFaceUp, cardIndex });
    }
  };

  const handleClaimRoute = () => {
    if (selectedRoute && selectedCards.length > 0) {
      if (isHost) {
        claimRoute(selectedRoute, selectedCards);
      } else {
        sendActionToHost({ type: 'claimRoute', routeId: selectedRoute, cardsUsed: selectedCards });
      }
      setSelectedRoute(null);
      setSelectedCards([]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-12 px-4 flex items-center justify-between bg-primary text-primary-foreground border-b-2 border-gold">
        <h1 className="font-display font-bold text-lg">Ticket to Ride: Europe</h1>
        <div className="text-sm">Ход: {gameState.turnNumber}</div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left players */}
        <aside className="w-52 p-3 flex flex-col gap-3 bg-sidebar border-r border-ornament/30 overflow-y-auto">
          {gameState.players.slice(0, 2).map((player, i) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === gameState.currentPlayerId}
              isLocalPlayer={player.id === localPlayerId}
              position="left"
              index={i}
            />
          ))}
        </aside>

        {/* Main game area */}
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Map */}
          <div className="flex-1 game-board rounded-lg overflow-hidden">
            <EuropeMap
              cities={gameState.cities}
              routes={gameState.routes}
              onRouteClick={handleRouteClick}
              selectedRoute={selectedRoute}
            />
          </div>

          {/* Bottom controls */}
          <div className="flex gap-4">
            <CardDeckArea
              faceUpCards={gameState.faceUpCards}
              deckCount={gameState.trainCardDeck.length}
              onDrawFromDeck={() => handleDrawTrainCard(false)}
              onDrawFaceUp={(i) => handleDrawTrainCard(true, i)}
              canDraw={isMyTurn && gameState.currentAction !== 'drawDestinations'}
              currentAction={gameState.currentAction}
            />
            <ActionPanel
              isMyTurn={isMyTurn}
              currentAction={gameState.currentAction}
              selectedRouteId={selectedRoute}
              selectedCards={selectedCards}
              canClaimSelectedRoute={selectedRoute ? canClaimRoute(selectedRoute) : false}
              onDrawCards={() => handleDrawTrainCard(false)}
              onDrawDestinations={() => {}}
              onClaimRoute={handleClaimRoute}
              onCancelAction={() => { setSelectedRoute(null); setSelectedCards([]); }}
              trainsRemaining={localPlayer?.trainsRemaining || 0}
            />
          </div>
        </main>

        {/* Right players */}
        <aside className="w-52 p-3 flex flex-col gap-3 bg-sidebar border-l border-ornament/30 overflow-y-auto">
          {gameState.players.slice(2, 4).map((player, i) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isCurrentPlayer={player.id === gameState.currentPlayerId}
              isLocalPlayer={player.id === localPlayerId}
              position="right"
              index={i + 2}
            />
          ))}
        </aside>
      </div>

      {/* Player hand */}
      {localPlayer && (
        <footer className="p-4 bg-sidebar border-t-2 border-ornament">
          <PlayerHand
            trainCards={localPlayer.trainCards}
            destinationTickets={localPlayer.destinationTickets}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
          />
        </footer>
      )}
    </div>
  );
};
