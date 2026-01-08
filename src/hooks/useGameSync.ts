import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { GameState, TrainCardType } from '@/types/game';
import { RealtimeChannel } from '@supabase/supabase-js';

export type GameAction = 
  | { type: 'drawTrainCard'; fromFaceUp: boolean; cardIndex?: number }
  | { type: 'claimRoute'; routeId: string; cardsUsed: TrainCardType[] }
  | { type: 'drawDestinations' }
  | { type: 'keepDestinations'; ticketIds: string[] }
  | { type: 'endTurn' };

export const useGameSync = (roomId: string | null) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const gameState = useGameStore(state => state.gameState);
  const localPlayerId = useGameStore(state => state.localPlayerId);
  const currentRoom = useGameStore(state => state.currentRoom);
  const setGameState = useGameStore(state => state.setGameState);
  
  // Game actions from store (host will execute these)
  const executeDrawTrainCard = useGameStore(state => state.drawTrainCard);
  const executeClaimRoute = useGameStore(state => state.claimRoute);
  const executeDrawDestinations = useGameStore(state => state.drawDestinations);
  const executeKeepDestinations = useGameStore(state => state.keepDestinations);
  const executeEndTurn = useGameStore(state => state.endTurn);
  
  const isHost = currentRoom?.hostId === localPlayerId;
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;
  
  const hostIdRef = useRef<string | null>(null);
  hostIdRef.current = currentRoom?.hostId || null;

  // Отправка действия хосту (для не-хостов)
  const sendActionToHost = useCallback((action: GameAction) => {
    if (!channelRef.current || isHostRef.current) return;
    
    console.log('[GameSync] Sending action to host:', action.type);
    channelRef.current.send({
      type: 'broadcast',
      event: 'player_action',
      payload: {
        playerId: localPlayerId,
        action,
      },
    });
  }, [localPlayerId]);

  useEffect(() => {
    if (!roomId || !localPlayerId) {
      console.log('[GameSync] No roomId or localPlayerId, skipping');
      return;
    }

    console.log('[GameSync] Setting up channel for room:', roomId, 'player:', localPlayerId, 'isHost:', isHostRef.current);

    // Создаём канал для синхронизации
    const channel = supabase.channel(`game-sync-${roomId}`, {
      config: {
        presence: {
          key: localPlayerId,
        },
        broadcast: {
          self: false,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('[GameSync] Presence sync event, state:', Object.keys(presenceState));
        
        // Ищем состояние игры от хоста
        const hostId = hostIdRef.current;
        if (!hostId) {
          console.log('[GameSync] No hostId found');
          return;
        }

        // Если мы хост, не обновляем из presence
        if (isHostRef.current) {
          console.log('[GameSync] We are host, ignoring sync');
          return;
        }

        // Ищем presence хоста
        const hostPresences = presenceState[hostId];
        if (hostPresences && hostPresences.length > 0) {
          const hostPresence = hostPresences[0] as any;
          if (hostPresence?.gameState) {
            try {
              const parsedState = JSON.parse(hostPresence.gameState) as GameState;
              console.log('[GameSync] Received state from host, currentPlayer:', parsedState.currentPlayerId, 'turn:', parsedState.turnNumber);
              setGameState(parsedState);
            } catch (e) {
              console.error('[GameSync] Error parsing game state:', e);
            }
          }
        }
      })
      // Хост слушает действия от других игроков
      .on('broadcast', { event: 'player_action' }, (payload) => {
        if (!isHostRef.current) return;
        
        const { playerId, action } = payload.payload as { playerId: string; action: GameAction };
        console.log('[GameSync] Host received action from player:', playerId, 'action:', action.type);
        
        // Проверяем, что действие от текущего активного игрока
        const currentState = useGameStore.getState().gameState;
        if (!currentState || currentState.currentPlayerId !== playerId) {
          console.log('[GameSync] Ignoring action - not from current player');
          return;
        }
        
        // Временно подменяем localPlayerId для выполнения действия
        const originalPlayerId = useGameStore.getState().localPlayerId;
        useGameStore.setState({ localPlayerId: playerId });
        
        // Выполняем действие
        switch (action.type) {
          case 'drawTrainCard':
            executeDrawTrainCard(action.fromFaceUp, action.cardIndex);
            break;
          case 'claimRoute':
            executeClaimRoute(action.routeId, action.cardsUsed);
            break;
          case 'drawDestinations':
            executeDrawDestinations();
            break;
          case 'keepDestinations':
            executeKeepDestinations(action.ticketIds);
            break;
          case 'endTurn':
            executeEndTurn();
            break;
        }
        
        // Восстанавливаем localPlayerId
        useGameStore.setState({ localPlayerId: originalPlayerId });
      })
      .subscribe(async (status) => {
        console.log('[GameSync] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          // Если мы хост и есть состояние игры, транслируем его
          const currentGameState = useGameStore.getState().gameState;
          if (isHostRef.current && currentGameState) {
            console.log('[GameSync] Host broadcasting initial state');
            await channel.track({
              gameState: JSON.stringify(currentGameState),
              updatedAt: Date.now(),
              isHost: true,
            });
          }
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[GameSync] Cleaning up channel');
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, localPlayerId, setGameState, executeDrawTrainCard, executeClaimRoute, executeDrawDestinations, executeKeepDestinations, executeEndTurn]);

  // Транслируем изменения состояния игры (только хост)
  useEffect(() => {
    if (gameState && isHostRef.current && channelRef.current) {
      console.log('[GameSync] Host broadcasting updated state, turn:', gameState.turnNumber, 'currentPlayer:', gameState.currentPlayerId);
      channelRef.current.track({
        gameState: JSON.stringify(gameState),
        updatedAt: Date.now(),
        isHost: true,
      });
    }
  }, [gameState]);

  return { sendActionToHost, isHost };
};
