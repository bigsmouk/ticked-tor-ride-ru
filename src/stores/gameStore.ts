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
  cancelDestinationDraw: () => void;
  endTurn: () => void;
  calculateFinalScores: () => void;
  
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
      
      set({
        gameState: {
          ...gameState,
          players: updatedPlayers,
          currentPlayerId: updatedPlayers[nextPlayerIndex].id,
          currentAction: 'none',
          trainCardDeck: newDeck,
          faceUpCards: newFaceUp,
          turnNumber: gameState.turnNumber + 1,
          turnsRemainingInLastRound,
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
    
    set({
      gameState: {
        ...gameState,
        players: updatedPlayers,
        currentPlayerId: updatedPlayers[nextPlayerIndex].id,
        currentAction: 'none',
        destinationDeck: newDestinationDeck,
        turnNumber: gameState.turnNumber + 1,
        turnsRemainingInLastRound,
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
  
  calculateFinalScores: () => {
    const { gameState } = get();
    if (!gameState) return;
    
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
    
    // Check if two cities are connected for a player
    const areCitiesConnected = (playerId: string, city1: string, city2: string): boolean => {
      const connections = getPlayerConnections(playerId);
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
    
    // Calculate longest path using DFS
    const calculateLongestPath = (playerId: string): number => {
      const routes = gameState.routes.filter(r => r.claimedBy === playerId);
      if (routes.length === 0) return 0;
      
      const connections = new Map<string, { city: string; length: number }[]>();
      routes.forEach(route => {
        const [city1, city2] = route.cities;
        if (!connections.has(city1)) connections.set(city1, []);
        if (!connections.has(city2)) connections.set(city2, []);
        connections.get(city1)!.push({ city: city2, length: route.length });
        connections.get(city2)!.push({ city: city1, length: route.length });
      });
      
      let maxPath = 0;
      const visitedRoutes = new Set<string>();
      
      const dfs = (city: string, pathLength: number) => {
        maxPath = Math.max(maxPath, pathLength);
        const neighbors = connections.get(city) || [];
        
        for (const neighbor of neighbors) {
          const routeKey = [city, neighbor.city].sort().join('-');
          if (!visitedRoutes.has(routeKey)) {
            visitedRoutes.add(routeKey);
            dfs(neighbor.city, pathLength + neighbor.length);
            visitedRoutes.delete(routeKey);
          }
        }
      };
      
      // Start DFS from each city
      connections.forEach((_, city) => {
        visitedRoutes.clear();
        dfs(city, 0);
      });
      
      return maxPath;
    };
    
    // Calculate final scores
    const finalScores: { playerId: string; score: number; longestPath: number; completedTickets: number; failedTickets: number }[] = [];
    let maxLongestPath = 0;
    
    gameState.players.forEach(player => {
      const longestPath = calculateLongestPath(player.id);
      maxLongestPath = Math.max(maxLongestPath, longestPath);
      
      let ticketBonus = 0;
      let ticketPenalty = 0;
      let completedCount = 0;
      let failedCount = 0;
      
      player.destinationTickets.forEach(ticket => {
        if (areCitiesConnected(player.id, ticket.cities[0], ticket.cities[1])) {
          ticketBonus += ticket.points;
          completedCount++;
        } else {
          ticketPenalty += ticket.points;
          failedCount++;
        }
      });
      
      finalScores.push({
        playerId: player.id,
        score: player.score + ticketBonus - ticketPenalty,
        longestPath,
        completedTickets: completedCount,
        failedTickets: failedCount,
      });
    });
    
    // Add longest path bonus
    finalScores.forEach(fs => {
      if (fs.longestPath === maxLongestPath) {
        fs.score += 10; // LONGEST_PATH_BONUS
      }
    });
    
    // Determine winner
    const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);
    const winnerId = sortedScores[0]?.playerId;
    
    // Update players with final scores
    const updatedPlayers = gameState.players.map(player => {
      const fs = finalScores.find(f => f.playerId === player.id);
      return {
        ...player,
        score: fs?.score || player.score,
        destinationTickets: player.destinationTickets.map(ticket => ({
          ...ticket,
          isCompleted: areCitiesConnected(player.id, ticket.cities[0], ticket.cities[1]),
        })),
      };
    });
    
    set({
      gameState: {
        ...gameState,
        phase: 'finished',
        players: updatedPlayers,
        winnerId,
        finalScores: finalScores.map(fs => ({
          playerId: fs.playerId,
          score: fs.score,
          longestPath: fs.longestPath,
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
}));
