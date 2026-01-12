import React, { createContext, useContext, useMemo } from "react";

import { useGameSync, ConnectionStatus, GameAction } from "@/hooks/useGameSync";

export type GameSyncContextValue = ReturnType<typeof useGameSync>;

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
};

export const GameSyncProvider: React.FC<{
  roomId: string | null;
  children: React.ReactNode;
}> = ({ roomId, children }) => {
  const value = useGameSync(roomId);
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
