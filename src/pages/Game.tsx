import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { GameSyncProvider, useGameSyncContext } from '@/contexts/gameSyncContext';
import { AssetPreloader } from '@/components/game/AssetPreloader';

// Внутренний компонент с доступом к контексту синхронизации
const GameInner: React.FC<{
  isRecovering: boolean;
  hasSession: boolean;
  onRetryRecovery: () => Promise<boolean>;
}> = ({ isRecovering, hasSession, onRetryRecovery }) => {
  const navigate = useNavigate();
  const { currentRoom, gameState, leaveRoom, localPlayerId } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const isExitingRef = useRef(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const hasTriedDbRecoveryRef = useRef(false);

  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

  // Доступ к контексту синхронизации
  const { requestSync, isHost, restoreFromDb } = useGameSyncContext();

  const handleExitToHome = useCallback(async () => {
    isExitingRef.current = true;
    navigate('/?noRecover=1');
    if (roomId) {
      void leaveRoomFromDb(roomId);
    }
    leaveRoom();
  }, [navigate, roomId, leaveRoomFromDb, leaveRoom]);

  const handleRequestSync = useCallback(() => {
    if (!roomId || isHost) return;
    setRetryCount(prev => prev + 1);
    requestSync();
  }, [roomId, isHost, requestSync]);

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

  // Следим за online/offline чтобы UI мог предложить переподключение без refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Редирект при отсутствии комнаты
  useEffect(() => {
    if (isRecovering) return;

    if (!currentRoom) {
      // Если есть сохранённая сессия — остаёмся на /game и даём кнопку переподключения
      if (hasSession) return;
      if (isExitingRef.current) return;
      navigate('/');
      return;
    }

    if (currentRoom.status === 'waiting') {
      navigate('/waiting');
      return;
    }
  }, [currentRoom, navigate, isRecovering, hasSession]);

  // Определяем состояния для оверлеев
  const showRecoveringOverlay = isRecovering || isLoadingFromDb;
  const showSessionReconnectOverlay = !showRecoveringOverlay && !currentRoom && hasSession;
  const showWaitingForStateOverlay = !showRecoveringOverlay && !!currentRoom && !gameState;
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

      {/* Оверлей переподключения (когда есть сохранённая сессия, но комнаты ещё нет в store) */}
      {showSessionReconnectOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-50">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">🚂</div>
            <p className="font-display text-lg text-foreground">Возвращаемся в игру…</p>
            <p className="text-sm text-muted-foreground mt-2">
              {isOnline
                ? 'Нажмите кнопку, чтобы переподключиться к последней комнате.'
                : 'Нет интернета. Как появится связь — нажмите «Повторить подключение».'}
            </p>

            <div className="flex flex-col gap-3 mt-6">
              <button
                className="btn-vintage rounded-lg px-6 py-3 disabled:opacity-50"
                disabled={!isOnline}
                onClick={() => {
                  void onRetryRecovery();
                }}
              >
                🔄 Повторить подключение
              </button>
              <button className="btn-vintage rounded-lg px-6 py-3" onClick={handleExitToHome}>
                ← На главную
              </button>
            </div>
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

// Обёртка для recovery — вызывается ДО провайдера для стабильности хуков
const GameWithRecovery = () => {
  const { currentRoom } = useGameStore();
  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

  const { isRecovering, attemptRecovery, hasSession } = useSessionRecovery();

  return (
    <GameSyncProvider roomId={roomId}>
      <GameInner isRecovering={isRecovering} hasSession={hasSession} onRetryRecovery={attemptRecovery} />
    </GameSyncProvider>
  );
};

const Game = () => {
  return (
    <AssetPreloader>
      <GameWithRecovery />
    </AssetPreloader>
  );
};

export default Game;
