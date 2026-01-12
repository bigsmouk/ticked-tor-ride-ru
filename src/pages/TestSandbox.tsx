import React, { useEffect, useCallback } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play, Users } from 'lucide-react';
import { 
  EUROPE_CITIES, 
  EUROPE_ROUTES, 
  DESTINATION_TICKETS, 
  createTrainCardDeck, 
  shuffleArray 
} from '@/data/europeMap';
import { 
  GameState, 
  TrainCardType, 
  DestinationTicket,
  Player,
  PlayerColor,
  INITIAL_TRAINS,
  INITIAL_TRAIN_CARDS,
} from '@/types/game';

const SANDBOX_PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'black'];

const TestSandbox = () => {
  const { gameState, setGameState, setCurrentRoom, setLocalPlayerId, localPlayerId } = useGameStore();

  // Initialize sandbox game with specified number of players
  const initializeSandbox = useCallback((playerCount: number = 2) => {
    const sandboxRoomId = 'sandbox-test-room';
    const sandboxPlayerId = 'sandbox-player-1';
    
    // Create sandbox players
    const players: Player[] = [];
    let trainDeck = shuffleArray(createTrainCardDeck()) as TrainCardType[];
    let destinationDeck = shuffleArray([...DESTINATION_TICKETS]);

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
        stations: 3,
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
      cities: EUROPE_CITIES,
      routes: EUROPE_ROUTES.map(route => ({ ...route })),
      turnNumber: 1,
      logs: [
        {
          id: crypto.randomUUID(),
          action: '🧪 Песочница запущена',
          details: `${playerCount} игроков`,
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
  }, [setCurrentRoom, setLocalPlayerId, setGameState]);

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

  // Auto-initialize on mount if no game
  useEffect(() => {
    if (!gameState) {
      initializeSandbox(2);
    }
  }, [gameState, initializeSandbox]);

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

  return (
    <div className="relative">
      {/* Sandbox Controls Overlay */}
      <div className="fixed top-2 left-2 z-50 bg-background/95 backdrop-blur border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🧪</span>
          <span className="font-display text-sm font-bold text-primary">Песочница</span>
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

        {/* Reset button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => initializeSandbox(gameState.players.length)}
          className="w-full text-xs"
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
        </div>
      </div>

      {/* Game Board */}
      <GameBoard />
    </div>
  );
};

export default TestSandbox;
