import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom, currentRoom } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const handleCreateGame = () => {
    if (playerName.trim() && roomName.trim()) {
      createRoom(roomName.trim(), playerName.trim());
      navigate('/waiting');
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && joinCode.trim()) {
      joinRoom(joinCode.trim().toLowerCase(), playerName.trim());
      navigate('/waiting');
    }
  };

  const handleQuickStart = () => {
    const name = playerName.trim() || 'Игрок';
    createRoom('Быстрая игра', name);
    navigate('/waiting');
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

            {!showCreate && !showJoin ? (
              <div className="space-y-4">
                <button
                  className="btn-gold w-full rounded-lg py-4 text-lg"
                  onClick={() => setShowCreate(true)}
                >
                  ➕ Создать комнату
                </button>
                
                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowJoin(true)}
                >
                  🔗 Присоединиться по коду
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ornament" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">или</span>
                  </div>
                </div>

                <button
                  className="w-full rounded-lg py-3 border-2 border-ornament text-foreground hover:bg-muted transition-colors"
                  onClick={handleQuickStart}
                >
                  🎮 Быстрая игра (с ботом)
                </button>

                <div className="text-center text-sm text-muted-foreground mt-6">
                  <p>Онлайн-версия настольной игры</p>
                  <p className="mt-1">Постройте железнодорожную империю в Европе!</p>
                </div>
              </div>
            ) : showCreate ? (
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
                  ✓ Создать комнату
                </button>

                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowCreate(false)}
                >
                  ← Назад
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-display text-sm font-semibold mb-2 text-foreground">
                    Код комнаты
                  </label>
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Введите код..."
                    className="w-full bg-background border-ornament font-mono text-center text-lg tracking-widest"
                    maxLength={7}
                  />
                </div>

                <button
                  className="btn-gold w-full rounded-lg py-3"
                  onClick={handleJoinGame}
                  disabled={!playerName.trim() || !joinCode.trim()}
                >
                  🚂 Присоединиться
                </button>

                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowJoin(false)}
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
