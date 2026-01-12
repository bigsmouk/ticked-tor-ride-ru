import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { GameSyncProvider, useGameSyncContext } from '@/contexts/gameSyncContext';

const GameInner = () => {
  const navigate = useNavigate();
  const { currentRoom, gameState, leaveRoom, localPlayerId } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const isExitingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

  // Доступ к одному общему каналу синхронизации (включая экран загрузки)
  const { requestSync, isHost } = useGameSyncContext();

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

  // Ручной запрос состояния (без создания временных каналов)
  const handleRequestSync = useCallback(() => {
    if (!roomId || isHost) return;
    setRetryCount(prev => prev + 1);
    requestSync();
  }, [roomId, isHost, requestSync]);

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
                onClick={handleRequestSync}
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

const Game = () => {
  const { currentRoom } = useGameStore();
  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

  return (
    <GameSyncProvider roomId={roomId}>
      <GameInner />
    </GameSyncProvider>
  );
};

export default Game;
