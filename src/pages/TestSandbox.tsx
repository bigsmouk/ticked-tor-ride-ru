import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { TestMap, TestRouteState } from '@/components/game/TestMap';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RotateCcw, Users, Zap, Trophy, CreditCard, Train, Map } from 'lucide-react';
import { 
  EUROPE_CITIES, 
  EUROPE_ROUTES, 
  DESTINATION_TICKETS, 
  createTrainCardDeck, 
  shuffleArray 
} from '@/data/europeMap';
import { TEST_CITIES, TEST_ROUTES, TEST_DESTINATION_TICKETS } from '@/data/testMap';
import { 
  GameState, 
  TrainCardType, 
  DestinationTicket,
  Player,
  PlayerColor,
  City,
  Route,
  INITIAL_TRAINS,
  INITIAL_TRAIN_CARDS,
} from '@/types/game';

const SANDBOX_PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'black'];
const ALL_CARD_TYPES: TrainCardType[] = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'black', 'locomotive'];

type MapType = 'europe' | 'test';

// Convert test map data to game format
const convertTestCitiesToGame = (): City[] => {
  return TEST_CITIES.map(c => ({
    id: c.id,
    name: c.name,
    x: c.x,
    y: c.y,
  }));
};

const convertTestRoutesToGame = (): Route[] => {
  return TEST_ROUTES.map(r => ({
    id: r.id,
    cities: [r.from, r.to] as [string, string],
    length: r.length,
    color: r.color as Route['color'],
    isTunnel: r.type === 'tunnel',
    ferryLocomotives: r.ferryLocomotives,
    parallelRouteId: r.parallel === 1 ? TEST_ROUTES.find(
      pr => pr.from === r.from && pr.to === r.to && pr.parallel === 0
    )?.id : undefined,
  }));
};

const convertTestTicketsToGame = (): DestinationTicket[] => {
  return TEST_DESTINATION_TICKETS.map(t => ({
    id: t.id,
    cities: [t.from, t.to] as [string, string],
    points: t.points,
    isLongRoute: t.isLongRoute,
  }));
};

const TestSandbox = () => {
  const { gameState, setGameState, setCurrentRoom, setLocalPlayerId, localPlayerId, calculateFinalScores, claimRoute, canClaimRoute } = useGameStore();
  const [infiniteCards, setInfiniteCards] = useState(false);
  const [mapType, setMapType] = useState<MapType>('test');

  // Get cities/routes based on map type
  const getMapData = useCallback((type: MapType) => {
    if (type === 'test') {
      return {
        cities: convertTestCitiesToGame(),
        routes: convertTestRoutesToGame(),
        destinations: convertTestTicketsToGame(),
      };
    }
    return {
      cities: EUROPE_CITIES,
      routes: EUROPE_ROUTES.map(r => ({ ...r })),
      destinations: [...DESTINATION_TICKETS],
    };
  }, []);

  // Initialize sandbox game with specified number of players
  const initializeSandbox = useCallback((playerCount: number = 2, useMapType?: MapType) => {
    const sandboxRoomId = 'sandbox-test-room';
    const sandboxPlayerId = 'sandbox-player-1';
    const currentMapType = useMapType ?? mapType;
    const mapData = getMapData(currentMapType);
    
    // Create sandbox players
    const players: Player[] = [];
    let trainDeck = shuffleArray(createTrainCardDeck()) as TrainCardType[];
    let destinationDeck = shuffleArray([...mapData.destinations]);

    for (let i = 0; i < playerCount; i++) {
      const initialCards: TrainCardType[] = [];
      for (let j = 0; j < INITIAL_TRAIN_CARDS; j++) {
        const card = trainDeck.pop();
        if (card) initialCards.push(card as TrainCardType);
      }

      const initialDestinations: DestinationTicket[] = [];
      for (let j = 0; j < 3; j++) {
        const ticket = destinationDeck.pop();
        if (ticket) initialDestinations.push(ticket);
      }

      players.push({
        id: `sandbox-player-${i + 1}`,
        name: i === 0 ? 'Вы (Тестер)' : `Бот ${i}`,
        color: SANDBOX_PLAYER_COLORS[i % SANDBOX_PLAYER_COLORS.length],
        trainCards: initialCards,
        destinationTickets: initialDestinations,
        trainsRemaining: INITIAL_TRAINS,
        stationsRemaining: 3,
        score: 0,
        isActive: i === 0,
        isConnected: true,
        isBot: i !== 0,
      });
    }

    // Set up 5 face-up cards
    const faceUpCards: TrainCardType[] = [];
    for (let i = 0; i < 5; i++) {
      const card = trainDeck.pop();
      if (card) faceUpCards.push(card as TrainCardType);
    }

    const sandboxState: GameState = {
      roomId: sandboxRoomId,
      phase: 'playing',
      players,
      currentPlayerId: sandboxPlayerId,
      currentAction: 'none',
      trainCardDeck: trainDeck,
      trainCardDiscard: [],
      faceUpCards,
      destinationDeck,
      cities: mapData.cities,
      routes: mapData.routes,
      placedStations: [],
      turnNumber: 1,
      logs: [
        {
          id: crypto.randomUUID(),
          action: '🧪 Песочница запущена',
          details: `${playerCount} игроков • ${currentMapType === 'test' ? 'Тестовая карта' : 'Европа'}`,
          timestamp: new Date(),
        },
      ],
    };

    // Set up sandbox room
    setCurrentRoom({
      id: sandboxRoomId,
      name: 'Песочница',
      code: 'SANDBOX',
      hostId: sandboxPlayerId,
      status: 'playing',
      maxPlayers: 5,
      isPrivate: true,
      createdAt: new Date(),
      players,
    });

    setLocalPlayerId(sandboxPlayerId);
    setGameState(sandboxState);
  }, [setCurrentRoom, setLocalPlayerId, setGameState, mapType, getMapData]);

  // Switch map type
  const handleMapTypeChange = useCallback((type: MapType) => {
    setMapType(type);
    initializeSandbox(gameState?.players.length || 2, type);
  }, [gameState?.players.length, initializeSandbox]);

  // Switch to control a different player
  const switchToPlayer = useCallback((playerId: string) => {
    if (!gameState) return;
    
    const newPlayers = gameState.players.map(p => ({
      ...p,
      isActive: p.id === playerId,
    }));

    setLocalPlayerId(playerId);
    setGameState({
      ...gameState,
      players: newPlayers,
      currentPlayerId: playerId,
      currentAction: 'none',
    });
  }, [gameState, setLocalPlayerId, setGameState]);

  // Cheat: Give current player all card types (10 of each)
  const giveAllCards = useCallback(() => {
    if (!gameState || !localPlayerId) return;
    
    const megaHand: TrainCardType[] = [];
    ALL_CARD_TYPES.forEach(cardType => {
      for (let i = 0; i < 10; i++) {
        megaHand.push(cardType);
      }
    });

    const newPlayers = gameState.players.map(p => 
      p.id === localPlayerId 
        ? { ...p, trainCards: [...p.trainCards, ...megaHand] }
        : p
    );

    setGameState({
      ...gameState,
      players: newPlayers,
      logs: [
        ...gameState.logs,
        {
          id: crypto.randomUUID(),
          playerId: localPlayerId,
          action: '🃏 ЧИТ: Получил все карты',
          details: '+90 карт',
          timestamp: new Date(),
        },
      ],
    });
  }, [gameState, localPlayerId, setGameState]);

  // Cheat: Set trains to 2 (triggers end game)
  const triggerEndGame = useCallback(() => {
    if (!gameState || !localPlayerId) return;

    const newPlayers = gameState.players.map(p => 
      p.id === localPlayerId 
        ? { ...p, trainsRemaining: 2 }
        : p
    );

    setGameState({
      ...gameState,
      players: newPlayers,
      phase: 'lastRound',
      lastRoundTriggeredBy: localPlayerId,
      turnsRemainingInLastRound: gameState.players.length,
      logs: [
        ...gameState.logs,
        {
          id: crypto.randomUUID(),
          playerId: localPlayerId,
          action: '⚡ ЧИТ: Запущен последний раунд',
          details: 'Осталось 2 вагона',
          timestamp: new Date(),
        },
      ],
    });
  }, [gameState, localPlayerId, setGameState]);

  // Cheat: Instant finish game
  const instantFinish = useCallback(() => {
    if (!gameState) return;
    calculateFinalScores();
  }, [gameState, calculateFinalScores]);

  // Cheat: Add score to current player
  const addScore = useCallback((amount: number) => {
    if (!gameState || !localPlayerId) return;

    const newPlayers = gameState.players.map(p => 
      p.id === localPlayerId 
        ? { ...p, score: p.score + amount }
        : p
    );

    setGameState({
      ...gameState,
      players: newPlayers,
      logs: [
        ...gameState.logs,
        {
          id: crypto.randomUUID(),
          playerId: localPlayerId,
          action: '💰 ЧИТ: Добавлены очки',
          details: `+${amount}`,
          timestamp: new Date(),
        },
      ],
    });
  }, [gameState, localPlayerId, setGameState]);

  // Cheat: Infinite trains
  const giveInfiniteTrains = useCallback(() => {
    if (!gameState || !localPlayerId) return;

    const newPlayers = gameState.players.map(p => 
      p.id === localPlayerId 
        ? { ...p, trainsRemaining: 999 }
        : p
    );

    setGameState({
      ...gameState,
      players: newPlayers,
      logs: [
        ...gameState.logs,
        {
          id: crypto.randomUUID(),
          playerId: localPlayerId,
          action: '🚂 ЧИТ: Бесконечные вагоны',
          details: '999 вагонов',
          timestamp: new Date(),
        },
      ],
    });
  }, [gameState, localPlayerId, setGameState]);

  // Effect: Infinite cards mode - replenish cards after each action
  useEffect(() => {
    if (!infiniteCards || !gameState || !localPlayerId) return;

    const currentPlayer = gameState.players.find(p => p.id === localPlayerId);
    if (!currentPlayer) return;

    // If player has less than 20 cards, give more
    if (currentPlayer.trainCards.length < 20) {
      const megaHand: TrainCardType[] = [];
      ALL_CARD_TYPES.forEach(cardType => {
        for (let i = 0; i < 5; i++) {
          megaHand.push(cardType);
        }
      });

      const newPlayers = gameState.players.map(p => 
        p.id === localPlayerId 
          ? { ...p, trainCards: [...p.trainCards, ...megaHand] }
          : p
      );

      setGameState({
        ...gameState,
        players: newPlayers,
      });
    }
  }, [infiniteCards, gameState?.turnNumber, localPlayerId]);

  // Auto-initialize on mount if no game
  useEffect(() => {
    if (!gameState) {
      initializeSandbox(2);
    }
  }, [gameState, initializeSandbox]);

  // Build route states for TestMap
  const testRouteStates = useMemo<Record<string, TestRouteState>>(() => {
    if (!gameState || mapType !== 'test') return {};
    
    const states: Record<string, TestRouteState> = {};
    for (const route of gameState.routes) {
      const claimingPlayer = route.claimedBy 
        ? gameState.players.find(p => p.id === route.claimedBy)
        : undefined;
      
      states[route.id] = {
        claimedBy: route.claimedBy,
        claimedByColor: claimingPlayer?.color,
        selectable: canClaimRoute(route.id),
        disabled: gameState.currentPlayerId !== localPlayerId,
        highlighted: false,
      };
    }
    return states;
  }, [gameState, mapType, localPlayerId, canClaimRoute]);

  // Handle route click on test map
  const handleTestMapRouteClick = useCallback((routeId: string) => {
    if (!gameState || !localPlayerId) return;
    if (gameState.currentPlayerId !== localPlayerId) return;
    
    // For now, just log it - actual claiming requires card selection
    console.log('[TestMap] Route clicked:', routeId);
    
    // Find the route
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route || route.claimedBy) return;
    
    // Check if player can claim
    if (!canClaimRoute(routeId)) {
      console.log('[TestMap] Cannot claim route - insufficient resources');
      return;
    }
    
    // For testing purposes - auto-claim with any cards
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return;
    
    // Get required cards (simplified - just take any matching)
    const requiredLength = route.length;
    const routeColor = route.color;
    
    // Build cards to use
    const cardsToUse: TrainCardType[] = [];
    const handCopy = [...player.trainCards];
    
    // First try to use matching color cards
    if (routeColor !== 'gray') {
      for (let i = handCopy.length - 1; i >= 0 && cardsToUse.length < requiredLength; i--) {
        if (handCopy[i] === routeColor) {
          cardsToUse.push(handCopy[i]);
          handCopy.splice(i, 1);
        }
      }
    }
    
    // Then use locomotives
    for (let i = handCopy.length - 1; i >= 0 && cardsToUse.length < requiredLength; i--) {
      if (handCopy[i] === 'locomotive') {
        cardsToUse.push(handCopy[i]);
        handCopy.splice(i, 1);
      }
    }
    
    // For gray routes or if not enough matching, use any single color
    if (cardsToUse.length < requiredLength) {
      const colorCounts: Record<string, number> = {};
      for (const card of handCopy) {
        if (card !== 'locomotive') {
          colorCounts[card] = (colorCounts[card] || 0) + 1;
        }
      }
      
      // Find best color
      const bestColor = Object.entries(colorCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as TrainCardType | undefined;
      
      if (bestColor) {
        for (let i = handCopy.length - 1; i >= 0 && cardsToUse.length < requiredLength; i--) {
          if (handCopy[i] === bestColor) {
            cardsToUse.push(handCopy[i]);
            handCopy.splice(i, 1);
          }
        }
      }
    }
    
    if (cardsToUse.length >= requiredLength) {
      claimRoute(routeId, cardsToUse.slice(0, requiredLength));
    }
  }, [gameState, localPlayerId, canClaimRoute, claimRoute]);

  if (!gameState) {
    return (
      <div className="min-h-screen parchment flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🚂</div>
          <p className="font-display text-lg text-foreground">Загрузка песочницы...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === localPlayerId);

  return (
    <div className="relative">
      {/* Sandbox Controls Overlay */}
      <div className="fixed top-2 left-2 z-50 bg-background/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg max-w-xs overflow-y-auto max-h-[90vh]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🧪</span>
          <span className="font-display text-sm font-bold text-primary">Песочница</span>
        </div>

        {/* Map type selector */}
        <div className="flex gap-1 mb-3">
          <Button
            variant={mapType === 'test' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMapTypeChange('test')}
            className="text-xs flex-1"
          >
            <Map className="w-3 h-3 mr-1" />
            Тестовая
          </Button>
          <Button
            variant={mapType === 'europe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMapTypeChange('europe')}
            className="text-xs flex-1"
          >
            🌍 Европа
          </Button>
        </div>

        {/* Player count buttons */}
        <div className="flex gap-1 mb-3">
          {[2, 3, 4, 5].map(count => (
            <Button
              key={count}
              variant="outline"
              size="sm"
              onClick={() => initializeSandbox(count)}
              className="text-xs px-2"
            >
              <Users className="w-3 h-3 mr-1" />
              {count}
            </Button>
          ))}
        </div>

        {/* Switch player buttons */}
        <div className="space-y-1 mb-3">
          <p className="text-xs text-muted-foreground">Играть за:</p>
          <div className="flex flex-wrap gap-1">
            {gameState.players.map((player, index) => (
              <Button
                key={player.id}
                variant={localPlayerId === player.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchToPlayer(player.id)}
                className="text-xs px-2"
                style={{
                  borderColor: localPlayerId === player.id ? undefined : player.color,
                  backgroundColor: localPlayerId === player.id ? player.color : undefined,
                }}
              >
                {index === 0 ? 'Вы' : `Бот ${index}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Cheat section */}
        <div className="border-t border-border pt-3 mt-3">
          <p className="text-xs font-bold text-yellow-500 mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Читы
          </p>

          {/* Infinite cards toggle */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">♾️ Бесконечные карты</span>
            <Switch
              checked={infiniteCards}
              onCheckedChange={setInfiniteCards}
            />
          </div>

          {/* Cheat buttons */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={giveAllCards}
              className="text-xs border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              +90 карт
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={giveInfiniteTrains}
              className="text-xs border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
            >
              <Train className="w-3 h-3 mr-1" />
              999 вагонов
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-1 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addScore(50)}
              className="text-xs border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
            >
              💰 +50 очков
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addScore(100)}
              className="text-xs border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10"
            >
              💰 +100 очков
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerEndGame}
              className="text-xs border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
            >
              ⚡ Последний раунд
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={instantFinish}
              className="text-xs border-red-500/50 text-red-600 hover:bg-red-500/10"
            >
              <Trophy className="w-3 h-3 mr-1" />
              Завершить
            </Button>
          </div>
        </div>

        {/* Reset button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => initializeSandbox(gameState.players.length)}
          className="w-full text-xs mt-3"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Сбросить игру
        </Button>

        {/* Current turn info */}
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Ход: {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Фаза: {gameState.phase}
          </p>
          {currentPlayer && (
            <>
              <p className="text-xs text-muted-foreground">
                Карт: {currentPlayer.trainCards.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Вагонов: {currentPlayer.trainsRemaining}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Map / Game Board */}
      {mapType === 'test' ? (
        <div className="w-screen h-screen">
          <TestMap 
            routeStates={testRouteStates}
            onRouteClick={handleTestMapRouteClick}
          />
        </div>
      ) : (
        <GameBoard />
      )}
    </div>
  );
};

export default TestSandbox;
