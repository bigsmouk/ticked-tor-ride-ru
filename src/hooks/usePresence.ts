import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { playPlayerJoinSound, playPlayerLeaveSound } from './useGameSounds';

interface PresenceState {
  playerId: string;
  playerName: string;
  lastSeen: number;
}

export const usePresence = (roomId: string | null) => {
  const { localPlayerId, currentRoom } = useGameStore();
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  // Храним предыдущее состояние для сравнения (чтобы не дублировать уведомления)
  const previousOnlineRef = useRef<Set<string>>(new Set());
  const isInitialSyncRef = useRef(true);

  // Получаем имя игрока по ID
  const getPlayerName = useCallback((playerId: string): string => {
    const player = currentRoom?.players.find(p => p.id === playerId);
    return player?.name || 'Игрок';
  }, [currentRoom?.players]);

  // Обновление списка онлайн игроков
  const updateOnlinePlayers = useCallback((presenceState: Record<string, PresenceState[]>) => {
    const online = new Set<string>();
    
    Object.values(presenceState).forEach((presences) => {
      presences.forEach((presence) => {
        online.add(presence.playerId);
      });
    });
    
    setOnlinePlayers(online);
  }, []);

  useEffect(() => {
    if (!roomId || !localPlayerId) return;

    const presenceChannel = supabase.channel(`presence-${roomId}`, {
      config: {
        presence: {
          key: localPlayerId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState<PresenceState>();
        updateOnlinePlayers(state);
        
        // Первичная синхронизация — не показываем уведомления
        if (isInitialSyncRef.current) {
          const online = new Set<string>();
          Object.values(state).forEach((presences) => {
            presences.forEach((presence) => {
              online.add(presence.playerId);
            });
          });
          previousOnlineRef.current = online;
          isInitialSyncRef.current = false;
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const firstPresence = newPresences[0] as unknown as PresenceState | undefined;
        const joinedPlayerId = firstPresence?.playerId || key;
        
        // Не уведомляем о себе и не дублируем
        if (joinedPlayerId !== localPlayerId && !previousOnlineRef.current.has(joinedPlayerId)) {
          const playerName = getPlayerName(joinedPlayerId);
          console.log(`🟢 [Presence] Игрок подключился: ${playerName} (${joinedPlayerId})`);
          toast.success(`${playerName} подключился к игре`);
          playPlayerJoinSound();
        }
        
        setOnlinePlayers(prev => {
          const next = new Set(prev);
          newPresences.forEach((p) => {
            const presence = p as unknown as PresenceState;
            const id = presence?.playerId;
            if (id) {
              next.add(id);
              previousOnlineRef.current.add(id);
            }
          });
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const firstPresence = leftPresences[0] as unknown as PresenceState | undefined;
        const leftPlayerId = firstPresence?.playerId || key;
        
        // Не уведомляем о себе
        if (leftPlayerId !== localPlayerId && previousOnlineRef.current.has(leftPlayerId)) {
          const playerName = getPlayerName(leftPlayerId);
          console.log(`🔴 [Presence] Игрок отключился: ${playerName} (${leftPlayerId})`);
          toast.warning(`${playerName} отключился от игры`);
          playPlayerLeaveSound();
        }
        
        setOnlinePlayers(prev => {
          const next = new Set(prev);
          leftPresences.forEach((p) => {
            const presence = p as unknown as PresenceState;
            const id = presence?.playerId;
            if (id) {
              next.delete(id);
              previousOnlineRef.current.delete(id);
            }
          });
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            playerId: localPlayerId,
            playerName: getPlayerName(localPlayerId),
            lastSeen: Date.now(),
          });
        }
      });

    setChannel(presenceChannel);

    // Периодический heartbeat для поддержания соединения
    const heartbeat = setInterval(async () => {
      if (presenceChannel) {
        await presenceChannel.track({
          playerId: localPlayerId,
          playerName: getPlayerName(localPlayerId),
          lastSeen: Date.now(),
        });
      }
    }, 30000); // Каждые 30 секунд

    return () => {
      clearInterval(heartbeat);
      isInitialSyncRef.current = true;
      previousOnlineRef.current = new Set();
      supabase.removeChannel(presenceChannel);
    };
  }, [roomId, localPlayerId, updateOnlinePlayers, getPlayerName]);

  const isPlayerOnline = useCallback((playerId: string): boolean => {
    return onlinePlayers.has(playerId);
  }, [onlinePlayers]);

  return {
    onlinePlayers,
    isPlayerOnline,
    onlineCount: onlinePlayers.size,
  };
};
