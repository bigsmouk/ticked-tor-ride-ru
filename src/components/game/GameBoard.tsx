import { canSelectRouteCard, validateRoutePayment } from '@/utils/routePayment';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GameBoardLayout.css';
import { EuropeMap } from '@/components/game/EuropeMap';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { PlayerHand } from '@/components/game/PlayerHand';
import { CardDeckArea } from '@/components/game/CardDeckArea';
import { ActionPanel } from '@/components/game/ActionPanel';
import { DestinationPickerModal } from '@/components/game/DestinationPickerModal';
import { StationBuilderModal } from '@/components/game/StationBuilderModal';
import { GameOverModal } from '@/components/game/GameOverModal';
import { GameLog } from '@/components/game/GameLog';
import { ConnectionIndicator } from '@/components/game/ConnectionIndicator';
import { AuthControls } from '@/components/auth/AuthControls';
import { LeaveGameButton } from '@/components/game/LeaveGameButton';
import { PlayerProfileModal } from '@/components/game/PlayerProfileModal';
import { KickVoteModal } from '@/components/game/KickVoteModal';
import { TunnelRevealModal } from '@/components/game/TunnelRevealModal';
import { useGameStore } from '@/stores/gameStore';
import { TrainCardType, DestinationTicket, Player } from '@/types/game';
import { useGameSyncContext } from '@/contexts/gameSyncContext';
import { usePresence } from '@/hooks/usePresence';
import { playTurnNotificationSound } from '@/hooks/useGameSounds';

export const GameBoard: React.FC = () => {
  const { 
    gameState, localPlayerId, currentRoom, 
    drawTrainCard, startDrawingCards, cancelDrawingCards, 
    claimRoute, attemptClaimTunnel, confirmTunnelClaim, cancelTunnelClaim, canPayTunnelExtra,
    canClaimRoute, drawDestinations, keepDestinations, 
    getRouteCardRequirement, cancelDestinationDraw, addLog, getClaimRouteError, 
    initiateKickVote, castKickVote, resolveKickVote, cancelKickVote,
    startBuildStation, buildStation, cancelBuildStation, getStationCost
  } = useGameStore();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showGameLog, setShowGameLog] = useState(false);
  const [showHand, setShowHand] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [hoveredTicket, setHoveredTicket] = useState<DestinationTicket | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<TrainCardType[]>([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState<number[]>([]);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);
  const [availableDestinations, setAvailableDestinations] = useState<DestinationTicket[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showStationBuilder, setShowStationBuilder] = useState(false);
  const [showPlayerProfile, setShowPlayerProfile] = useState(false);
  
  // Browser-safe single-key shortcuts: J = hand, O = deck, P = both.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      const key = event.key.toLowerCase();
      if (key !== 'j' && key !== 'o' && key !== 'p') return;
      event.preventDefault();
      if (key === 'j') setShowHand(open => !open);
      if (key === 'o') setShowDeck(open => !open);
      if (key === 'p') { setShowHand(true); setShowDeck(true); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // Получаем функцию синхронизации и статус подключения (из провайдера, один канал на страницу)
  const { sendActionToHost, isHost, connectionStatus, lastSyncTime, reconnectAttempt, attemptReconnect } = useGameSyncContext();
  
  // Отслеживание онлайн-статуса игроков
  const { isPlayerOnline } = usePresence(currentRoom?.id || null);

  const handlePlayerClick = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerProfile(true);
  }, []);

  const handleInitiateKick = useCallback((playerId: string) => {
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
  }, [isHost, initiateKickVote, localPlayerId, sendActionToHost]);

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

  // Вычисляем значения даже если gameState null — хуки всегда вызываются
  const localPlayer = gameState?.players.find(p => p.id === localPlayerId) ?? null;
  // Card selection is UI-only: reconcile indices against the authoritative hand.
  const handSignature = localPlayer?.trainCards.join('|') ?? '';
  useEffect(() => {
    setSelectedCardIndices([]);
    setSelectedCards([]);
  }, [handSignature, localPlayerId]);
  const isMyTurn = gameState?.currentPlayerId === localPlayerId;
  const canInteract = isMyTurn && gameState?.currentAction === 'none';
  
  // Если нет gameState, показываем пустой контейнер (скрыт через parent visibility)
  if (!gameState) {
    return <div className="ttr-game h-screen flex flex-col bg-background overflow-hidden" />;
  }

  const handleRouteClick = (routeId: string) => {
    // Можно выбирать маршрут только если наш ход и нет активного действия
    if (!canInteract) return;
    
    if (selectedRoute === routeId) {
      setSelectedRoute(null);
      setSelectedCards([]);
      setSelectedCardIndices([]);
    } else {
      setSelectedRoute(routeId);
      const warning = getClaimRouteError(routeId);
      if (warning) setNotice(warning);
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
      const isValidCard = canSelectRouteCard(route, selectedCards, card);
      
      if (!isValidCard) return;
      
      // Добавляем карту
      setSelectedCards([...selectedCards, card]);
      setSelectedCardIndices([...selectedCardIndices, cardIndex]);
    }
  };

  // Начать режим выбора карт
  const handleStartDrawingCards = () => {
    if (gameState.trainCardDeck.length === 0 && gameState.faceUpCards.filter(Boolean).length === 0) {
      setNotice('Нет доступных карт вагонов.');
      return;
    }
    // Сбрасываем выбранный маршрут при начале взятия карт
    setSelectedRoute(null);
    setSelectedCards([]);
    setSelectedCardIndices([]);
    
    if (isHost) {
      startDrawingCards();
    } else {
      sendActionToHost({ type: 'startDrawingCards' });
    }
  };

  // Обёртка для действий - хост выполняет локально, не-хост отправляет хосту
  const handleDrawTrainCard = (fromFaceUp: boolean, cardIndex?: number) => {
    if (!fromFaceUp && gameState.trainCardDeck.length === 0) {
      setNotice('Колода вагонов пуста.');
      return;
    }
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
    // Сбрасываем выбранный маршрут при начале взятия билетов
    setSelectedRoute(null);
    setSelectedCards([]);
    setSelectedCardIndices([]);
    
    // Берём 3 карты маршрутов из колоды
    const destinations = gameState.destinationDeck.slice(0, 3);
    if (destinations.length === 0) { setNotice('Колода билетов пуста.'); return; }
    
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
    
    const paymentError = validateRoutePayment(route, selectedCards, localPlayer?.trainCards ?? []);
    if (paymentError) { setNotice(paymentError); return; }
    const routeError = getClaimRouteError(selectedRoute);
    if (routeError) { setNotice(routeError); return; }
    // Если это туннель - используем специальную механику
    if (route.isTunnel) {
      if (isHost) {
        attemptClaimTunnel(selectedRoute, selectedCards);
      } else {
        sendActionToHost({ type: 'attemptClaimTunnel', routeId: selectedRoute, cardsUsed: selectedCards });
      }
    } else {
      if (isHost) {
        claimRoute(selectedRoute, selectedCards);
      } else {
        sendActionToHost({ type: 'claimRoute', routeId: selectedRoute, cardsUsed: selectedCards });
      }
    }
    setSelectedRoute(null);
    setSelectedCards([]);
    setSelectedCardIndices([]);
  };

  // Handle tunnel confirmation
  const handleConfirmTunnel = () => {
    if (!gameState?.tunnelReveal) return;
    
    const { colorUsed, extraCardsNeeded, cardsUsed } = gameState.tunnelReveal;
    
    // Find extra cards to pay (from remaining hand)
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return;
    
    // Build remaining cards after original selection
    const remainingCards = [...player.trainCards];
    for (const card of cardsUsed) {
      const idx = remainingCards.indexOf(card);
      if (idx > -1) remainingCards.splice(idx, 1);
    }
    
    // Select extra cards to pay
    const extraCards: TrainCardType[] = [];
    let needed = extraCardsNeeded;
    
    // First try to use same color
    for (let i = 0; i < remainingCards.length && needed > 0; i++) {
      if (remainingCards[i] === colorUsed) {
        extraCards.push(remainingCards[i]);
        remainingCards.splice(i, 1);
        i--;
        needed--;
      }
    }
    
    // Then use locomotives
    for (let i = 0; i < remainingCards.length && needed > 0; i++) {
      if (remainingCards[i] === 'locomotive') {
        extraCards.push(remainingCards[i]);
        remainingCards.splice(i, 1);
        i--;
        needed--;
      }
    }
    
    if (isHost) {
      confirmTunnelClaim(extraCards);
    } else {
      sendActionToHost({ type: 'confirmTunnelClaim', extraCards });
    }
  };

  const handleCancelTunnel = () => {
    if (isHost) {
      cancelTunnelClaim();
    } else {
      sendActionToHost({ type: 'cancelTunnelClaim' });
    }
  };

  // Station building handlers
  const handleStartBuildStation = () => {
    // Сбрасываем выбранный маршрут при начале постройки станции
    setSelectedRoute(null);
    setSelectedCards([]);
    setSelectedCardIndices([]);
    
    setShowStationBuilder(true);
    if (isHost) {
      startBuildStation();
    } else {
      sendActionToHost({ type: 'startBuildStation' });
    }
  };

  const handleBuildStation = (cityId: string, cardsUsed: TrainCardType[]) => {
    if (isHost) {
      buildStation(cityId, cardsUsed);
    } else {
      sendActionToHost({ type: 'buildStation', cityId, cardsUsed });
    }
    setShowStationBuilder(false);
  };

  const handleCancelBuildStation = () => {
    if (isHost) {
      cancelBuildStation();
    } else {
      sendActionToHost({ type: 'cancelBuildStation' });
    }
    setShowStationBuilder(false);
  };

  // Получаем требования выбранного маршрута
  const routeRequirement = selectedRoute ? getRouteCardRequirement(selectedRoute) : null;
  const claimError = selectedRoute ? getClaimRouteError(selectedRoute) : null;
  const stationCost = getStationCost();

  const isSoloMode = currentRoom?.isSoloMode;

  return (
    <div className="ttr-game h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="ttr-header h-10 px-3 flex items-center justify-between bg-primary text-primary-foreground border-b border-gold">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-sm sm:text-base">Ticket to Ride: Европа</h1>
          {isSoloMode && (
            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-200 rounded-full border border-amber-500/30">
              🎯 Соло
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {!isSoloMode && (
            <ConnectionIndicator 
              status={connectionStatus} 
              isHost={isHost} 
              lastSyncTime={lastSyncTime}
              reconnectAttempt={reconnectAttempt}
              onReconnect={attemptReconnect}
            />
          )}
          <div className="text-sm">Ход: {gameState.turnNumber}</div>
          <LeaveGameButton />
          <div className="ttr-profile-control"><AuthControls /></div>
        </div>
      </header>

      <div className="ttr-stage">
        {notice && <div className="ttr-toast" role="alert">
          <span>⚠️ {notice}</span>
          <button type="button" aria-label="Закрыть уведомление" onClick={() => setNotice(null)}>×</button>
        </div>}
        <div className="ttr-map">
              <EuropeMap
                cities={gameState.cities}
                routes={gameState.routes}
                onRouteClick={handleRouteClick}
                selectedRoute={selectedRoute}
                highlightedCities={hoveredTicket?.cities ?? null}
              />
        </div>
        <aside className={`ttr-players ttr-overlay`} aria-label="Игроки">
          {gameState.players.map((player, i) => (
            <div className="ttr-player-card" key={player.id}>
              <PlayerPanel
                player={player}
                isCurrentPlayer={player.id === gameState.currentPlayerId}
                isLocalPlayer={player.id === localPlayerId}
                isOnline={isPlayerOnline(player.id)}
                position={i < 2 ? 'left' : 'right'}
                index={i}
                onClick={() => handlePlayerClick(player)}
              />
            </div>
          ))}
        </aside>
        <div className={`ttr-history-anchor ttr-overlay`}>
          <button type="button" className="ttr-log-toggle" onClick={() => setShowGameLog(prev => !prev)} aria-expanded={showGameLog}>
            📜 {showGameLog ? 'Скрыть историю' : 'История'}
          </button>
          {showGameLog && <div className="ttr-log"><GameLog logs={gameState.logs} players={gameState.players} /></div>}
        </div>
        <div className={`ttr-bottom-ui ttr-overlay ${showDeck ? 'is-open' : ''}`}>
          <button type="button" className="ttr-deck-drawer-toggle" onClick={() => setShowDeck(open => !open)} aria-expanded={showDeck} aria-controls="ttr-deck-drawer" title="Показать или скрыть колоду (O)">
            🃏 Колода <span className="ttr-shortcut">O</span> <span aria-hidden="true">{showDeck ? '▾' : '▴'}</span>
          </button>
          <div id="ttr-deck-drawer" className="ttr-controls" aria-hidden={!showDeck}>
            <div className="ttr-deck">
              <CardDeckArea
                faceUpCards={gameState.faceUpCards}
                deckCount={gameState.trainCardDeck.length}
                onDrawFromDeck={() => handleDrawTrainCard(false)}
                onDrawFaceUp={(i) => handleDrawTrainCard(true, i)}
                canDraw={isMyTurn && (gameState.currentAction === 'selectingFirstCard' || gameState.currentAction === 'drawTrainCards')}
                currentAction={gameState.currentAction}
              />
            </div>
            <div className="ttr-actions">
              <ActionPanel
                isMyTurn={isMyTurn}
                currentAction={gameState.currentAction}
                selectedRouteId={selectedRoute}
                selectedCards={selectedCards}
                canClaimSelectedRoute={selectedRoute ? canClaimRoute(selectedRoute) && !!localPlayer && !validateRoutePayment(gameState.routes.find(r => r.id === selectedRoute)!, selectedCards, localPlayer.trainCards) : false}
                onDrawCards={handleStartDrawingCards}
                onDrawDestinations={handleDrawDestinations}
                onClaimRoute={handleClaimRoute}
                onCancelAction={gameState.currentAction === 'buildStation' ? handleCancelBuildStation : handleCancelDrawingCards}
                onBuildStation={handleStartBuildStation}
                trainsRemaining={localPlayer?.trainsRemaining || 0}
                stationsRemaining={localPlayer?.stationsRemaining || 0}
                routeRequirement={routeRequirement}
                claimError={claimError}
                stationCost={stationCost}
              />
            </div>
          </div>
        </div>
        {localPlayer && <aside className={`ttr-hand-side ttr-overlay ${showHand ? 'is-open' : '' }`} aria-label="Мои карты и билеты">
          <button type="button" className="ttr-hand-edge-toggle" onClick={() => setShowHand(open => !open)} aria-expanded={showHand} aria-controls="ttr-hand-drawer" title="Мои карты и билеты (J)">
            <span aria-hidden="true">{showHand ? '❯' : '❮'}</span>
            <span>Карты</span><span>Билеты</span>
            <small>J</small>
          </button>
          <div id="ttr-hand-drawer" className="ttr-hand-content" aria-hidden={!showHand}>
            <PlayerHand
              trainCards={localPlayer.trainCards}
              destinationTickets={localPlayer.destinationTickets}
              onTicketHover={setHoveredTicket}
              selectedCardIndices={selectedCardIndices}
              onCardSelect={handleCardSelect}
              routeRequirement={routeRequirement}
            />
          </div>
        </aside>}
      </div>

      {/* Destination picker modal */}
      {showDestinationPicker && (
        <DestinationPickerModal
          destinations={availableDestinations}
          minKeep={1}
          onConfirm={handleKeepDestinations}
          onCancel={handleCancelDestinations}
        />
      )}
      
      {/* Station builder modal */}
      {showStationBuilder && gameState.currentAction === 'buildStation' && (
        <StationBuilderModal
          cities={gameState.cities}
          cost={stationCost}
          onConfirm={handleBuildStation}
          onCancel={handleCancelBuildStation}
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

      {/* Tunnel reveal modal */}
      {gameState?.tunnelReveal && gameState.currentPlayerId === localPlayerId && (
        <TunnelRevealModal
          routeName={gameState.tunnelReveal.routeName}
          revealedCards={gameState.tunnelReveal.revealedCards}
          extraCardsNeeded={gameState.tunnelReveal.extraCardsNeeded}
          colorUsed={gameState.tunnelReveal.colorUsed}
          onPayExtra={handleConfirmTunnel}
          onCancel={handleCancelTunnel}
          canPayExtra={canPayTunnelExtra()}
        />
      )}

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