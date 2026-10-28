import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { GameState, Route, TrainCardType } from '@/types/game';

const COLORS: TrainCardType[] = ['red','blue','green','yellow','orange','pink','white','black'];

function payment(route: Route, hand: TrainCardType[]): TrainCardType[] | null {
  const wild = hand.filter(c => c === 'locomotive').length;
  const choices = route.color === 'gray' ? COLORS : [route.color];
  for (const color of choices) {
    const requiredWild = Math.max(route.ferryLocomotives || 0, route.length - hand.filter(c => c === color).length);
    if (requiredWild > wild) continue;
    const count = route.length - requiredWild;
    if (hand.filter(c => c === color).length < count) continue;
    return [...Array(count).fill(color), ...Array(requiredWild).fill('locomotive')] as TrainCardType[];
  }
  return null;
}

function pathToTicket(state: GameState, botId: string, start: string, end: string): Route[] {
  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, { city: string; route: Route }>();
  const visited = new Set<string>();
  while (true) {
    const next = [...dist.entries()].filter(([city]) => !visited.has(city)).sort((a,b) => a[1]-b[1])[0];
    if (!next) return [];
    const [city, cost] = next;
    if (city === end) break;
    visited.add(city);
    for (const route of state.routes) {
      if (!route.cities.includes(city) || (route.claimedBy && route.claimedBy !== botId)) continue;
      const other = route.cities[0] === city ? route.cities[1] : route.cities[0];
      if (visited.has(other)) continue;
      const weight = route.claimedBy === botId ? 0 : route.length + (route.isTunnel ? 1.5 : 0) + (route.ferryLocomotives || 0) * 1.2;
      if (cost + weight < (dist.get(other) ?? Infinity)) {
        dist.set(other, cost + weight);
        prev.set(other, { city, route });
      }
    }
  }
  const path: Route[] = [];
  let city = end;
  while (city !== start) {
    const step = prev.get(city);
    if (!step) return [];
    path.unshift(step.route);
    city = step.city;
  }
  return path.filter(route => !route.claimedBy);
}

function takeBotTurn() {
  const store = useGameStore.getState();
  const state = store.gameState;
  const room = store.currentRoom;
  if (!state || !room?.isSoloMode || state.phase === 'finished' || state.currentAction !== 'none') return;
  const bot = state.players.find(player => player.isBot && player.id === state.currentPlayerId);
  if (!bot) return;

  // Existing game actions check localPlayerId. Temporarily impersonate the local bot
  // synchronously, then restore the human ID before the next React render.
  const humanId = store.localPlayerId;
  useGameStore.setState({ localPlayerId: bot.id });
  try {
    const api = useGameStore.getState();
    const tickets = [...bot.destinationTickets].sort((a,b) => b.points - a.points);
    const targetPaths = tickets.map(ticket => pathToTicket(state, bot.id, ticket.cities[0], ticket.cities[1]));
    const targets = targetPaths.find(path => path.length > 0) || [];
    const available = state.routes.filter(route => !route.claimedBy && route.length <= bot.trainsRemaining);
    const ranked = [...available].sort((a,b) => {
      const rank = (route: Route) => (targets.some(t => t.id === route.id) ? 100 : 0) + route.length * 2 - (route.isTunnel ? 7 : 0) - (route.ferryLocomotives || 0) * 5;
      return rank(b) - rank(a);
    });
    const playable = ranked.find(route => payment(route, bot.trainCards) && !api.getClaimRouteError(route.id));
    if (playable && (targets.includes(playable) || bot.trainCards.length >= 9 || Math.random() < 0.3)) {
      const cards = payment(playable, bot.trainCards)!;
      if (playable.isTunnel) {
        api.attemptClaimTunnel(playable.id, cards);
        const reveal = useGameStore.getState().gameState?.tunnelReveal;
        if (reveal) {
          const remaining = [...bot.trainCards];
          for (const card of cards) remaining.splice(remaining.indexOf(card), 1);
          const extras: TrainCardType[] = [];
          for (let i = 0; i < reveal.extraCardsNeeded; i++) {
            const index = remaining.findIndex(card => card === reveal.colorUsed || card === 'locomotive');
            if (index < 0) break;
            extras.push(remaining.splice(index, 1)[0]);
          }
          if (extras.length === reveal.extraCardsNeeded) api.confirmTunnelClaim(extras);
          else api.cancelTunnelClaim();
        }
      } else api.claimRoute(playable.id, cards);
      return;
    }

    // Choose face-up colors for a target route; otherwise diversify the hand.
    const wanted = (targets[0] || ranked[0]);
    const preferred: TrainCardType[] = wanted
      ? wanted.color === 'gray' ? COLORS : [wanted.color]
      : COLORS;
    api.startDrawingCards();
    for (let draw = 0; draw < 2; draw++) {
      const now = useGameStore.getState().gameState;
      if (!now || now.currentPlayerId !== bot.id || now.currentAction === 'none') break;
      let index = now.faceUpCards.findIndex(c => c !== 'locomotive' && preferred.includes(c));
      if (index < 0) index = now.faceUpCards.findIndex(c => c !== 'locomotive');
      if (index >= 0) api.drawTrainCard(true, index);
      else if (draw === 0 && now.faceUpCards.includes('locomotive')) api.drawTrainCard(true, now.faceUpCards.indexOf('locomotive'));
      else api.drawTrainCard(false);
    }
  } finally {
    useGameStore.setState({ localPlayerId: humanId });
  }
}

export function SoloBotController() {
  const room = useGameStore(s => s.currentRoom);
  const current = useGameStore(s => s.gameState?.currentPlayerId);
  const phase = useGameStore(s => s.gameState?.phase);
  const action = useGameStore(s => s.gameState?.currentAction);
  useEffect(() => {
    if (!room?.isSoloMode || !room.players.some(p => p.isBot && p.id === current) || phase === 'finished' || action !== 'none') return;
    const timer = window.setTimeout(takeBotTurn, 1100 + Math.random() * 700);
    return () => window.clearTimeout(timer);
  }, [room, current, phase, action]);
  return null;
}
