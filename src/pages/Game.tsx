import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useGameSync } from '@/hooks/useGameSync';

const Game = () => {
  const navigate = useNavigate();
  const { currentRoom, gameState } = useGameStore();

  // Синхронизация состояния игры между игроками
  useGameSync(currentRoom?.id || null);

  useEffect(() => {
    // Redirect if no room or game not started
    if (!currentRoom) {
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
