import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { GameSyncProvider, useGameSyncContext } from '@/contexts/gameSyncContext';
import { AssetPreloader } from '@/components/game/AssetPreloader';

const GameInner = () => {
  const navigate = useNavigate();
  const { currentRoom, gameState, leaveRoom, localPlayerId } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const { isRecovering } = useSessionRecovery();
  const isExitingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
  const hasTriedDbRecoveryRef = useRef(false);

  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

  // Доступ к одному общему каналу синхронизации (включая экран загрузки)
  const { requestSync, isHost, restoreFromDb } = useGameSyncContext();

  const handleExitToHome = useCallback(async () => {
    isExitingRef.current = true;

    // Уходим на главную с флагом, чтобы авто-восстановление не зацикливало пользователя
    navigate('/?noRecover=1');

    // Чистим локальное состояние/сессию и (по возможности) выходим из комнаты в базе
    if (roomId) {
      void leaveRoomFromDb(roomId);
    }
    leaveRoom();
  }, [navigate, roomId, leaveRoomFromDb, leaveRoom]);

  // Ручной запрос состояния (без создания временных каналов)
  const handleRequestSync = useCallback(() => {
    if (!roomId || isHost) return;
    setRetryCount(prev => prev + 1);
    requestSync();
  }, [roomId, isHost, requestSync]);

  // Попытка восстановить из БД (для хоста)
  const handleRestoreFromDb = useCallback(async () => {
    if (!roomId) return;
    setIsLoadingFromDb(true);
    const success = await restoreFromDb();
    setIsLoadingFromDb(false);
    if (!success) {
      console.log('[Game] Failed to restore from DB');
    }
  }, [roomId, restoreFromDb]);

  // Автоматическое восстановление из БД для хоста
  useEffect(() => {
    if (isHost && !gameState && roomId && !hasTriedDbRecoveryRef.current && !isRecovering) {
      hasTriedDbRecoveryRef.current = true;
      handleRestoreFromDb();
    }
  }, [isHost, gameState, roomId, isRecovering, handleRestoreFromDb]);

  useEffect(() => {
    // Если идёт восстановление — ждём
    if (isRecovering) return;

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
  }, [currentRoom, navigate, isRecovering]);

  // Определяем состояния для оверлеев
  const showRecoveringOverlay = isRecovering || isLoadingFromDb;
  const showWaitingForStateOverlay = !showRecoveringOverlay && !gameState;
  const showGameBoard = !showRecoveringOverlay && !!gameState;

  return (
    <div className="min-h-screen parchment relative">
      {/* Всегда рендерим GameBoard, но скрываем если нет состояния */}
      <div className={showGameBoard ? 'block' : 'hidden'}>
        <GameBoard />
      </div>

      {/* Оверлей восстановления сессии */}
      {showRecoveringOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
          <div className="text-center max-w-md">
            <div className="animate-spin text-4xl mb-4">🚂</div>
            <p className="font-display text-lg text-foreground">
              {isLoadingFromDb ? 'Загрузка из базы данных...' : 'Восстановление сессии...'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Подключаемся к игре...
            </p>
          </div>
        </div>
      )}

      {/* Оверлей ожидания состояния от хоста */}
      {showWaitingForStateOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
          <div className="text-center max-w-md">
            <div className="animate-spin text-4xl mb-4">🚂</div>
            <p className="font-display text-lg text-foreground">Загрузка игры...</p>
            <p className="text-sm text-muted-foreground mt-2">
              {isHost
                ? 'Состояние игры не найдено в базе данных.'
                : 'Ждём состояние от хоста...'}
            </p>

            <div className="flex flex-col gap-3 mt-6">
              {isHost ? (
                <button
                  className="btn-vintage rounded-lg px-6 py-3"
                  onClick={handleRestoreFromDb}
                >
                  🔄 Попробовать загрузить из БД
                </button>
              ) : (
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
      )}
    </div>
  );
};

const Game = () => {
  const { currentRoom } = useGameStore();
  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

  return (
    <AssetPreloader>
      <GameSyncProvider roomId={roomId}>
        <GameInner />
      </GameSyncProvider>
    </AssetPreloader>
  );
};

export default Game;
