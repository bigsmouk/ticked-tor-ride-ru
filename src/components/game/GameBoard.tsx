import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EuropeMap } from '@/components/game/EuropeMap';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { PlayerHand } from '@/components/game/PlayerHand';
import { CardDeckArea } from '@/components/game/CardDeckArea';
import { ActionPanel } from '@/components/game/ActionPanel';
import { DestinationPickerModal } from '@/components/game/DestinationPickerModal';
import { GameOverModal } from '@/components/game/GameOverModal';
import { GameLog } from '@/components/game/GameLog';
import { ConnectionIndicator } from '@/components/game/ConnectionIndicator';
import { AuthControls } from '@/components/auth/AuthControls';
import { LeaveGameButton } from '@/components/game/LeaveGameButton';
import { PlayerProfileModal } from '@/components/game/PlayerProfileModal';
import { KickVoteModal } from '@/components/game/KickVoteModal';
import { useGameStore } from '@/stores/gameStore';
import { TrainCardType, DestinationTicket, Player } from '@/types/game';
import { useGameSyncContext } from '@/contexts/gameSyncContext';
import { usePresence } from '@/hooks/usePresence';
import { playTurnNotificationSound } from '@/hooks/useGameSounds';

export const GameBoard: React.FC = () => {
  const { gameState, localPlayerId, currentRoom, drawTrainCard, startDrawingCards, cancelDrawingCards, claimRoute, canClaimRoute, drawDestinations, keepDestinations, getRouteCardRequirement, cancelDestinationDraw, addLog, getClaimRouteError, initiateKickVote, castKickVote, resolveKickVote, cancelKickVote } = useGameStore();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<TrainCardType[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [availableDestinations, setAvailableDestinations] = useState<DestinationTicket[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerProfile, setShowPlayerProfile] = useState(false);
  
  // Получаем функцию синхронизации и статус подключения (из провайдера, один канал на страницу)
  const { sendActionToHost, isHost, connectionStatus, lastSyncTime, reconnectAttempt, attemptReconnect } = useGameSyncContext();
  
  // Отслеживание онлайн-статуса игроков
  const { isPlayerOnline } = usePresence(currentRoom?.id || null);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerProfile(true);
  };

  const handleInitiateKick = (playerId: string) => {
    if (isHost) {
      initiateKickVote(playerId, localPlayerId || '');
    } else {
      sendActionToHost({ 
        type: 'initiateKickVote', 
        targetPlayerId: playerId,
        initiatorId: localPlayerId || ''
      });
    }
    setShowPlayerProfile(false);
  };

  const handleCastVote = useCallback((approve: boolean) => {
    if (!localPlayerId) return;
    
    if (isHost) {
      castKickVote(localPlayerId, approve);
    } else {
      sendActionToHost({
        type: 'castKickVote',
        targetPlayerId: gameState?.activeKickVote?.targetPlayerId || '',
        voterId: localPlayerId,
        approve
      });
    }
  }, [isHost, localPlayerId, castKickVote, sendActionToHost, gameState?.activeKickVote?.targetPlayerId]);

  // Timer effect for kick vote expiration (host only)
  useEffect(() => {
    if (!isHost || !gameState?.activeKickVote) return;

    const checkExpiration = () => {
      if (gameState.activeKickVote && Date.now() >= gameState.activeKickVote.expiresAt) {
        // Vote expired - resolve it
        resolveKickVote();
      }
    };

    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [isHost, gameState?.activeKickVote, resolveKickVote]);

  // Сбрасываем выделение при смене хода и проигрываем звук если ход перешёл к нам
  const prevCurrentPlayerId = useRef(gameState?.currentPlayerId);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (gameState?.currentPlayerId !== prevCurrentPlayerId.current) {
      setSelectedRoute(null);
      setSelectedCards([]);
      setSelectedCardIndices([]);
      
      // Проигрываем звук если ход перешёл к текущему игроку (не при первом рендере)
      if (!isFirstRender.current && gameState?.currentPlayerId === localPlayerId && gameState?.phase !== 'finished') {
        playTurnNotificationSound();
      }
      
      prevCurrentPlayerId.current = gameState?.currentPlayerId;
    }
    isFirstRender.current = false;
  }, [gameState?.currentPlayerId, localPlayerId, gameState?.phase]);

  if (!gameState) return <div className="flex items-center justify-center h-screen">Загрузка...</div>;

  const localPlayer = gameState.players.find(p => p.id === localPlayerId);
  const isMyTurn = gameState.currentPlayerId === localPlayerId;
  const canInteract = isMyTurn && gameState.currentAction === 'none';

  const handleRouteClick = (routeId: string) => {
    // Можно выбирать маршрут только если наш ход и нет активного действия
    if (!canInteract) return;
    
    if (selectedRoute === routeId) {
      setSelectedRoute(null);
      setSelectedCards([]);
      setSelectedCardIndices([]);
    } else {
      setSelectedRoute(routeId);
      setSelectedCards([]);
      setSelectedCardIndices([]);
    }
  };

  const handleCardSelect = (card: TrainCardType, cardIndex: number) => {
    // Проверяем что наш ход и нет активного действия
    if (!canInteract) return;
    
    // Проверяем требования маршрута
    if (!selectedRoute) return;
    
    const route = gameState.routes.find(r => r.id === selectedRoute);
    if (!route) return;
    
    if (selectedCardIndices.includes(cardIndex)) {
      // Убираем карту
      const idx = selectedCardIndices.indexOf(cardIndex);
      setSelectedCards(selectedCards.filter((_, i) => i !== idx));
      setSelectedCardIndices(selectedCardIndices.filter(i => i !== cardIndex));
    } else {
      // Проверяем не превышен ли лимит
      if (selectedCards.length >= route.length) return;
      
      // Проверяем валидность карты для маршрута
      const isValidCard = card === 'locomotive' || 
        route.color === 'gray' || 
        card === route.color;
      
      if (!isValidCard) return;
      
      // Добавляем карту
      setSelectedCards([...selectedCards, card]);
      setSelectedCardIndices([...selectedCardIndices, cardIndex]);
    }
  };

  // Начать режим выбора карт
  const handleStartDrawingCards = () => {
    if (isHost) {
      startDrawingCards();
    } else {
      sendActionToHost({ type: 'startDrawingCards' });
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

  // Отмена режима выбора карт
  const handleCancelDrawingCards = () => {
    if (isHost) {
      cancelDrawingCards();
    } else {
      sendActionToHost({ type: 'cancelDrawingCards' });
    }
  };

  const handleDrawDestinations = () => {
    // Берём 3 карты маршрутов из колоды
    const destinations = gameState.destinationDeck.slice(0, 3);
    if (destinations.length === 0) return;
    
    setAvailableDestinations(destinations);
    setShowDestinationPicker(true);
    
    if (isHost) {
      drawDestinations();
    } else {
      sendActionToHost({ type: 'drawDestinations' });
    }
  };

  const handleKeepDestinations = (ticketIds: string[]) => {
    if (ticketIds.length < 1) return;
    
    if (isHost) {
      keepDestinations(ticketIds);
    } else {
      sendActionToHost({ type: 'keepDestinations', ticketIds });
    }
    
    setShowDestinationPicker(false);
    setAvailableDestinations([]);
  };

  const handleCancelDestinations = () => {
    // Отменяем действие и сбрасываем состояние
    if (isHost) {
      cancelDestinationDraw();
    } else {
      sendActionToHost({ type: 'cancelDestinationDraw' });
    }
    setShowDestinationPicker(false);
    setAvailableDestinations([]);
  };

  const handleClaimRoute = () => {
    if (!selectedRoute) return;
    
    const route = gameState.routes.find(r => r.id === selectedRoute);
    if (!route) return;
    
    // Проверяем что выбрано достаточно карт
    if (selectedCards.length < route.length) {
      return;
    }
    
    if (isHost) {
      claimRoute(selectedRoute, selectedCards);
    } else {
      sendActionToHost({ type: 'claimRoute', routeId: selectedRoute, cardsUsed: selectedCards });
    }
    setSelectedRoute(null);
    setSelectedCards([]);
    setSelectedCardIndices([]);
  };

  // Получаем требования выбранного маршрута
  const routeRequirement = selectedRoute ? getRouteCardRequirement(selectedRoute) : null;
  const claimError = selectedRoute ? getClaimRouteError(selectedRoute) : null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-12 px-4 flex items-center justify-between bg-primary text-primary-foreground border-b-2 border-gold">
        <h1 className="font-display font-bold text-lg">Ticket to Ride: Европа</h1>
        <div className="flex items-center gap-4">
          <ConnectionIndicator 
            status={connectionStatus} 
            isHost={isHost} 
            lastSyncTime={lastSyncTime}
            reconnectAttempt={reconnectAttempt}
            onReconnect={attemptReconnect}
          />
          <div className="text-sm">Ход: {gameState.turnNumber}</div>
          <LeaveGameButton />
          <AuthControls />
        </div>
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
              isOnline={isPlayerOnline(player.id)}
              position="left"
              index={i}
              onClick={() => handlePlayerClick(player)}
            />
          ))}
        </aside>

        {/* Main game area */}
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          {/* Map and logs row */}
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Map */}
            <div className="flex-1 game-board rounded-lg overflow-hidden">
              <EuropeMap
                cities={gameState.cities}
                routes={gameState.routes}
                onRouteClick={handleRouteClick}
                selectedRoute={selectedRoute}
              />
            </div>
            
            {/* Game logs panel */}
            <div className="w-72 bg-sidebar rounded-lg border border-ornament/30 overflow-hidden flex flex-col">
              <GameLog 
                logs={gameState.logs} 
                players={gameState.players}
              />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="flex gap-4">
            <CardDeckArea
              faceUpCards={gameState.faceUpCards}
              deckCount={gameState.trainCardDeck.length}
              onDrawFromDeck={() => handleDrawTrainCard(false)}
              onDrawFaceUp={(i) => handleDrawTrainCard(true, i)}
              canDraw={isMyTurn && (gameState.currentAction === 'selectingFirstCard' || gameState.currentAction === 'drawTrainCards')}
              currentAction={gameState.currentAction}
            />
            <ActionPanel
              isMyTurn={isMyTurn}
              currentAction={gameState.currentAction}
              selectedRouteId={selectedRoute}
              selectedCards={selectedCards}
              canClaimSelectedRoute={selectedRoute ? canClaimRoute(selectedRoute) && selectedCards.length === (routeRequirement?.count || 0) : false}
              onDrawCards={handleStartDrawingCards}
              onDrawDestinations={handleDrawDestinations}
              onClaimRoute={handleClaimRoute}
              onCancelAction={handleCancelDrawingCards}
              trainsRemaining={localPlayer?.trainsRemaining || 0}
              routeRequirement={routeRequirement}
              claimError={claimError}
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
              isOnline={isPlayerOnline(player.id)}
              position="right"
              index={i + 2}
              onClick={() => handlePlayerClick(player)}
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
            selectedCardIndices={selectedCardIndices}
            onCardSelect={handleCardSelect}
            routeRequirement={routeRequirement}
          />
        </footer>
      )}

      {/* Destination picker modal */}
      {showDestinationPicker && (
        <DestinationPickerModal
          destinations={availableDestinations}
          minKeep={1}
          onConfirm={handleKeepDestinations}
          onCancel={handleCancelDestinations}
        />
      )}
      
      {/* Game over modal */}
      <GameOverModal />

      {/* Player profile modal */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={showPlayerProfile}
        onClose={() => setShowPlayerProfile(false)}
        isHost={currentRoom?.hostId === selectedPlayer?.id}
        isLocalPlayer={selectedPlayer?.id === localPlayerId}
        isOnline={selectedPlayer ? isPlayerOnline(selectedPlayer.id) : false}
        canKick={!selectedPlayer?.id?.includes(localPlayerId || '') && gameState.players.length > 2 && !gameState.activeKickVote}
        onInitiateKick={handleInitiateKick}
      />

      {/* Kick vote modal */}
      <KickVoteModal
        vote={gameState?.activeKickVote || null}
        players={gameState?.players || []}
        localPlayerId={localPlayerId || ''}
        isOpen={!!gameState?.activeKickVote}
        isHost={isHost}
        onVote={handleCastVote}
        onCancelVote={() => {
          if (isHost) {
            cancelKickVote();
          }
        }}
        onClose={() => {}} // Cannot close during vote
      />
    </div>
  );
};