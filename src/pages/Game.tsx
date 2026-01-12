import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useGameSync } from '@/hooks/useGameSync';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { supabase } from '@/integrations/supabase/client';

const Game = () => {
  const navigate = useNavigate();
  const { currentRoom, gameState, leaveRoom, localPlayerId } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const isExitingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  // Запускаем синхронизацию состояния даже если gameState ещё не получен
  useGameSync(currentRoom?.id || null);

  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);
  const isHost = currentRoom?.hostId === localPlayerId;

  const handleExitToHome = async () => {
    isExitingRef.current = true;

    // Уходим на главную с флагом, чтобы авто-восстановление не зацикливало пользователя
    navigate('/?noRecover=1');

    // Чистим локальное состояние/сессию и (по возможности) выходим из комнаты в базе
    if (roomId) {
      void leaveRoomFromDb(roomId);
    }
    leaveRoom();
  };

  // Функция для запроса состояния у хоста
  const requestSync = useCallback(async () => {
    if (!roomId || !localPlayerId || isHost) return;
    
    console.log('[Game] Manually requesting sync from host');
    setRetryCount(prev => prev + 1);
    
    // Получаем существующий канал или создаём временный для отправки запроса
    const channel = supabase.channel(`game-sync-${roomId}`, {
      config: {
        broadcast: { self: false },
      },
    });
    
    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'request_sync',
          payload: { playerId: localPlayerId },
        });
        // Закрываем временный канал через небольшую задержку
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 1000);
      }
    });
  }, [roomId, localPlayerId, isHost]);

  useEffect(() => {
    // Redirect if no room or game not started
    if (!currentRoom) {
      if (isExitingRef.current) return;
      navigate('/');
      return;
    }
    if (currentRoom.status === 'waiting') {
      navigate('/waiting');
      return;
    }
  }, [currentRoom, navigate]);

  if (!gameState) {
    return (
      <div className="min-h-screen parchment flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin text-4xl mb-4">🚂</div>
          <p className="font-display text-lg text-foreground">Загрузка игры...</p>
          <p className="text-sm text-muted-foreground mt-2">
            {isHost 
              ? 'Состояние игры не найдено. Попробуйте перезагрузить страницу.'
              : 'Ждём состояние от хоста...'}
          </p>

          <div className="flex flex-col gap-3 mt-6">
            {!isHost && (
              <button 
                className="btn-vintage rounded-lg px-6 py-3" 
                onClick={requestSync}
              >
                🔄 Запросить состояние {retryCount > 0 ? `(${retryCount})` : ''}
              </button>
            )}
            <button className="btn-vintage rounded-lg px-6 py-3" onClick={handleExitToHome}>
              ← На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <GameBoard />;
};

export default Game;
