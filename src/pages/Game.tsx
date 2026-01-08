import React, { useEffect } from 'react';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';

const Game = () => {
  const { gameState, initializeDemoGame } = useGameStore();

  useEffect(() => {
    // Initialize a demo game if no game state exists
    if (!gameState) {
      initializeDemoGame();
    }
  }, [gameState, initializeDemoGame]);

  if (!gameState) {
    return (
      <div className="min-h-screen parchment flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🚂</div>
          <p className="font-display text-lg text-foreground">Загрузка игры...</p>
        </div>
      </div>
    );
  }

  return <GameBoard />;
};

export default Game;
