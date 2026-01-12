import React, { createContext, useContext } from "react";

import { useGameSync } from "@/hooks/useGameSync";

export type GameSyncContextValue = ReturnType<typeof useGameSync>;

const GameSyncContext = createContext<GameSyncContextValue | null>(null);

export const GameSyncProvider: React.FC<{
  roomId: string | null;
  children: React.ReactNode;
}> = ({ roomId, children }) => {
  const value = useGameSync(roomId);
  return <GameSyncContext.Provider value={value}>{children}</GameSyncContext.Provider>;
};

export const useGameSyncContext = () => {
  const ctx = useContext(GameSyncContext);
  if (!ctx) {
    throw new Error("useGameSyncContext must be used within <GameSyncProvider>.");
  }
  return ctx;
};
