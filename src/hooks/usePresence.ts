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

// Задержка перед уведомлением о выходе (чтобы избежать ложных срабатываний)
const LEAVE_DEBOUNCE_MS = 3000;

export const usePresence = (roomId: string | null) => {
  const { localPlayerId, currentRoom } = useGameStore();
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  // Храним предыдущее состояние для сравнения (чтобы не дублировать уведомления)
  const previousOnlineRef = useRef<Set<string>>(new Set());
  const isInitialSyncRef = useRef(true);
  // Таймеры для debounce выхода игроков
  const leaveTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // Флаг, что мы уже подписались
  const isSubscribedRef = useRef(false);

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
        
        // Отменяем таймер выхода, если игрок вернулся
        const leaveTimer = leaveTimersRef.current.get(joinedPlayerId);
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimersRef.current.delete(joinedPlayerId);
          console.log(`🔄 [Presence] Игрок быстро вернулся, отмена уведомления о выходе: ${joinedPlayerId}`);
        }
        
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
        
        // Не обрабатываем свой выход
        if (leftPlayerId === localPlayerId) return;
        
        // Debounce: ждём перед уведомлением о выходе
        // Это предотвращает ложные срабатывания при кратковременных обрывах
        if (!leaveTimersRef.current.has(leftPlayerId)) {
          console.log(`⏳ [Presence] Обнаружен выход игрока, ожидание подтверждения: ${leftPlayerId}`);
          
          const timer = setTimeout(() => {
            // Проверяем, что игрок действительно не вернулся
            const currentState = presenceChannel.presenceState<PresenceState>() || {};
            const stillOnline = Object.values(currentState).some((presences) =>
              presences.some((p) => p.playerId === leftPlayerId)
            );
            
            if (!stillOnline && previousOnlineRef.current.has(leftPlayerId)) {
              const playerName = getPlayerName(leftPlayerId);
              console.log(`🔴 [Presence] Игрок отключился (подтверждено): ${playerName} (${leftPlayerId})`);
              toast.warning(`${playerName} отключился от игры`);
              playPlayerLeaveSound();
              previousOnlineRef.current.delete(leftPlayerId);
            } else if (stillOnline) {
              console.log(`✅ [Presence] Ложное срабатывание, игрок всё ещё онлайн: ${leftPlayerId}`);
            }
            
            leaveTimersRef.current.delete(leftPlayerId);
          }, LEAVE_DEBOUNCE_MS);
          
          leaveTimersRef.current.set(leftPlayerId, timer);
        }
        
        setOnlinePlayers(prev => {
          const next = new Set(prev);
          leftPresences.forEach((p) => {
            const presence = p as unknown as PresenceState;
            const id = presence?.playerId;
            if (id) {
              next.delete(id);
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
      // Очищаем все pending таймеры выхода
      leaveTimersRef.current.forEach((timer) => clearTimeout(timer));
      leaveTimersRef.current.clear();
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
