import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { Input } from '@/components/ui/input';
import { RulesModal } from '@/components/game/RulesModal';

const Index = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom, isLoading, isReady } = useMultiplayer();
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Показываем загрузку пока аутентификация не завершена
  if (!isReady) {
    return (
      <div className="min-h-screen parchment flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🚂</div>
          <p className="font-display text-lg text-muted-foreground">Подключение к серверу...</p>
        </div>
      </div>
    );
  }

  const handleCreateGame = async () => {
    if (playerName.trim() && roomName.trim()) {
      const result = await createRoom(roomName.trim(), playerName.trim());
      if (result) {
        navigate('/waiting');
      }
    }
  };

  const handleJoinGame = async () => {
    if (playerName.trim() && joinCode.trim()) {
      const result = await joinRoom(joinCode.trim(), playerName.trim());
      if (result) {
        navigate('/waiting');
      }
    }
  };

  return (
    <div className="min-h-screen parchment flex flex-col">
      {/* Header */}
      <header className="py-6 text-center border-b-4 border-ornament bg-primary">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground text-shadow-vintage">
          🚂 Железнодорожное Приключение
        </h1>
        <p className="font-display text-xl text-gold mt-2">ЕВРОПА</p>
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
                  disabled={!playerName.trim() || !roomName.trim() || isLoading}
                >
                  {isLoading ? '⏳ Создание...' : '✓ Создать комнату'}
                </button>

                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowCreate(false)}
                  disabled={isLoading}
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
                    maxLength={6}
                  />
                </div>

                <button
                  className="btn-gold w-full rounded-lg py-3"
                  onClick={handleJoinGame}
                  disabled={!playerName.trim() || !joinCode.trim() || isLoading}
                >
                  {isLoading ? '⏳ Присоединение...' : '🚂 Присоединиться'}
                </button>

                <button
                  className="btn-vintage w-full rounded-lg"
                  onClick={() => setShowJoin(false)}
                  disabled={isLoading}
                >
                  ← Назад
                </button>
              </div>
            )}
          </div>

          {/* Game info and rules */}
          <div className="mt-8 text-center space-y-4">
            <div className="inline-flex gap-6 text-sm text-muted-foreground">
              <span>👥 2-4 игрока</span>
              <span>⏱️ 30-60 мин</span>
              <span>🎯 46 городов</span>
            </div>
            
            <div>
              <RulesModal />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-ornament space-y-1">
        <p>Создатель: <strong>Симинеев Тимур</strong></p>
        <p className="text-xs opacity-75">Вдохновлено настольной игрой Ticket to Ride: Europe</p>
      </footer>
    </div>
  );
};

export default Index;
