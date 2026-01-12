import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  playerId: string;
  playerName: string;
  lastSeen: number;
}

export const usePresence = (roomId: string | null) => {
  const { localPlayerId } = useGameStore();
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

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
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] Player joined:', key, newPresences);
        setOnlinePlayers(prev => {
          const next = new Set(prev);
          newPresences.forEach((p) => {
            if (p.playerId) next.add(p.playerId as string);
          });
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] Player left:', key, leftPresences);
        setOnlinePlayers(prev => {
          const next = new Set(prev);
          leftPresences.forEach((p) => {
            if (p.playerId) next.delete(p.playerId as string);
          });
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            playerId: localPlayerId,
            playerName: '', // Имя можно получить из store при необходимости
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
          playerName: '',
          lastSeen: Date.now(),
        });
      }
    }, 30000); // Каждые 30 секунд

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(presenceChannel);
    };
  }, [roomId, localPlayerId, updateOnlinePlayers]);

  const isPlayerOnline = useCallback((playerId: string): boolean => {
    return onlinePlayers.has(playerId);
  }, [onlinePlayers]);

  return {
    onlinePlayers,
    isPlayerOnline,
    onlineCount: onlinePlayers.size,
  };
};
