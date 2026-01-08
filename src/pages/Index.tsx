import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  const navigate = useNavigate();
  const { createRoom, startGame, currentRoom } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleCreateGame = () => {
    if (playerName.trim() && roomName.trim()) {
      createRoom(roomName.trim(), playerName.trim());
      navigate('/game');
    }
  };

  const handleQuickStart = () => {
    const name = playerName.trim() || 'Игрок';
    createRoom('Быстрая игра', name);
    // Add a bot for testing
    navigate('/game');
  };

  return (
    <div className="min-h-screen parchment flex flex-col">
      {/* Header */}
      <header className="py-6 text-center border-b-4 border-ornament bg-primary">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground text-shadow-vintage">
          🚂 Ticket to Ride
        </h1>
        <p className="font-display text-xl text-gold mt-2">EUROPE</p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <div className="ornate-frame bg-card rounded-lg p-8">
            <h2 className="font-display text-2xl font-bold text-center mb-6 text-foreground">
              Добро пожаловать!
            </h2>

            {/* Player name input */}
            <div className="mb-6">
              <label className="block font-display text-sm font-semibold mb-2 text-foreground">
                Ваше имя
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите имя..."
                className="w-full bg-background border-ornament"
              />
            </div>

            {!showCreate ? (
              <div className="space-y-4">
                <button
                  className="btn-gold w-full rounded-lg py-4 text-lg"
                  onClick={handleQuickStart}
                >
                  🎮 Быстрый старт
                </button>
                
                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowCreate(true)}
                >
                  ➕ Создать комнату
                </button>

                <div className="text-center text-sm text-muted-foreground mt-6">
                  <p>Онлайн-версия настольной игры</p>
                  <p className="mt-1">Постройте железнодорожную империю в Европе!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-display text-sm font-semibold mb-2 text-foreground">
                    Название комнаты
                  </label>
                  <Input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Моя игра..."
                    className="w-full bg-background border-ornament"
                  />
                </div>

                <button
                  className="btn-gold w-full rounded-lg py-3"
                  onClick={handleCreateGame}
                  disabled={!playerName.trim() || !roomName.trim()}
                >
                  ✓ Создать игру
                </button>

                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowCreate(false)}
                >
                  ← Назад
                </button>
              </div>
            )}
          </div>

          {/* Game rules preview */}
          <div className="mt-8 text-center">
            <div className="inline-flex gap-6 text-sm text-muted-foreground">
              <span>👥 2-4 игрока</span>
              <span>⏱️ 30-60 мин</span>
              <span>🎯 46 городов</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-ornament">
        <p>Основано на настольной игре Ticket to Ride: Europe</p>
      </footer>
    </div>
  );
};

export default Index;
