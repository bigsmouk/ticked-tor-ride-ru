import React, { createContext, useContext, useEffect, useCallback, useMemo } from "react";

import { useGameSync, ConnectionStatus, GameAction } from "@/hooks/useGameSync";
import { useGameStatePersistence } from "@/hooks/useGameStatePersistence";

export type GameSyncContextValue = ReturnType<typeof useGameSync> & {
  restoreFromDb: () => Promise<boolean>;
};

const GameSyncContext = createContext<GameSyncContextValue | null>(null);

// Статический fallback - избегаем создания новых объектов при каждом рендере
const noopAsync = async () => false;
const noop = () => {};

const defaultContextValue: GameSyncContextValue = {
  isHost: false,
  connectionStatus: 'disconnected' as ConnectionStatus,
  lastSyncTime: null,
  reconnectAttempt: 0,
  sendActionToHost: noop,
  requestSync: noop,
  attemptReconnect: noop,
  restoreFromDb: noopAsync,
};

export const GameSyncProvider: React.FC<{
  roomId: string | null;
  children: React.ReactNode;
}> = ({ roomId, children }) => {
  // Всегда вызываем оба хука - порядок хуков критичен!
  const syncValue = useGameSync(roomId);
  const { restoreFromDb } = useGameStatePersistence({ roomId, enabled: !!roomId });

  // При монтировании пытаемся восстановить состояние из БД (только для хоста)
  useEffect(() => {
    if (roomId && syncValue.isHost) {
      restoreFromDb().then((restored) => {
        if (restored) {
          console.log('[GameSyncProvider] Host restored state from DB');
        }
      });
    }
  }, [roomId, syncValue.isHost, restoreFromDb]);

  // Мемоизируем value чтобы избежать лишних ререндеров
  const value = useMemo<GameSyncContextValue>(() => ({
    ...syncValue,
    restoreFromDb,
  }), [syncValue, restoreFromDb]);

  return <GameSyncContext.Provider value={value}>{children}</GameSyncContext.Provider>;
};

// Безопасный хук — не выбрасывает ошибку, возвращает fallback значения
export const useGameSyncContext = (): GameSyncContextValue => {
  const ctx = useContext(GameSyncContext);
  // Возвращаем стабильный объект если контекст недоступен
  return ctx ?? defaultContextValue;
};

// Строгий хук — выбрасывает ошибку если вне провайдера
export const useGameSyncContextStrict = () => {
  const ctx = useContext(GameSyncContext);
  if (!ctx) {
    throw new Error("useGameSyncContextStrict must be used within <GameSyncProvider>.");
  }
  return ctx;
};
