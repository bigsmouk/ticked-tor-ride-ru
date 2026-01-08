import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';

const Game = () => {
  const navigate = useNavigate();
  const { currentRoom, gameState, startGame, localPlayerId } = useGameStore();

  useEffect(() => {
    if (!currentRoom) {
      navigate('/');
      return;
    }
    // Auto-start if room exists but game hasn't started
    if (currentRoom && !gameState) {
      startGame();
    }
  }, [currentRoom, gameState, navigate, startGame]);

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
