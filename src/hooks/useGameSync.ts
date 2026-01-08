import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { GameState } from '@/types/game';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useGameSync = (roomId: string | null) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { gameState, localPlayerId, setGameState } = useGameStore();
  const isHostRef = useRef(false);

  // Определяем, является ли текущий игрок хостом
  const { currentRoom } = useGameStore();
  isHostRef.current = currentRoom?.hostId === localPlayerId;

  // Функция для трансляции состояния игры (только хост)
  const broadcastGameState = useCallback((state: GameState) => {
    if (!channelRef.current || !isHostRef.current) return;
    
    channelRef.current.track({
      gameState: JSON.stringify(state),
      updatedAt: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!roomId || !localPlayerId) return;

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
        const state = channel.presenceState();
        
        // Ищем состояние игры от хоста
        for (const [key, presences] of Object.entries(state)) {
          const presence = presences[0] as any;
          if (presence?.gameState && key !== localPlayerId) {
            try {
              const parsedState = JSON.parse(presence.gameState) as GameState;
              // Обновляем локальное состояние только если мы не хост
              if (!isHostRef.current) {
                setGameState(parsedState);
              }
            } catch (e) {
              console.error('Error parsing game state:', e);
            }
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Game sync channel subscribed');
          // Если мы хост и есть состояние игры, транслируем его
          if (isHostRef.current && gameState) {
            await channel.track({
              gameState: JSON.stringify(gameState),
              updatedAt: Date.now(),
            });
          }
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, localPlayerId, setGameState]);

  // Транслируем изменения состояния игры (только хост)
  useEffect(() => {
    if (gameState && isHostRef.current && channelRef.current) {
      channelRef.current.track({
        gameState: JSON.stringify(gameState),
        updatedAt: Date.now(),
      });
    }
  }, [gameState]);

  return { broadcastGameState };
};
