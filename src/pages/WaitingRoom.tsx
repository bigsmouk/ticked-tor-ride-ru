import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { Copy, Users, Crown, Check } from 'lucide-react';
import { toast } from 'sonner';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const { currentRoom, localPlayerId, leaveRoom, startGame, addBotPlayer } = useGameStore();
  const [copied, setCopied] = useState(false);

  // Redirect if no room
  React.useEffect(() => {
    if (!currentRoom) {
      navigate('/');
    }
  }, [currentRoom, navigate]);

  if (!currentRoom) {
    return null;
  }

  const isHost = currentRoom.hostId === localPlayerId;
  const canStart = currentRoom.players.length >= 2;
  const roomCode = currentRoom.id.toUpperCase();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Код комнаты скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    startGame();
    navigate('/game');
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const handleAddBot = () => {
    if (currentRoom.players.length < 4) {
      addBotPlayer();
    }
  };

  const playerColors: Record<string, string> = {
    red: 'bg-player-red',
    blue: 'bg-player-blue',
    green: 'bg-player-green',
    yellow: 'bg-player-yellow',
  };

  return (
    <div className="min-h-screen parchment flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 border-b-4 border-ornament bg-primary flex items-center justify-between">
        <button
          onClick={handleLeave}
          className="btn-vintage px-4 py-2 rounded-lg text-sm"
        >
          ← Выйти
        </button>
        <h1 className="font-display text-2xl font-bold text-primary-foreground">
          🚂 Комната ожидания
        </h1>
        <div className="w-24" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Room info card */}
          <div className="ornate-frame bg-card rounded-lg p-8 mb-6">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                {currentRoom.name}
              </h2>
              
              {/* Room code */}
              <div className="inline-flex items-center gap-3 bg-muted px-6 py-3 rounded-lg mt-4">
                <span className="text-sm text-muted-foreground">Код комнаты:</span>
                <span className="font-mono text-xl font-bold text-primary tracking-widest">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-background rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-3">
                Поделитесь этим кодом с друзьями для присоединения
              </p>
            </div>

            {/* Players list */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Игроки ({currentRoom.players.length}/4)
                </h3>
              </div>

              <div className="grid gap-3">
                {currentRoom.players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                      player.id === localPlayerId
                        ? 'border-primary bg-primary/5'
                        : 'border-ornament bg-background'
                    }`}
                  >
                    {/* Player color */}
                    <div
                      className={`w-10 h-10 rounded-full ${playerColors[player.color]} flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Player info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-foreground">
                          {player.name}
                        </span>
                        {currentRoom.hostId === player.id && (
                          <Crown className="w-4 h-4 text-gold" />
                        )}
                        {player.id === localPlayerId && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            Вы
                          </span>
                        )}
                        {player.isBot && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                            Бот
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground capitalize">
                        {player.color === 'red' && '🔴 Красный'}
                        {player.color === 'blue' && '🔵 Синий'}
                        {player.color === 'green' && '🟢 Зелёный'}
                        {player.color === 'yellow' && '🟡 Жёлтый'}
                      </span>
                    </div>

                    {/* Ready status */}
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Готов
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: 4 - currentRoom.players.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-muted bg-muted/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-lg">?</span>
                    </div>
                    <span className="text-muted-foreground">Ожидание игрока...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {isHost ? (
                <>
                  <button
                    className="btn-gold w-full rounded-lg py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleStartGame}
                    disabled={!canStart}
                  >
                    {canStart ? '🎮 Начать игру' : `Ожидание игроков (минимум 2)`}
                  </button>
                  
                  {currentRoom.players.length < 4 && (
                    <button
                      className="btn-vintage w-full rounded-lg"
                      onClick={handleAddBot}
                    >
                      🤖 Добавить бота
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-lg text-muted-foreground">
                    Ожидание начала игры от хоста...
                  </p>
                  <div className="animate-pulse mt-2">🚂</div>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="text-center text-sm text-muted-foreground">
            <p>💡 Для игры нужно от 2 до 4 игроков</p>
            <p className="mt-1">Хост может добавить ботов для заполнения мест</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitingRoom;
