import React, { createContext, useContext, useEffect } from "react";

import { useGameSync, ConnectionStatus, GameAction } from "@/hooks/useGameSync";
import { useGameStatePersistence } from "@/hooks/useGameStatePersistence";

export type GameSyncContextValue = ReturnType<typeof useGameSync> & {
  restoreFromDb: () => Promise<boolean>;
};

const GameSyncContext = createContext<GameSyncContextValue | null>(null);

// Дефолтные значения для случая когда контекст недоступен
const defaultContextValue: GameSyncContextValue = {
  isHost: false,
  connectionStatus: 'disconnected' as ConnectionStatus,
  lastSyncTime: null,
  reconnectAttempt: 0,
  sendActionToHost: () => {},
  requestSync: () => {},
  attemptReconnect: () => {},
  restoreFromDb: async () => false,
};

export const GameSyncProvider: React.FC<{
  roomId: string | null;
  children: React.ReactNode;
}> = ({ roomId, children }) => {
  const syncValue = useGameSync(roomId);
  const { restoreFromDb } = useGameStatePersistence({ roomId, enabled: !!roomId });

  // При монтировании пытаемся восстановить состояние из БД
  useEffect(() => {
    if (roomId && syncValue.isHost) {
      // Хост пытается восстановить состояние из БД при загрузке
      restoreFromDb().then((restored) => {
        if (restored) {
          console.log('[GameSyncProvider] Host restored state from DB');
        }
      });
    }
  }, [roomId, syncValue.isHost, restoreFromDb]);

  const value: GameSyncContextValue = {
    ...syncValue,
    restoreFromDb,
  };

  return <GameSyncContext.Provider value={value}>{children}</GameSyncContext.Provider>;
};

// Безопасный хук — не выбрасывает ошибку, возвращает fallback значения
export const useGameSyncContext = (): GameSyncContextValue => {
  const ctx = useContext(GameSyncContext);
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
