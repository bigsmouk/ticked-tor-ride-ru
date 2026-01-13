import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';
import {
  GameState, 
  GameRoom, 
  Player, 
  Route, 
  TrainCardType,
  DestinationTicket,
  GamePhase,
  TurnAction,
  PlayerColor,
  GameLogEntry,
  KickVote,
  TunnelRevealState,
  PlacedStation,
  ROUTE_POINTS,
  INITIAL_TRAINS,
  INITIAL_TRAIN_CARDS,
  END_GAME_TRAINS_THRESHOLD,
  STATION_COSTS,
  UNUSED_STATION_POINTS,
} from '@/types/game';
import { playRouteClaimSound, playCardDrawSound, playSuccessSound } from '@/hooks/useGameSounds';
import { 
  EUROPE_CITIES, 
  EUROPE_ROUTES, 
  DESTINATION_TICKETS, 
  createTrainCardDeck, 
  shuffleArray 
} from '@/data/europeMap';

const KICK_VOTE_DURATION_MS = 30000; // 30 seconds

// Локальный идентификатор игрока — обязателен для переподключения после refresh/offline.
// Должен быть доступен ДО того, как смонтируются страницы /waiting и /game.
const PLAYER_ID_STORAGE_KEY = 'ttr_player_id';
const getOrCreateStoredPlayerId = (): string => {
  // В среде без window/localStorage (например, при тестах) — создаём временный id
  if (typeof window === 'undefined') return crypto.randomUUID();

  try {
    const stored = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (stored) return stored;
    const newId = crypto.randomUUID();
    window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, newId);
    return newId;
  } catch {
    return crypto.randomUUID();
  }
};

const initialLocalPlayerId = getOrCreateStoredPlayerId();

// Helper to create log entry
const createLog = (playerId: string | undefined, action: string, details?: string): GameLogEntry => ({
  id: crypto.randomUUID(),
  playerId,
  action,
  details,
  timestamp: new Date(),
});

interface GameStore {
  // Current view
  currentView: 'lobby' | 'waiting' | 'game';
  
  // Game room
  currentRoom: (GameRoom & { code?: string }) | null;
  availableRooms: GameRoom[];
  
  // Game state
  gameState: GameState | null;
  
  // Local player
  localPlayerId: string | null;
  
  // Actions
  setView: (view: 'lobby' | 'waiting' | 'game') => void;
  setCurrentRoom: (room: (GameRoom & { code?: string }) | null) => void;
  setLocalPlayerId: (id: string | null) => void;
  setGameState: (state: GameState | null) => void;
  leaveRoom: () => void;
  initializeGame: () => void;
  
  // Game actions
  drawTrainCard: (fromFaceUp: boolean, cardIndex?: number) => void;
  startDrawingCards: () => void;
  claimRoute: (routeId: string, cardsUsed: TrainCardType[]) => void;
  attemptClaimTunnel: (routeId: string, cardsUsed: TrainCardType[]) => void;
  confirmTunnelClaim: (extraCards: TrainCardType[]) => void;
  cancelTunnelClaim: () => void;
  drawDestinations: () => void;
  keepDestinations: (ticketIds: string[]) => void;
  cancelDestinationDraw: () => void;
  cancelDrawingCards: () => void;
  endTurn: () => void;
  calculateFinalScores: () => void;
  addLog: (playerId: string | undefined, action: string, details?: string) => void;
  removePlayer: (playerId: string, playerName: string) => void;
  
  // Station actions
  startBuildStation: () => void;
  buildStation: (cityId: string, cardsUsed: TrainCardType[]) => void;
  cancelBuildStation: () => void;
  canBuildStation: (cityId: string) => boolean;
  getStationCost: () => number;
  
  // Kick voting actions
  initiateKickVote: (targetPlayerId: string, initiatorId: string) => void;
  castKickVote: (voterId: string, approve: boolean) => void;
  resolveKickVote: () => void;
  cancelKickVote: () => void;
  
  // Helpers
  canClaimRoute: (routeId: string) => boolean;
  getRouteCardRequirement: (routeId: string) => { color: string; count: number } | null;
  getClaimRouteError: (routeId: string) => string | null;
  canPayTunnelExtra: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentView: 'lobby',
  currentRoom: null,
  availableRooms: [],
  gameState: null,
  localPlayerId: initialLocalPlayerId,
  
  setView: (view) => set({ currentView: view }),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  
  setGameState: (state) => set({ gameState: state }),
  leaveRoom: () => {
    // Импортируем clearSession динамически чтобы избежать циклических зависимостей
    import('@/hooks/useSessionRecovery').then(({ clearSession }) => {
      clearSession();
    });
    set({
      currentRoom: null,
      gameState: null,
      localPlayerId: null,
      currentView: 'lobby',
    });
  },
  
  initializeGame: () => {
    const { currentRoom } = get();
    // Для соло-режима достаточно 1 игрока, для мультиплеера — минимум 2
    const minPlayers = currentRoom?.isSoloMode ? 1 : 2;
    if (!currentRoom || currentRoom.players.length < minPlayers) return;
    
    // Initialize deck
    let trainDeck = shuffleArray(createTrainCardDeck());
    let destinationDeck = shuffleArray([...DESTINATION_TICKETS]);
    
    // Deal cards to players
    const players = currentRoom.players.map((player, index) => {
      const initialCards: TrainCardType[] = [];
      for (let i = 0; i < INITIAL_TRAIN_CARDS; i++) {
        const card = trainDeck.pop();
        if (card) initialCards.push(card as TrainCardType);
      }
      
      // Draw initial destination tickets
      const initialDestinations: DestinationTicket[] = [];
      for (let i = 0; i < 3; i++) {
        const ticket = destinationDeck.pop();
        if (ticket) initialDestinations.push(ticket);
      }
      
      return {
        ...player,
        trainCards: initialCards,
        destinationTickets: initialDestinations,
        isActive: index === 0, // First player is active
      };
    });
    
    // Set up 5 face-up cards
    const faceUpCards: TrainCardType[] = [];
    for (let i = 0; i < 5; i++) {
      const card = trainDeck.pop();
      if (card) faceUpCards.push(card as TrainCardType);
    }
    
    const gameState: GameState = {
      roomId: currentRoom.id,
      phase: 'playing',
      players,
      currentPlayerId: players[0].id,
      currentAction: 'none',
      trainCardDeck: trainDeck as TrainCardType[],
      trainCardDiscard: [],
      faceUpCards,
      destinationDeck,
      cities: EUROPE_CITIES,
      routes: EUROPE_ROUTES.map(route => ({ ...route })),
      placedStations: [],
      turnNumber: 1,
      logs: [
        {
          id: crypto.randomUUID(),
          action: 'Игра началась',
          details: `${players.length} игроков`,
          timestamp: new Date(),
        },
        {
          id: crypto.randomUUID(),
          playerId: players[0].id,
          action: 'Начинает ход',
          timestamp: new Date(),
        },
      ],
    };
    
    set({
      gameState,
      currentRoom: {
        ...currentRoom,
        status: 'playing',
      },
    });
  },
  
  startDrawingCards: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    if (gameState.currentAction !== 'none') return;
    
    set({
      gameState: {
        ...gameState,
        currentAction: 'selectingFirstCard',
      },
    });
  },
  
  drawTrainCard: (fromFaceUp, cardIndex) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    // Можно брать карты только в режиме выбора первой или второй карты
    if (gameState.currentAction !== 'selectingFirstCard' && gameState.currentAction !== 'drawTrainCards') return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    let newDeck = [...gameState.trainCardDeck];
    let newDiscard = [...gameState.trainCardDiscard];
    let newFaceUp = [...gameState.faceUpCards];
    let newHand = [...player.trainCards];
    const isFirstCard = gameState.currentAction === 'selectingFirstCard';
    
    // Helper to reshuffle discard into deck if needed
    const reshuffleIfNeeded = () => {
      if (newDeck.length === 0 && newDiscard.length > 0) {
        newDeck = shuffleArray([...newDiscard]) as TrainCardType[];
        newDiscard = [];
      }
    };
    
    if (fromFaceUp && cardIndex !== undefined) {
      // Take from face-up cards
      const card = newFaceUp[cardIndex];
      if (!card) return;
      
      // Play sound effect
      playCardDrawSound();
      
      // If taking locomotive from face-up
      if (card === 'locomotive') {
        // Локомотив можно взять только как первую карту (и это завершает ход)
        if (!isFirstCard) {
          return; // Нельзя брать локомотив как вторую карту
        }
        
        newHand.push(card);
        
        // Replace the face-up card
        reshuffleIfNeeded();
        const replacement = newDeck.pop();
        if (replacement) {
          newFaceUp[cardIndex] = replacement as TrainCardType;
        } else {
          newFaceUp = newFaceUp.filter((_, i) => i !== cardIndex);
        }
        
        // End turn after taking locomotive
        const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
        
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = { ...player, trainCards: newHand, isActive: false };
        updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
        
        const nextPlayer = updatedPlayers[nextPlayerIndex];
        set({
          gameState: {
            ...gameState,
            players: updatedPlayers,
            currentPlayerId: nextPlayer.id,
            currentAction: 'none',
            trainCardDeck: newDeck,
            trainCardDiscard: newDiscard,
            faceUpCards: newFaceUp,
            turnNumber: gameState.turnNumber + 1,
            logs: [
              ...gameState.logs,
              createLog(localPlayerId, 'Взял локомотив', 'Из открытых карт'),
              createLog(nextPlayer.id, 'Начинает ход'),
            ],
          },
        });
        return;
      }
      
      newHand.push(card);
      
      // Replace the face-up card
      reshuffleIfNeeded();
      const replacement = newDeck.pop();
      if (replacement) {
        newFaceUp[cardIndex] = replacement as TrainCardType;
      } else {
        newFaceUp = newFaceUp.filter((_, i) => i !== cardIndex);
      }
    } else {
      // Take from deck - reshuffle if needed first
      reshuffleIfNeeded();
      const card = newDeck.pop();
      if (!card) return;
      newHand.push(card as TrainCardType);
      
      // Play sound effect
      playCardDrawSound();
    }
    
    if (isFirstCard) {
      // First card drawn, wait for second card
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerIndex] = { ...player, trainCards: newHand };
      
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentAction: 'drawTrainCards', // Теперь ждём вторую карту
          trainCardDeck: newDeck,
          trainCardDiscard: newDiscard,
          faceUpCards: newFaceUp,
        },
      });
    } else {
      // Second card drawn, end turn
      const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerIndex] = { ...player, trainCards: newHand, isActive: false };
      updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
      
      // Check last round
      let turnsRemainingInLastRound = gameState.turnsRemainingInLastRound;
      if (gameState.phase === 'lastRound' && turnsRemainingInLastRound !== undefined) {
        turnsRemainingInLastRound = turnsRemainingInLastRound - 1;
        if (turnsRemainingInLastRound <= 0) {
          set({
            gameState: {
              ...gameState,
              players: updatedPlayers,
              currentPlayerId: updatedPlayers[nextPlayerIndex].id,
              currentAction: 'none',
              trainCardDeck: newDeck,
              faceUpCards: newFaceUp,
              turnNumber: gameState.turnNumber + 1,
              turnsRemainingInLastRound: 0,
            },
          });
          setTimeout(() => get().calculateFinalScores(), 100);
          return;
        }
      }
      
      const nextPlayer = updatedPlayers[nextPlayerIndex];
      const cardSource = fromFaceUp ? 'из открытых' : 'из колоды';
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentPlayerId: nextPlayer.id,
          currentAction: 'none',
          trainCardDeck: newDeck,
          trainCardDiscard: newDiscard,
          faceUpCards: newFaceUp,
          turnNumber: gameState.turnNumber + 1,
          turnsRemainingInLastRound,
          logs: [
            ...gameState.logs,
            createLog(localPlayerId, 'Взял 2 карты', cardSource),
            createLog(nextPlayer.id, 'Начинает ход'),
          ],
        },
      });
    }
  },
  
  claimRoute: (routeId, cardsUsed) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route || route.claimedBy) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    
    // Verify player has enough trains
    if (player.trainsRemaining < route.length) return;
    
    // Remove used cards from player's hand
    let newHand = [...player.trainCards];
    for (const card of cardsUsed) {
      const index = newHand.indexOf(card);
      if (index > -1) {
        newHand.splice(index, 1);
      }
    }
    
    // Add cards to discard
    const newDiscard = [...gameState.trainCardDiscard, ...cardsUsed];
    
    // Calculate points
    const points = ROUTE_POINTS[route.length] || 0;
    
    // Play sound effect
    playRouteClaimSound();
    
    // Update route
    const newRoutes = gameState.routes.map(r => 
      r.id === routeId ? { ...r, claimedBy: localPlayerId } : r
    );
    // Check for end game condition
    const newTrainsRemaining = player.trainsRemaining - route.length;
    let newPhase = gameState.phase;
    let lastRoundTriggeredBy = gameState.lastRoundTriggeredBy;
    let turnsRemainingInLastRound = gameState.turnsRemainingInLastRound;
    
    if (newTrainsRemaining <= END_GAME_TRAINS_THRESHOLD && !lastRoundTriggeredBy) {
      newPhase = 'lastRound';
      lastRoundTriggeredBy = localPlayerId;
      turnsRemainingInLastRound = gameState.players.length;
    }
    
    // Decrement last round counter if in last round
    if (gameState.phase === 'lastRound' && turnsRemainingInLastRound !== undefined) {
      turnsRemainingInLastRound = turnsRemainingInLastRound - 1;
    }
    
    // Move to next player
    const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...player,
      trainCards: newHand,
      trainsRemaining: newTrainsRemaining,
      score: player.score + points,
      isActive: false,
    };
    updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
    
    // Check if last round is over
    if (turnsRemainingInLastRound !== undefined && turnsRemainingInLastRound <= 0) {
      set({
        gameState: {
          ...gameState,
          phase: 'lastRound',
          players: updatedPlayers,
          currentPlayerId: updatedPlayers[nextPlayerIndex].id,
          currentAction: 'none',
          routes: newRoutes,
          trainCardDiscard: newDiscard,
          turnNumber: gameState.turnNumber + 1,
          lastRoundTriggeredBy,
          turnsRemainingInLastRound: 0,
        },
      });
      // Trigger final scoring
      setTimeout(() => get().calculateFinalScores(), 100);
      return;
    }
    
    const nextPlayer = updatedPlayers[nextPlayerIndex];
    const city1 = gameState.cities.find(c => c.id === route.cities[0])?.name || route.cities[0];
    const city2 = gameState.cities.find(c => c.id === route.cities[1])?.name || route.cities[1];
    
    set({
      gameState: {
        ...gameState,
        phase: newPhase,
        players: updatedPlayers,
        currentPlayerId: nextPlayer.id,
        currentAction: 'none',
        routes: newRoutes,
        trainCardDiscard: newDiscard,
        turnNumber: gameState.turnNumber + 1,
        lastRoundTriggeredBy,
        turnsRemainingInLastRound,
        logs: [
          ...gameState.logs,
          createLog(localPlayerId, 'Построил маршрут', `${city1} — ${city2} (+${points} очков)`),
          createLog(nextPlayer.id, 'Начинает ход'),
        ],
      },
    });
  },
  
  // Tunnel mechanics: attempt to claim - reveals 3 cards first
  attemptClaimTunnel: (routeId, cardsUsed) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route || route.claimedBy || !route.isTunnel) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    if (player.trainsRemaining < route.length) return;
    
    // Determine what color the player is using
    let colorUsed: TrainCardType = 'locomotive';
    for (const card of cardsUsed) {
      if (card !== 'locomotive') {
        colorUsed = card;
        break;
      }
    }
    
    // Helper to reshuffle if needed
    let deck = [...gameState.trainCardDeck];
    let discard = [...gameState.trainCardDiscard];
    
    const reshuffleIfNeeded = () => {
      if (deck.length === 0 && discard.length > 0) {
        deck = [...discard].sort(() => Math.random() - 0.5);
        discard = [];
      }
    };
    
    // Reveal 3 cards from deck
    const revealedCards: TrainCardType[] = [];
    for (let i = 0; i < 3; i++) {
      reshuffleIfNeeded();
      const card = deck.pop();
      if (card) revealedCards.push(card as TrainCardType);
    }
    
    // Count matching cards
    const extraCardsNeeded = revealedCards.filter(
      card => card === colorUsed || card === 'locomotive'
    ).length;
    
    // Get route name for display
    const city1 = gameState.cities.find(c => c.id === route.cities[0])?.name || route.cities[0];
    const city2 = gameState.cities.find(c => c.id === route.cities[1])?.name || route.cities[1];
    const routeName = `${city1} — ${city2}`;
    
    // Set tunnel reveal state
    set({
      gameState: {
        ...gameState,
        currentAction: 'tunnelReveal',
        trainCardDeck: deck,
        trainCardDiscard: [...discard, ...revealedCards], // Revealed cards go to discard
        tunnelReveal: {
          routeId,
          routeName,
          cardsUsed,
          colorUsed,
          revealedCards,
          extraCardsNeeded,
        },
        logs: [
          ...gameState.logs,
          createLog(localPlayerId, 'Проверяет туннель', `${routeName} — вскрыто ${revealedCards.length} карт`),
        ],
      },
    });
  },
  
  // Confirm tunnel claim with extra cards
  confirmTunnelClaim: (extraCards) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || !gameState.tunnelReveal) return;
    if (gameState.currentPlayerId !== localPlayerId) return;
    
    const { routeId, cardsUsed, extraCardsNeeded, routeName } = gameState.tunnelReveal;
    
    // Verify extra cards count
    if (extraCards.length !== extraCardsNeeded) return;
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route || route.claimedBy) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    
    // Remove all used cards (original + extra) from hand
    let newHand = [...player.trainCards];
    const allCardsUsed = [...cardsUsed, ...extraCards];
    for (const card of allCardsUsed) {
      const index = newHand.indexOf(card);
      if (index > -1) {
        newHand.splice(index, 1);
      }
    }
    
    // Add all cards to discard
    const newDiscard = [...gameState.trainCardDiscard, ...allCardsUsed];
    
    // Calculate points
    const points = ROUTE_POINTS[route.length] || 0;
    
    // Play sound effect
    playRouteClaimSound();
    
    // Update route
    const newRoutes = gameState.routes.map(r => 
      r.id === routeId ? { ...r, claimedBy: localPlayerId } : r
    );
    
    // Check for end game condition
    const newTrainsRemaining = player.trainsRemaining - route.length;
    let newPhase = gameState.phase;
    let lastRoundTriggeredBy = gameState.lastRoundTriggeredBy;
    let turnsRemainingInLastRound = gameState.turnsRemainingInLastRound;
    
    if (newTrainsRemaining <= END_GAME_TRAINS_THRESHOLD && !lastRoundTriggeredBy) {
      newPhase = 'lastRound';
      lastRoundTriggeredBy = localPlayerId;
      turnsRemainingInLastRound = gameState.players.length;
    }
    
    if (gameState.phase === 'lastRound' && turnsRemainingInLastRound !== undefined) {
      turnsRemainingInLastRound = turnsRemainingInLastRound - 1;
    }
    
    // Move to next player
    const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...player,
      trainCards: newHand,
      trainsRemaining: newTrainsRemaining,
      score: player.score + points,
      isActive: false,
    };
    updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
    
    // Check if last round is over
    if (turnsRemainingInLastRound !== undefined && turnsRemainingInLastRound <= 0) {
      set({
        gameState: {
          ...gameState,
          phase: 'lastRound',
          players: updatedPlayers,
          currentPlayerId: updatedPlayers[nextPlayerIndex].id,
          currentAction: 'none',
          routes: newRoutes,
          trainCardDiscard: newDiscard,
          turnNumber: gameState.turnNumber + 1,
          lastRoundTriggeredBy,
          turnsRemainingInLastRound: 0,
          tunnelReveal: undefined,
        },
      });
      setTimeout(() => get().calculateFinalScores(), 100);
      return;
    }
    
    const nextPlayer = updatedPlayers[nextPlayerIndex];
    const extraInfo = extraCardsNeeded > 0 ? ` (доплата: ${extraCardsNeeded})` : '';
    
    set({
      gameState: {
        ...gameState,
        phase: newPhase,
        players: updatedPlayers,
        currentPlayerId: nextPlayer.id,
        currentAction: 'none',
        routes: newRoutes,
        trainCardDiscard: newDiscard,
        turnNumber: gameState.turnNumber + 1,
        lastRoundTriggeredBy,
        turnsRemainingInLastRound,
        tunnelReveal: undefined,
        logs: [
          ...gameState.logs,
          createLog(localPlayerId, 'Построил туннель', `${routeName} (+${points} очков)${extraInfo}`),
          createLog(nextPlayer.id, 'Начинает ход'),
        ],
      },
    });
  },
  
  // Cancel tunnel claim attempt - player keeps their cards, revealed cards go to discard, turn passes
  cancelTunnelClaim: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || !gameState.tunnelReveal) return;
    if (gameState.currentPlayerId !== localPlayerId) return;
    
    const { routeName, revealedCards } = gameState.tunnelReveal;
    
    // Find current player index
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    // Revealed cards go to discard pile
    const newDiscard = [...gameState.trainCardDiscard, ...revealedCards];
    
    // Move to next player
    const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], isActive: false };
    updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
    
    // Handle last round turn counting
    let turnsRemainingInLastRound = gameState.turnsRemainingInLastRound;
    if (gameState.phase === 'lastRound' && turnsRemainingInLastRound !== undefined) {
      turnsRemainingInLastRound = turnsRemainingInLastRound - 1;
    }
    
    // Check if last round is over
    if (turnsRemainingInLastRound !== undefined && turnsRemainingInLastRound <= 0) {
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentPlayerId: nextPlayer.id,
          currentAction: 'none',
          trainCardDiscard: newDiscard,
          turnNumber: gameState.turnNumber + 1,
          turnsRemainingInLastRound: 0,
          tunnelReveal: undefined,
          logs: [
            ...gameState.logs,
            createLog(localPlayerId, 'Отменил туннель', routeName),
          ],
        },
      });
      setTimeout(() => get().calculateFinalScores(), 100);
      return;
    }
    
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: nextPlayer.id,
        currentAction: 'none',
        trainCardDiscard: newDiscard,
        turnNumber: gameState.turnNumber + 1,
        turnsRemainingInLastRound,
        tunnelReveal: undefined,
        logs: [
          ...gameState.logs,
          createLog(localPlayerId, 'Отменил туннель', routeName),
          createLog(nextPlayer.id, 'Начинает ход'),
        ],
      },
    });
  },
  
  drawDestinations: () => {
    // This would show destination cards to choose from
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    set({
      gameState: {
        ...gameState,
        currentAction: 'drawDestinations',
      },
    });
  },
  
  keepDestinations: (ticketIds) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    if (ticketIds.length < 1) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    
    // Add kept tickets to player
    const keptTickets = gameState.destinationDeck
      .filter(t => ticketIds.includes(t.id))
      .slice(0, 3);
    
    const newDestinationDeck = gameState.destinationDeck
      .filter(t => !ticketIds.includes(t.id));
    
    // Move to next player
    const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...player,
      destinationTickets: [...player.destinationTickets, ...keptTickets],
      isActive: false,
    };
    updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
    
    // Check last round
    let turnsRemainingInLastRound = gameState.turnsRemainingInLastRound;
    if (gameState.phase === 'lastRound' && turnsRemainingInLastRound !== undefined) {
      turnsRemainingInLastRound = turnsRemainingInLastRound - 1;
      if (turnsRemainingInLastRound <= 0) {
        set({
          gameState: {
            ...gameState,
            players: updatedPlayers,
            currentPlayerId: updatedPlayers[nextPlayerIndex].id,
            currentAction: 'none',
            destinationDeck: newDestinationDeck,
            turnNumber: gameState.turnNumber + 1,
            turnsRemainingInLastRound: 0,
          },
        });
        setTimeout(() => get().calculateFinalScores(), 100);
        return;
      }
    }
    
    const nextPlayer = updatedPlayers[nextPlayerIndex];
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: nextPlayer.id,
        currentAction: 'none',
        destinationDeck: newDestinationDeck,
        turnNumber: gameState.turnNumber + 1,
        turnsRemainingInLastRound,
        logs: [
          ...gameState.logs,
          createLog(localPlayerId, 'Взял маршруты', `${keptTickets.length} шт.`),
          createLog(nextPlayer.id, 'Начинает ход'),
        ],
      },
    });
  },
  
  cancelDestinationDraw: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    // Просто сбрасываем currentAction, не меняя ход
    set({
      gameState: {
        ...gameState,
        currentAction: 'none',
      },
    });
  },
  
  cancelDrawingCards: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    // Можно отменить только если ещё не взяли ни одной карты (currentAction только начался)
    // После взятия первой карты отменить нельзя - нужно взять вторую
    if (gameState.currentAction !== 'drawTrainCards') return;
    
    set({
      gameState: {
        ...gameState,
        currentAction: 'none',
      },
    });
  },
  
  endTurn: () => {
    const { gameState, localPlayerId, currentRoom } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    // В соло-режиме ход остаётся у того же игрока
    const isSolo = currentRoom?.isSoloMode;
    const nextPlayerIndex = isSolo ? playerIndex : (playerIndex + 1) % gameState.players.length;
    
    const updatedPlayers = [...gameState.players];
    if (!isSolo) {
      updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], isActive: false };
    }
    updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
    
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: updatedPlayers[nextPlayerIndex].id,
        currentAction: 'none',
        turnNumber: gameState.turnNumber + 1,
      },
    });
  },
  
  addLog: (playerId, action, details) => {
    const { gameState } = get();
    if (!gameState) return;
    
    set({
      gameState: {
        ...gameState,
        logs: [...gameState.logs, createLog(playerId, action, details)],
      },
    });
  },
  
  removePlayer: (playerId, playerName) => {
    const { gameState, currentRoom } = get();
    if (!gameState) return;
    
    // Находим индекс игрока
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    
    // Если игрок был активным, передаём ход следующему
    const wasActive = gameState.currentPlayerId === playerId;
    const updatedPlayers = gameState.players.filter(p => p.id !== playerId);
    
    // В соло-режиме или если осталось меньше 2 игроков - завершаем игру
    const isSolo = currentRoom?.isSoloMode;
    const minPlayers = isSolo ? 1 : 2;
    
    if (updatedPlayers.length < minPlayers) {
      set({
        gameState: {
          ...gameState,
          phase: 'finished',
          players: updatedPlayers,
          logs: [
            ...gameState.logs,
            createLog(playerId, 'Покинул игру', playerName),
            createLog(undefined, 'Игра завершена', isSolo ? 'Соло-игра прервана' : 'Недостаточно игроков'),
          ],
        },
      });
      return;
    }
    
    // Определяем нового текущего игрока
    let newCurrentPlayerId = gameState.currentPlayerId;
    if (wasActive) {
      const newIndex = playerIndex % updatedPlayers.length;
      newCurrentPlayerId = updatedPlayers[newIndex].id;
      updatedPlayers[newIndex] = { ...updatedPlayers[newIndex], isActive: true };
    }
    
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: newCurrentPlayerId,
        currentAction: wasActive ? 'none' : gameState.currentAction,
        logs: [
          ...gameState.logs,
          createLog(playerId, 'Покинул игру', playerName),
          ...(wasActive ? [createLog(newCurrentPlayerId, 'Начинает ход', 'После выхода игрока')] : []),
        ],
      },
      currentRoom: currentRoom ? {
        ...currentRoom,
        players: updatedPlayers,
      } : null,
    });
  },
  
  calculateFinalScores: () => {
    const { gameState } = get();
    if (!gameState) return;
    
    console.log('=== НАЧАЛО ПОДСЧЁТА ОЧКОВ ===');
    
    // Build a graph of claimed routes for each player
    const getPlayerConnections = (playerId: string): Map<string, Set<string>> => {
      const connections = new Map<string, Set<string>>();
      gameState.routes.forEach(route => {
        if (route.claimedBy === playerId) {
          const [city1, city2] = route.cities;
          if (!connections.has(city1)) connections.set(city1, new Set());
          if (!connections.has(city2)) connections.set(city2, new Set());
          connections.get(city1)!.add(city2);
          connections.get(city2)!.add(city1);
        }
      });
      return connections;
    };
    
    // Get connections including one station-borrowed route
    const getConnectionsWithStation = (
      playerId: string, 
      stationCityId: string | null, 
      usedRouteId: string | null
    ): Map<string, Set<string>> => {
      const connections = new Map<string, Set<string>>();
      
      // Add player's own routes
      gameState.routes.forEach(route => {
        if (route.claimedBy === playerId) {
          const [city1, city2] = route.cities;
          if (!connections.has(city1)) connections.set(city1, new Set());
          if (!connections.has(city2)) connections.set(city2, new Set());
          connections.get(city1)!.add(city2);
          connections.get(city2)!.add(city1);
        }
      });
      
      // Add one borrowed route from station (if using a station)
      if (stationCityId && usedRouteId) {
        const borrowedRoute = gameState.routes.find(r => r.id === usedRouteId);
        if (borrowedRoute && borrowedRoute.claimedBy && borrowedRoute.claimedBy !== playerId) {
          const [city1, city2] = borrowedRoute.cities;
          // Station must be in one of the route's cities
          if (city1 === stationCityId || city2 === stationCityId) {
            if (!connections.has(city1)) connections.set(city1, new Set());
            if (!connections.has(city2)) connections.set(city2, new Set());
            connections.get(city1)!.add(city2);
            connections.get(city2)!.add(city1);
          }
        }
      }
      
      return connections;
    };
    
    // BFS to check connectivity
    const checkConnectivity = (
      connections: Map<string, Set<string>>, 
      city1: string, 
      city2: string
    ): boolean => {
      if (!connections.has(city1) || !connections.has(city2)) return false;
      
      const visited = new Set<string>();
      const queue = [city1];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === city2) return true;
        if (visited.has(current)) continue;
        visited.add(current);
        
        const neighbors = connections.get(current);
        if (neighbors) {
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) queue.push(neighbor);
          });
        }
      }
      return false;
    };
    
    // Get all routes available at a station city that belong to other players
    const getAvailableStationRoutes = (playerId: string, stationCityId: string): Route[] => {
      return gameState.routes.filter(route => 
        route.claimedBy && 
        route.claimedBy !== playerId && 
        route.cities.includes(stationCityId)
      );
    };
    
    // Check if two cities are connected for a player (considering stations)
    // Station allows using ONE route of another player at that city
    const areCitiesConnected = (playerId: string, city1: string, city2: string): boolean => {
      // First, check without using any stations
      const ownConnections = getConnectionsWithStation(playerId, null, null);
      if (checkConnectivity(ownConnections, city1, city2)) return true;
      
      // Get player's stations
      const playerStations = gameState.placedStations.filter(s => s.playerId === playerId);
      if (playerStations.length === 0) return false;
      
      // Try each station with each available borrowed route
      for (const station of playerStations) {
        const availableRoutes = getAvailableStationRoutes(playerId, station.cityId);
        
        for (const route of availableRoutes) {
          const connectionsWithBorrow = getConnectionsWithStation(playerId, station.cityId, route.id);
          if (checkConnectivity(connectionsWithBorrow, city1, city2)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    // Calculate longest path using DFS - each wagon can only be counted once
    const calculateLongestPath = (playerId: string): number => {
      const routes = gameState.routes.filter(r => r.claimedBy === playerId);
      if (routes.length === 0) return 0;
      
      // Build adjacency with route references to track which exact route was used
      const connections = new Map<string, { city: string; length: number; routeId: string }[]>();
      routes.forEach(route => {
        const [city1, city2] = route.cities;
        if (!connections.has(city1)) connections.set(city1, []);
        if (!connections.has(city2)) connections.set(city2, []);
        connections.get(city1)!.push({ city: city2, length: route.length, routeId: route.id });
        connections.get(city2)!.push({ city: city1, length: route.length, routeId: route.id });
      });
      
      let maxPath = 0;
      const usedRoutes = new Set<string>();
      
      const dfs = (city: string, pathLength: number) => {
        maxPath = Math.max(maxPath, pathLength);
        const neighbors = connections.get(city) || [];
        
        for (const neighbor of neighbors) {
          if (!usedRoutes.has(neighbor.routeId)) {
            usedRoutes.add(neighbor.routeId);
            dfs(neighbor.city, pathLength + neighbor.length);
            usedRoutes.delete(neighbor.routeId);
          }
        }
      };
      
      // Start DFS from each city
      connections.forEach((_, city) => {
        usedRoutes.clear();
        dfs(city, 0);
      });
      
      return maxPath;
    };
    
    // Calculate final scores
    const finalScores: { 
      playerId: string; 
      routePoints: number;
      ticketBonus: number;
      ticketPenalty: number;
      longestPathBonus: number;
      unusedStationsBonus: number;
      totalScore: number;
      longestPath: number; 
      completedTickets: number; 
      failedTickets: number;
    }[] = [];
    let maxLongestPath = 0;
    
    // First pass: calculate all scores except longest path bonus
    gameState.players.forEach(player => {
      const longestPath = calculateLongestPath(player.id);
      maxLongestPath = Math.max(maxLongestPath, longestPath);
      
      let ticketBonus = 0;
      let ticketPenalty = 0;
      let completedCount = 0;
      let failedCount = 0;
      
      console.log(`\n--- Игрок: ${player.name} (${player.color}) ---`);
      console.log(`Очки за построенные маршруты: ${player.score}`);
      
      // Log player's stations
      const playerStations = gameState.placedStations.filter(s => s.playerId === player.id);
      if (playerStations.length > 0) {
        console.log(`  Станции: ${playerStations.map(s => {
          const city = gameState.cities.find(c => c.id === s.cityId);
          return city?.name || s.cityId;
        }).join(', ')}`);
      }
      
      player.destinationTickets.forEach(ticket => {
        const isCompleted = areCitiesConnected(player.id, ticket.cities[0], ticket.cities[1]);
        const city1Name = gameState.cities.find(c => c.id === ticket.cities[0])?.name || ticket.cities[0];
        const city2Name = gameState.cities.find(c => c.id === ticket.cities[1])?.name || ticket.cities[1];
        console.log(`  Маршрут ${city1Name} — ${city2Name} (${ticket.points} очков): ${isCompleted ? 'ВЫПОЛНЕН ✓' : 'НЕ ВЫПОЛНЕН ✗'}`);
        
        if (isCompleted) {
          ticketBonus += ticket.points;
          completedCount++;
        } else {
          ticketPenalty += ticket.points;
          failedCount++;
        }
      });
      
      console.log(`  Бонус за выполненные маршруты: +${ticketBonus}`);
      console.log(`  Штраф за невыполненные маршруты: -${ticketPenalty}`);
      console.log(`  Длина самого длинного пути: ${longestPath}`);
      
      // Calculate unused stations bonus (+4 per unused station)
      const unusedStationsBonus = player.stationsRemaining * UNUSED_STATION_POINTS;
      console.log(`  Неиспользованные станции: ${player.stationsRemaining} x ${UNUSED_STATION_POINTS} = +${unusedStationsBonus}`);
      
      finalScores.push({
        playerId: player.id,
        routePoints: player.score,
        ticketBonus,
        ticketPenalty,
        longestPathBonus: 0, // Will be set in second pass
        unusedStationsBonus,
        totalScore: player.score + ticketBonus - ticketPenalty + unusedStationsBonus,
        longestPath,
        completedTickets: completedCount,
        failedTickets: failedCount,
      });
    });
    
    console.log(`\n--- Бонус за самый длинный путь ---`);
    console.log(`Максимальная длина пути: ${maxLongestPath}`);
    
    // Second pass: Add longest path bonus (+10 for all players with max path)
    finalScores.forEach(fs => {
      if (fs.longestPath === maxLongestPath && maxLongestPath > 0) {
        fs.longestPathBonus = 10;
        fs.totalScore += 10;
        const playerName = gameState.players.find(p => p.id === fs.playerId)?.name;
        console.log(`  ${playerName}: получает +10 за самый длинный путь (${fs.longestPath})`);
      }
    });
    
    // Log final scores
    console.log(`\n--- ИТОГОВЫЕ ОЧКИ ---`);
    finalScores.forEach(fs => {
      const player = gameState.players.find(p => p.id === fs.playerId);
      console.log(`${player?.name}: ${fs.routePoints} (маршруты) + ${fs.ticketBonus} (билеты) - ${fs.ticketPenalty} (штраф) + ${fs.longestPathBonus} (длинный путь) = ${fs.totalScore}`);
    });
    
    // Determine winner according to Ticket to Ride Europe rules:
    // 1. Highest score
    // 2. If tied: most completed destination tickets
    // 3. If still tied: longest continuous path holder
    const sortedScores = [...finalScores].sort((a, b) => {
      // First: by total score (descending)
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // Second: by completed tickets (descending)
      if (b.completedTickets !== a.completedTickets) {
        return b.completedTickets - a.completedTickets;
      }
      // Third: by longest path (descending)
      return b.longestPath - a.longestPath;
    });
    
    const winnerId = sortedScores[0]?.playerId;
    const winnerName = gameState.players.find(p => p.id === winnerId)?.name;
    console.log(`\n🏆 ПОБЕДИТЕЛЬ: ${winnerName} с ${sortedScores[0]?.totalScore} очками`);
    console.log('=== КОНЕЦ ПОДСЧЁТА ОЧКОВ ===\n');
    
    // Update players with final scores
    const updatedPlayers = gameState.players.map(player => {
      const fs = finalScores.find(f => f.playerId === player.id);
      return {
        ...player,
        score: fs?.totalScore || player.score,
        destinationTickets: player.destinationTickets.map(ticket => ({
          ...ticket,
          isCompleted: areCitiesConnected(player.id, ticket.cities[0], ticket.cities[1]),
        })),
      };
    });
    
    // Play game over sound
    playSuccessSound();
    
    set({
      gameState: {
        ...gameState,
        phase: 'finished',
        players: updatedPlayers,
        winnerId,
        finalScores: finalScores.map(fs => ({
          playerId: fs.playerId,
          score: fs.totalScore,
          longestPath: fs.longestPath,
          completedTickets: fs.completedTickets,
          failedTickets: fs.failedTickets,
          ticketBonus: fs.ticketBonus,
          ticketPenalty: fs.ticketPenalty,
          longestPathBonus: fs.longestPathBonus,
        })),
      },
    });
  },
  
  canClaimRoute: (routeId) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return false;
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route || route.claimedBy) return false;
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return false;
    
    if (player.trainsRemaining < route.length) return false;
    
    // Check if player already claimed the parallel route
    if (route.parallelRouteId) {
      const parallelRoute = gameState.routes.find(r => r.id === route.parallelRouteId);
      if (parallelRoute?.claimedBy === localPlayerId) return false;
    }
    // Also check reverse - if this route is someone's parallel
    const routeAsParallel = gameState.routes.find(r => r.parallelRouteId === routeId);
    if (routeAsParallel?.claimedBy === localPlayerId) return false;
    
    // Count cards
    const cardCounts: Record<string, number> = {};
    player.trainCards.forEach(card => {
      cardCounts[card] = (cardCounts[card] || 0) + 1;
    });
    
    const locomotives = cardCounts['locomotive'] || 0;
    const ferryRequired = route.ferryLocomotives || 0;
    
    if (route.color === 'gray') {
      // Can use any color
      const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'black'];
      return colors.some(color => {
        const colorCount = cardCounts[color] || 0;
        return colorCount + locomotives >= route.length && locomotives >= ferryRequired;
      });
    } else {
      const colorCount = cardCounts[route.color] || 0;
      return colorCount + locomotives >= route.length && locomotives >= ferryRequired;
    }
  },
  
  getRouteCardRequirement: (routeId) => {
    const { gameState } = get();
    if (!gameState) return null;
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route) return null;
    
    return {
      color: route.color,
      count: route.length,
    };
  },
  
  getClaimRouteError: (routeId) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return 'Не ваш ход';
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route) return 'Маршрут не найден';
    if (route.claimedBy) return 'Маршрут уже занят';
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return 'Игрок не найден';
    
    if (player.trainsRemaining < route.length) return 'Недостаточно вагонов';
    
    // Check if player already claimed the parallel route
    if (route.parallelRouteId) {
      const parallelRoute = gameState.routes.find(r => r.id === route.parallelRouteId);
      if (parallelRoute?.claimedBy === localPlayerId) return 'Вы уже заняли параллельный маршрут';
    }
    // Also check reverse - if this route is someone's parallel
    const routeAsParallel = gameState.routes.find(r => r.parallelRouteId === routeId);
    if (routeAsParallel?.claimedBy === localPlayerId) return 'Вы уже заняли параллельный маршрут';
    
    // Count cards
    const cardCounts: Record<string, number> = {};
    player.trainCards.forEach(card => {
      cardCounts[card] = (cardCounts[card] || 0) + 1;
    });
    
    const locomotives = cardCounts['locomotive'] || 0;
    const ferryRequired = route.ferryLocomotives || 0;
    
    if (ferryRequired > 0 && locomotives < ferryRequired) {
      return `Нужно минимум ${ferryRequired} локомотивов для парома`;
    }
    
    if (route.color === 'gray') {
      const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'black'];
      const hasEnough = colors.some(color => {
        const colorCount = cardCounts[color] || 0;
        return colorCount + locomotives >= route.length;
      });
      if (!hasEnough) return 'Недостаточно карт одного цвета';
    } else {
      const colorCount = cardCounts[route.color] || 0;
    if (colorCount + locomotives < route.length) return 'Недостаточно карт нужного цвета';
    }
    
    return null;
  },
  
  canPayTunnelExtra: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || !gameState.tunnelReveal) return false;
    
    const { colorUsed, extraCardsNeeded } = gameState.tunnelReveal;
    if (extraCardsNeeded === 0) return true;
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return false;
    
    // Count available cards (color used + locomotives) minus already selected cards
    const { cardsUsed } = gameState.tunnelReveal;
    
    // Build a map of remaining cards in hand after original selection
    const remainingCards: Record<string, number> = {};
    player.trainCards.forEach(card => {
      remainingCards[card] = (remainingCards[card] || 0) + 1;
    });
    
    // Remove already used cards from count
    for (const card of cardsUsed) {
      if (remainingCards[card]) remainingCards[card]--;
    }
    
    // Count available matching cards
    const matchingCount = (remainingCards[colorUsed] || 0) + (remainingCards['locomotive'] || 0);
    
    return matchingCount >= extraCardsNeeded;
  },
  
  initiateKickVote: (targetPlayerId, initiatorId) => {
    const { gameState } = get();
    if (!gameState) return;
    
    // Cannot start a vote if one is already active
    if (gameState.activeKickVote) return;
    
    const targetPlayer = gameState.players.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return;
    
    const kickVote: KickVote = {
      targetPlayerId,
      targetPlayerName: targetPlayer.name,
      initiatorId,
      votes: {},
      expiresAt: Date.now() + KICK_VOTE_DURATION_MS,
    };
    
    set({
      gameState: {
        ...gameState,
        activeKickVote: kickVote,
        logs: [
          ...gameState.logs,
          createLog(initiatorId, 'Инициировал голосование', `Исключение: ${targetPlayer.name}`),
        ],
      },
    });
  },
  
  castKickVote: (voterId, approve) => {
    const { gameState } = get();
    if (!gameState || !gameState.activeKickVote) return;
    
    // Cannot vote if already voted
    if (gameState.activeKickVote.votes[voterId] !== undefined) return;
    
    // Cannot vote for yourself
    if (voterId === gameState.activeKickVote.targetPlayerId) return;
    
    const newVotes = {
      ...gameState.activeKickVote.votes,
      [voterId]: approve,
    };
    
    set({
      gameState: {
        ...gameState,
        activeKickVote: {
          ...gameState.activeKickVote,
          votes: newVotes,
        },
      },
    });
    
    // Check if all eligible voters have voted
    const eligibleVoters = gameState.players.filter(
      p => p.id !== gameState.activeKickVote!.targetPlayerId
    );
    const votedCount = Object.keys(newVotes).length;
    
    if (votedCount >= eligibleVoters.length) {
      // All votes are in, resolve immediately
      setTimeout(() => get().resolveKickVote(), 100);
    }
  },
  
  resolveKickVote: () => {
    const { gameState, currentRoom } = get();
    if (!gameState || !gameState.activeKickVote) return;
    
    const { targetPlayerId, targetPlayerName, votes } = gameState.activeKickVote;
    
    // Count votes
    const voteEntries = Object.entries(votes);
    const approveCount = voteEntries.filter(([, v]) => v).length;
    const rejectCount = voteEntries.filter(([, v]) => !v).length;
    
    // Majority wins (more approves than rejects)
    const kickApproved = approveCount > rejectCount;
    
    if (kickApproved) {
      // Remove the player
      const playerIndex = gameState.players.findIndex(p => p.id === targetPlayerId);
      const wasActive = gameState.currentPlayerId === targetPlayerId;
      const updatedPlayers = gameState.players.filter(p => p.id !== targetPlayerId);
      
      if (updatedPlayers.length < 2) {
        set({
          gameState: {
            ...gameState,
            phase: 'finished',
            players: updatedPlayers,
            activeKickVote: undefined,
            logs: [
              ...gameState.logs,
              createLog(undefined, 'Голосование завершено', `${targetPlayerName} исключён (${approveCount}:${rejectCount})`),
              createLog(undefined, 'Игра завершена', 'Недостаточно игроков'),
            ],
          },
        });
        return;
      }
      
      // Determine new current player if needed
      let newCurrentPlayerId = gameState.currentPlayerId;
      if (wasActive) {
        const newIndex = playerIndex % updatedPlayers.length;
        newCurrentPlayerId = updatedPlayers[newIndex].id;
        updatedPlayers[newIndex] = { ...updatedPlayers[newIndex], isActive: true };
      }
      
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentPlayerId: newCurrentPlayerId,
          currentAction: wasActive ? 'none' : gameState.currentAction,
          activeKickVote: undefined,
          logs: [
            ...gameState.logs,
            createLog(undefined, 'Голосование завершено', `${targetPlayerName} исключён (${approveCount}:${rejectCount})`),
            ...(wasActive ? [createLog(newCurrentPlayerId, 'Начинает ход', 'После исключения игрока')] : []),
          ],
        },
        currentRoom: currentRoom ? {
          ...currentRoom,
          players: updatedPlayers,
        } : null,
      });
    } else {
      // Vote failed
      set({
        gameState: {
          ...gameState,
          activeKickVote: undefined,
          logs: [
            ...gameState.logs,
            createLog(undefined, 'Голосование завершено', `${targetPlayerName} остаётся (${approveCount}:${rejectCount})`),
          ],
        },
      });
    }
  },
  
  cancelKickVote: () => {
    const { gameState } = get();
    if (!gameState || !gameState.activeKickVote) return;
    
    set({
      gameState: {
        ...gameState,
        activeKickVote: undefined,
        logs: [
          ...gameState.logs,
          createLog(undefined, 'Голосование отменено', 'Время истекло'),
        ],
      },
    });
  },
  
  // Station building functions
  startBuildStation: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    if (gameState.currentAction !== 'none') return;
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player || player.stationsRemaining <= 0) return;
    
    set({
      gameState: {
        ...gameState,
        currentAction: 'buildStation',
      },
    });
  },
  
  buildStation: (cityId, cardsUsed) => {
    const { gameState, localPlayerId, currentRoom } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    if (gameState.currentAction !== 'buildStation') return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    if (player.stationsRemaining <= 0) return;
    
    // Check if city already has a station
    if (gameState.placedStations.some(s => s.cityId === cityId)) {
      const city = gameState.cities.find(c => c.id === cityId);
      toast({
        title: "🏛️ Станция уже построена",
        description: `В городе ${city?.name || cityId} уже есть станция другого игрока`,
        variant: "destructive",
      });
      return;
    }
    
    // Calculate cost based on how many stations player has already built
    const stationsBuilt = 3 - player.stationsRemaining; // 0, 1, or 2
    const cost = STATION_COSTS[stationsBuilt]; // 1, 2, or 3 cards
    
    // Verify cards used
    if (cardsUsed.length !== cost) return;
    
    // For 2nd and 3rd stations, all cards must be the same color or locomotives
    if (cost > 1) {
      const nonLocos = cardsUsed.filter(c => c !== 'locomotive');
      if (nonLocos.length > 0) {
        const firstColor = nonLocos[0];
        if (!nonLocos.every(c => c === firstColor)) return; // Must be same color
      }
    }
    
    // Remove used cards from player's hand
    let newHand = [...player.trainCards];
    for (const card of cardsUsed) {
      const index = newHand.indexOf(card);
      if (index > -1) {
        newHand.splice(index, 1);
      }
    }
    
    // Add cards to discard
    const newDiscard = [...gameState.trainCardDiscard, ...cardsUsed];
    
    // Create new placed station
    const newStation: PlacedStation = {
      cityId,
      playerId: localPlayerId!,
    };
    
    // Get city name for log
    const city = gameState.cities.find(c => c.id === cityId);
    const cityName = city?.name || cityId;
    
    // Play sound effect
    playRouteClaimSound();
    
    // Move to next player
    const isSolo = currentRoom?.isSoloMode;
    const nextPlayerIndex = isSolo ? playerIndex : (playerIndex + 1) % gameState.players.length;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...player,
      trainCards: newHand,
      stationsRemaining: player.stationsRemaining - 1,
      isActive: isSolo ? true : false,
    };
    if (!isSolo) {
      updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
    }
    
    // Handle last round turn counting
    let turnsRemainingInLastRound = gameState.turnsRemainingInLastRound;
    if (gameState.phase === 'lastRound' && turnsRemainingInLastRound !== undefined && !isSolo) {
      turnsRemainingInLastRound = turnsRemainingInLastRound - 1;
    }
    
    // Check if last round is over
    if (turnsRemainingInLastRound !== undefined && turnsRemainingInLastRound <= 0) {
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentPlayerId: updatedPlayers[nextPlayerIndex].id,
          currentAction: 'none',
          trainCardDiscard: newDiscard,
          placedStations: [...gameState.placedStations, newStation],
          turnNumber: gameState.turnNumber + 1,
          turnsRemainingInLastRound: 0,
          logs: [
            ...gameState.logs,
            createLog(localPlayerId, 'Построил станцию', cityName),
          ],
        },
      });
      setTimeout(() => get().calculateFinalScores(), 100);
      return;
    }
    
    const nextPlayer = updatedPlayers[nextPlayerIndex];
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: nextPlayer.id,
        currentAction: 'none',
        trainCardDiscard: newDiscard,
        placedStations: [...gameState.placedStations, newStation],
        turnNumber: gameState.turnNumber + 1,
        turnsRemainingInLastRound,
        logs: [
          ...gameState.logs,
          createLog(localPlayerId, 'Построил станцию', cityName),
          ...(isSolo ? [] : [createLog(nextPlayer.id, 'Начинает ход')]),
        ],
      },
    });
  },
  
  cancelBuildStation: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    if (gameState.currentAction !== 'buildStation') return;
    
    set({
      gameState: {
        ...gameState,
        currentAction: 'none',
      },
    });
  },
  
  canBuildStation: (cityId) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return false;
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player || player.stationsRemaining <= 0) return false;
    
    // Check if city already has a station
    if (gameState.placedStations.some(s => s.cityId === cityId)) return false;
    
    // Calculate cost
    const stationsBuilt = 3 - player.stationsRemaining;
    const cost = STATION_COSTS[stationsBuilt];
    
    // Check if player has enough cards of the same color
    const cardCounts: Record<string, number> = {};
    player.trainCards.forEach(card => {
      cardCounts[card] = (cardCounts[card] || 0) + 1;
    });
    
    const locomotives = cardCounts['locomotive'] || 0;
    
    // For cost 1, any card works
    if (cost === 1) {
      return player.trainCards.length >= 1;
    }
    
    // For cost 2 or 3, need cards of same color + locomotives
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'black'];
    return colors.some(color => {
      const colorCount = cardCounts[color] || 0;
      return colorCount + locomotives >= cost;
    }) || locomotives >= cost;
  },
  
  getStationCost: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState) return 1;
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return 1;
    
    const stationsBuilt = 3 - player.stationsRemaining;
    return STATION_COSTS[stationsBuilt] || 1;
  },
}));
