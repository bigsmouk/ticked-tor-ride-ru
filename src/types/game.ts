// Route colors in the game
export type RouteColor = 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'pink' | 'white' | 'black' | 'gray';

// Player colors
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'black';

// Train card types (including locomotive as wild)
export type TrainCardType = RouteColor | 'locomotive';

// City on the map
export interface City {
  id: string;
  name: string;
  x: number;
  y: number;
}

// Route between two cities
export interface Route {
  id: string;
  cities: [string, string]; // City IDs
  length: number; // 1-6
  color: RouteColor | 'gray'; // gray means any color can be used
  isTunnel?: boolean;
  ferryLocomotives?: number; // Number of locomotives required for ferry
  claimedBy?: string; // Player ID who claimed this route
  parallelRouteId?: string; // ID of parallel route (if exists)
}

// Destination ticket (route goal)
export interface DestinationTicket {
  id: string;
  cities: [string, string]; // City IDs
  points: number;
  isCompleted?: boolean;
  isLongRoute?: boolean; // Long routes worth more points
}

// Player state
export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  color: PlayerColor;
  trainCards: TrainCardType[];
  destinationTickets: DestinationTicket[];
  trainsRemaining: number; // Starts at 45
  stations: number; // Starts at 3
  score: number;
  isActive: boolean;
  isConnected: boolean;
  isBot?: boolean; // AI controlled player
}

// Game phases
export type GamePhase = 
  | 'waiting' // Waiting for players
  | 'setup' // Initial card distribution
  | 'playing' // Main game
  | 'lastRound' // Final round triggered
  | 'finished'; // Game over

// Turn actions
export type TurnAction = 
  | 'none'
  | 'selectingFirstCard' // Choosing where to draw first card from
  | 'drawTrainCards' // Already drew first card, drawing second
  | 'claimRoute' // Claiming a route
  | 'drawDestinations'; // Drawing destination tickets

// Game room
export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  isPrivate?: boolean;
  createdAt: Date;
}

// Kick vote
export interface KickVote {
  targetPlayerId: string;
  targetPlayerName: string;
  initiatorId: string;
  votes: Record<string, boolean>; // playerId -> approve/reject
  expiresAt: number; // timestamp
}

// Main game state
export interface GameState {
  roomId: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerId: string;
  currentAction: TurnAction;
  
  // Card decks
  trainCardDeck: TrainCardType[];
  trainCardDiscard: TrainCardType[];
  faceUpCards: TrainCardType[]; // 5 face-up cards
  destinationDeck: DestinationTicket[];
  
  // Map data
  cities: City[];
  routes: Route[];
  
  // Game tracking
  turnNumber: number;
  lastRoundTriggeredBy?: string;
  turnsRemainingInLastRound?: number;
  
  // Game logs
  logs: GameLogEntry[];
  
  // Winner info
  winnerId?: string;
  finalScores?: { playerId: string; score: number; longestPath: number }[];
  
  // Kick voting
  activeKickVote?: KickVote;
}

// Chat message
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

// Game log entry
export interface GameLogEntry {
  id: string;
  playerId?: string;
  action: string;
  details?: string;
  timestamp: Date;
}

// Points for route lengths
export const ROUTE_POINTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
  6: 15,
  7: 18,
  8: 21,
};

// Initial train count per player
export const INITIAL_TRAINS = 45;

// Initial stations per player
export const INITIAL_STATIONS = 3;

// Initial train cards dealt
export const INITIAL_TRAIN_CARDS = 4;

// Destination tickets to draw initially
export const INITIAL_DESTINATION_DRAW = 3;
export const MIN_DESTINATION_KEEP = 2;

// During game destination draw
export const DESTINATION_DRAW_COUNT = 3;
export const MIN_DESTINATION_KEEP_GAME = 1;

// End game trigger threshold
export const END_GAME_TRAINS_THRESHOLD = 2;

// Longest path bonus
export const LONGEST_PATH_BONUS = 10;
