import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayer, useRoomSubscription } from '@/hooks/useMultiplayer';
import { usePresence } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { AuthControls } from '@/components/auth/AuthControls';
import { Copy, Users, Crown, Check, Wifi, WifiOff, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
const WaitingRoom = () => {
  const navigate = useNavigate();
  const { currentRoom, localPlayerId, leaveRoom, initializeGame, setCurrentRoom } = useGameStore();
  const { startGame: startGameInDb, leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const { profile, uploadAvatar } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Отслеживание онлайн-статуса игроков
  const { isPlayerOnline } = usePresence(currentRoom?.id || null);

  // Подписка на realtime обновления комнаты
  useRoomSubscription(currentRoom?.id || null);

  // Редирект если игра началась
  useEffect(() => {
    if (currentRoom?.status === 'playing') {
      initializeGame();
      navigate('/game');
    }
  }, [currentRoom?.status, navigate, initializeGame]);

  // Redirect if no room
  useEffect(() => {
    if (!currentRoom) {
      navigate('/');
    }
  }, [currentRoom, navigate]);

  if (!currentRoom) {
    return null;
  }

  const isHost = currentRoom.hostId === localPlayerId;
  const canStart = currentRoom.players.length >= 2;
  const roomCode = currentRoom.code || currentRoom.id.toUpperCase().slice(0, 6);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    toast.success('Код комнаты скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    const success = await startGameInDb(currentRoom.id);
    if (success) {
      initializeGame();
      navigate('/game');
    }
    setIsStarting(false);
  };

  const handleLeave = async () => {
    await leaveRoomFromDb(currentRoom.id);
    leaveRoom();
    navigate('/');
  };

  const playerColors: Record<string, string> = {
    red: 'bg-player-red',
    blue: 'bg-player-blue',
    green: 'bg-player-green',
    yellow: 'bg-player-yellow',
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRoom || !localPlayerId) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Файл слишком большой (макс. 2MB)');
      return;
    }

    setUploadingAvatar(true);
    try {
      const { error, url } = await uploadAvatar(file);
      
      if (error || !url) {
        toast.error('Ошибка загрузки аватара');
        return;
      }

      // Обновляем avatar_url в room_players
      const { error: updateError } = await supabase
        .from('room_players')
        .update({ avatar_url: url })
        .eq('room_id', currentRoom.id)
        .eq('player_id', localPlayerId);

      if (updateError) {
        console.error('Error updating room player avatar:', updateError);
      }

      // Обновляем локальное состояние
      setCurrentRoom({
        ...currentRoom,
        players: currentRoom.players.map(p => 
          p.id === localPlayerId ? { ...p, avatarUrl: url } : p
        ),
      });

      toast.success('Аватар обновлён');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
        <AuthControls />
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
                    {/* Player color / avatar */}
                    <div className="relative">
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt=""
                          className={`w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ${
                            player.color === 'red' ? 'ring-player-red' :
                            player.color === 'blue' ? 'ring-player-blue' :
                            player.color === 'green' ? 'ring-player-green' :
                            'ring-player-yellow'
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full ${playerColors[player.color]} flex items-center justify-center`}
                        >
                          <span className="text-white font-bold text-lg">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Кнопка смены аватара для локального игрока */}
                      {player.id === localPlayerId && (
                        <>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="absolute -bottom-1 -right-1 p-1 bg-amber-700 text-white rounded-full hover:bg-amber-800 disabled:opacity-50"
                            title="Изменить аватар"
                          >
                            {uploadingAvatar ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Camera className="h-3 w-3" />
                            )}
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </>
                      )}
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
                      </div>
                      <span className="text-sm text-muted-foreground capitalize">
                        {player.color === 'red' && '🔴 Красный'}
                        {player.color === 'blue' && '🔵 Синий'}
                        {player.color === 'green' && '🟢 Зелёный'}
                        {player.color === 'yellow' && '🟡 Жёлтый'}
                      </span>
                    </div>

                    {/* Online status */}
                    <div className="flex items-center gap-2">
                      {isPlayerOnline(player.id) ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <Wifi className="w-4 h-4" />
                          <span className="text-xs">Онлайн</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <WifiOff className="w-4 h-4" />
                          <span className="text-xs">Оффлайн</span>
                        </span>
                      )}
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
                <button
                  className="btn-gold w-full rounded-lg py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleStartGame}
                  disabled={!canStart || isStarting}
                >
                  {isStarting ? '⏳ Запуск...' : canStart ? '🎮 Начать игру' : `Ожидание игроков (минимум 2)`}
                </button>
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
            <p className="mt-1">Другие игроки могут присоединиться по коду комнаты</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitingRoom;
