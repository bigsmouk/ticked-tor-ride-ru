import { create } from 'zustand';
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
  ROUTE_POINTS,
  INITIAL_TRAINS,
  INITIAL_TRAIN_CARDS,
  END_GAME_TRAINS_THRESHOLD,
} from '@/types/game';
import { 
  EUROPE_CITIES, 
  EUROPE_ROUTES, 
  DESTINATION_TICKETS, 
  createTrainCardDeck, 
  shuffleArray 
} from '@/data/europeMap';

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
  claimRoute: (routeId: string, cardsUsed: TrainCardType[]) => void;
  drawDestinations: () => void;
  keepDestinations: (ticketIds: string[]) => void;
  endTurn: () => void;
  
  // Helpers
  canClaimRoute: (routeId: string) => boolean;
  getRouteCardRequirement: (routeId: string) => { color: string; count: number } | null;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentView: 'lobby',
  currentRoom: null,
  availableRooms: [],
  gameState: null,
  localPlayerId: null,
  
  setView: (view) => set({ currentView: view }),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  
  setGameState: (state) => set({ gameState: state }),
  leaveRoom: () => {
    set({
      currentRoom: null,
      gameState: null,
      localPlayerId: null,
      currentView: 'lobby',
    });
  },
  
  initializeGame: () => {
    const { currentRoom } = get();
    if (!currentRoom || currentRoom.players.length < 2) return;
    
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
      turnNumber: 1,
    };
    
    set({
      gameState,
      currentRoom: {
        ...currentRoom,
        status: 'playing',
      },
    });
  },
  
  drawTrainCard: (fromFaceUp, cardIndex) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const player = gameState.players[playerIndex];
    let newDeck = [...gameState.trainCardDeck];
    let newFaceUp = [...gameState.faceUpCards];
    let newHand = [...player.trainCards];
    let newDiscard = [...gameState.trainCardDiscard];
    let newAction = gameState.currentAction;
    
    if (fromFaceUp && cardIndex !== undefined) {
      // Take from face-up cards
      const card = newFaceUp[cardIndex];
      if (!card) return;
      
      // If taking locomotive from face-up, can only take one card
      if (card === 'locomotive') {
        if (newAction === 'drawTrainCards') {
          // Already drew one card, can't take locomotive
          return;
        }
        newHand.push(card);
        
        // Replace the face-up card
        const replacement = newDeck.pop();
        if (replacement) {
          newFaceUp[cardIndex] = replacement as TrainCardType;
        } else {
          newFaceUp = newFaceUp.filter((_, i) => i !== cardIndex);
        }
        
        // End turn after taking locomotive
        newAction = 'none';
        // Move to next player
        const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
        
        const updatedPlayers = [...gameState.players];
        updatedPlayers[playerIndex] = { ...player, trainCards: newHand, isActive: false };
        updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
        
        set({
          gameState: {
            ...gameState,
            players: updatedPlayers,
            currentPlayerId: updatedPlayers[nextPlayerIndex].id,
            currentAction: 'none',
            trainCardDeck: newDeck,
            faceUpCards: newFaceUp,
            turnNumber: gameState.turnNumber + 1,
          },
        });
        return;
      }
      
      newHand.push(card);
      
      // Replace the face-up card
      const replacement = newDeck.pop();
      if (replacement) {
        newFaceUp[cardIndex] = replacement as TrainCardType;
      } else {
        newFaceUp = newFaceUp.filter((_, i) => i !== cardIndex);
      }
    } else {
      // Take from deck
      const card = newDeck.pop();
      if (!card) return;
      newHand.push(card as TrainCardType);
    }
    
    // Check if this is the first or second card draw
    if (newAction === 'none') {
      newAction = 'drawTrainCards';
      
      // First card drawn, update state but don't end turn
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerIndex] = { ...player, trainCards: newHand };
      
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentAction: newAction,
          trainCardDeck: newDeck,
          faceUpCards: newFaceUp,
        },
      });
    } else {
      // Second card drawn, end turn
      const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerIndex] = { ...player, trainCards: newHand, isActive: false };
      updatedPlayers[nextPlayerIndex] = { ...updatedPlayers[nextPlayerIndex], isActive: true };
      
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentPlayerId: updatedPlayers[nextPlayerIndex].id,
          currentAction: 'none',
          trainCardDeck: newDeck,
          faceUpCards: newFaceUp,
          turnNumber: gameState.turnNumber + 1,
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
    
    set({
      gameState: {
        ...gameState,
        phase: newPhase,
        players: updatedPlayers,
        currentPlayerId: updatedPlayers[nextPlayerIndex].id,
        currentAction: 'none',
        routes: newRoutes,
        trainCardDiscard: newDiscard,
        turnNumber: gameState.turnNumber + 1,
        lastRoundTriggeredBy,
        turnsRemainingInLastRound,
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
    
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: updatedPlayers[nextPlayerIndex].id,
        currentAction: 'none',
        destinationDeck: newDestinationDeck,
        turnNumber: gameState.turnNumber + 1,
      },
    });
  },
  
  endTurn: () => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return;
    
    const playerIndex = gameState.players.findIndex(p => p.id === localPlayerId);
    if (playerIndex === -1) return;
    
    const nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
    
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], isActive: false };
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
  
  canClaimRoute: (routeId) => {
    const { gameState, localPlayerId } = get();
    if (!gameState || gameState.currentPlayerId !== localPlayerId) return false;
    
    const route = gameState.routes.find(r => r.id === routeId);
    if (!route || route.claimedBy) return false;
    
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return false;
    
    if (player.trainsRemaining < route.length) return false;
    
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
}));
