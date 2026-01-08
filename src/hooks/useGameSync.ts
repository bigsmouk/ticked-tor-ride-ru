import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { GameState } from '@/types/game';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useGameSync = (roomId: string | null) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const gameState = useGameStore(state => state.gameState);
  const localPlayerId = useGameStore(state => state.localPlayerId);
  const currentRoom = useGameStore(state => state.currentRoom);
  const setGameState = useGameStore(state => state.setGameState);
  
  const isHost = currentRoom?.hostId === localPlayerId;
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;
  
  const hostIdRef = useRef<string | null>(null);
  hostIdRef.current = currentRoom?.hostId || null;

  // Функция для трансляции состояния игры (только хост)
  const broadcastGameState = useCallback((state: GameState) => {
    if (!channelRef.current || !isHostRef.current) return;
    
    console.log('[GameSync] Broadcasting state as host');
    channelRef.current.track({
      gameState: JSON.stringify(state),
      updatedAt: Date.now(),
      isHost: true,
    });
  }, []);

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
              console.log('[GameSync] Received state from host, currentPlayer:', parsedState.currentPlayerId);
              setGameState(parsedState);
            } catch (e) {
              console.error('[GameSync] Error parsing game state:', e);
            }
          }
        }
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
  }, [roomId, localPlayerId, setGameState]);

  // Транслируем изменения состояния игры (только хост)
  useEffect(() => {
    if (gameState && isHostRef.current && channelRef.current) {
      console.log('[GameSync] Host broadcasting updated state, turn:', gameState.turnNumber);
      channelRef.current.track({
        gameState: JSON.stringify(gameState),
        updatedAt: Date.now(),
        isHost: true,
      });
    }
  }, [gameState]);

  return { broadcastGameState, isHost };
};
