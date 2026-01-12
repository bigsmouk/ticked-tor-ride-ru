import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useGameSync } from '@/hooks/useGameSync';
import { useMultiplayer } from '@/hooks/useMultiplayer';

const Game = () => {
  const navigate = useNavigate();
  const { currentRoom, gameState, leaveRoom } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const isExitingRef = useRef(false);

  // Запускаем синхронизацию состояния даже если gameState ещё не получен
  useGameSync(currentRoom?.id || null);

  const roomId = useMemo(() => currentRoom?.id || null, [currentRoom?.id]);

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
          <p className="text-sm text-muted-foreground mt-2">Ждём состояние от хоста. Если зависло — вернитесь на главную и зайдите снова.</p>

          <button className="btn-vintage mt-6 rounded-lg px-6 py-3" onClick={handleExitToHome}>
            ← На главную
          </button>
        </div>
      </div>
    );
  }

  return <GameBoard />;
};

export default Game;
