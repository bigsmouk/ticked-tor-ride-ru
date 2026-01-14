import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { useAuth } from '@/hooks/useAuth';
import { AuthControls } from '@/components/auth/AuthControls';
import { Input } from '@/components/ui/input';
import { RulesModal } from '@/components/game/RulesModal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Users, Lock, Globe, Train, Send } from 'lucide-react';
import AnimatedTrainBackground from '@/components/home/AnimatedTrainBackground';
import ActiveGamesCounter from '@/components/home/ActiveGamesCounter';
import { toast } from 'sonner';

interface PublicRoom {
  id: string;
  code: string;
  name: string;
  hostId: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: Date;
}

const Index = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom, joinRoomById, fetchPublicRooms, startSoloGame, isLoading, isReady } = useMultiplayer();
  const { profile, user } = useAuth();
  const {
    isRecovering,
    showRecoveryPrompt,
    savedSessionData,
    attemptRecovery,
    dismissRecovery,
  } = useSessionRecovery();
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Устанавливаем имя из профиля при авторизации
  useEffect(() => {
    if (profile && !playerName) {
      setPlayerName(profile.display_name);
    }
  }, [profile, playerName]);

  // Показываем загрузку пока идёт восстановление сессии
  if (isRecovering) {
    return (
      <div className="min-h-screen parchment flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🚂</div>
          <p className="font-display text-lg text-muted-foreground">Восстановление сессии...</p>
        </div>
      </div>
    );
  }

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

  // Показываем prompt для восстановления сессии
  if (showRecoveryPrompt && savedSessionData) {
    return (
      <div className="min-h-screen parchment flex flex-col">
        {/* Header */}
        <header className="py-6 text-center border-b-4 border-ornament bg-primary">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground text-shadow-vintage">
            🚂 Железнодорожное Приключение
          </h1>
          <p className="font-display text-xl text-gold mt-2">ЕВРОПА</p>
        </header>

        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="ornate-frame bg-card rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="font-display text-2xl font-bold mb-2 text-foreground">
                У вас есть активная игра
              </h2>
              <p className="text-muted-foreground mb-2">
                Игрок: <strong className="text-foreground">{savedSessionData.playerName}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Код комнаты: <span className="font-mono text-primary">{savedSessionData.roomCode}</span>
              </p>

              <div className="space-y-3">
                <button
                  className="btn-gold w-full rounded-lg py-4 text-lg"
                  onClick={attemptRecovery}
                >
                  🚂 Вернуться в игру
                </button>
                <button
                  className="btn-vintage w-full rounded-lg py-3"
                  onClick={dismissRecovery}
                >
                  🏠 Остаться на главной
                </button>
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
  }

  const loadPublicRooms = async () => {
    if (!user) return;
    setLoadingRooms(true);
    const rooms = await fetchPublicRooms();
    setPublicRooms(rooms);
    setLoadingRooms(false);
  };

  // Автоматическая очистка пустых комнат каждые 5 минут
  useEffect(() => {
    const cleanupRooms = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('cleanup-rooms');
        if (data?.deleted > 0) {
          console.log(`[Cleanup] Deleted ${data.deleted} rooms:`, data.details);
        }
      } catch (err) {
        // Тихо игнорируем ошибки cleanup
        console.error('[Cleanup] Error:', err);
      }
    };

    // Запускаем сразу при загрузке страницы
    cleanupRooms();

    // Затем каждые 5 минут
    const interval = setInterval(cleanupRooms, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Загружаем открытые комнаты при входе на страницу + realtime подписка
  useEffect(() => {
    if (!user || showCreate || showJoin) return;
    
    // Начальная загрузка
    loadPublicRooms();

    // Подписка на изменения в таблице rooms
    const channel = supabase
      .channel('public-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: 'is_private=eq.false',
        },
        () => {
          // Обновляем список при любых изменениях
          loadPublicRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
        },
        () => {
          // Обновляем список при изменении игроков
          loadPublicRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showCreate, showJoin]);

  const handleCreateGame = async () => {
    if (playerName.trim() && roomName.trim()) {
      const result = await createRoom(roomName.trim(), playerName.trim(), isPrivate);
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

  const handleJoinPublicRoom = async (roomId: string) => {
    if (!playerName.trim()) {
      return;
    }
    const result = await joinRoomById(roomId, playerName.trim());
    if (result) {
      navigate('/waiting');
    }
  };

  return (
    <div className="h-screen parchment flex flex-col relative overflow-hidden">
      {/* Background */}
      <AnimatedTrainBackground />
      
      {/* Header - Retro poster style */}
      <header className="retro-header py-4 md:py-6 text-center relative z-10 flex-shrink-0 animate-fade-in">
        {/* Auth controls */}
        <AuthControls className="absolute right-4 top-1/2 -translate-y-1/2" />
        
        {/* Decorative train icon */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:block animate-scale-in">
          <Train className="h-10 w-10 text-gold opacity-80" />
        </div>

        <h1 className="vintage-title text-2xl md:text-4xl font-bold text-primary-foreground">
          Железнодорожное Приключение
        </h1>
        <p className="vintage-subtitle text-lg md:text-xl mt-1 font-bold">
          ЕВРОПА
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative z-10 overflow-y-auto min-h-0">
        {/* Active games counter */}
        <div className="mb-3 animate-fade-in flex-shrink-0">
          <ActiveGamesCounter />
        </div>
        
        <div className="max-w-lg w-full flex-shrink-0 animate-scale-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <div className="vintage-card rounded-xl p-5 md:p-6">
            {/* Welcome text */}
            <div className="text-center mb-4">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Добро пожаловать!
              </h2>
              <div className="ornate-divider my-2"></div>
            </div>

            {/* Player name input */}
            <div className="mb-4">
              <label className="block font-display text-sm font-semibold mb-1 text-foreground">
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
              <div className="space-y-3">
                <button
                  className="btn-gold w-full rounded-lg py-3 text-base hover-scale"
                  onClick={() => setShowCreate(true)}
                >
                  ➕ Создать комнату
                </button>
                
                <button
                  className="btn-vintage w-full rounded-lg py-2 hover-scale"
                  onClick={() => setShowJoin(true)}
                >
                  🔗 Присоединиться по коду
                </button>

                {/* Соло-режим */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ornament/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">или</span>
                  </div>
                </div>

                <button
                  className="w-full rounded-lg py-3 bg-muted/50 hover:bg-muted border border-ornament/30 text-foreground font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={async () => {
                    if (!playerName.trim()) {
                      toast.error('Введите ваше имя');
                      return;
                    }
                    const result = await startSoloGame(playerName.trim());
                    if (result) {
                      navigate('/game');
                    }
                  }}
                  disabled={isLoading}
                >
                  <span>🎯</span>
                  <span>Играть соло</span>
                  <span className="text-xs text-muted-foreground">(тренировка)</span>
                </button>

                {/* Список открытых комнат */}
                {user && (
                  <div className="mt-4 pt-3 border-t border-ornament">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Открытые комнаты
                      </h3>
                      <button
                        onClick={loadPublicRooms}
                        disabled={loadingRooms}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <RefreshCw className={`h-4 w-4 text-muted-foreground ${loadingRooms ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {loadingRooms ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </div>
                    ) : publicRooms.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {publicRooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => handleJoinPublicRoom(room.id)}
                            disabled={isLoading || !playerName.trim()}
                            className="w-full p-3 bg-muted/50 hover:bg-muted rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground truncate">
                                {room.name}
                              </span>
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {room.playerCount}/{room.maxPlayers}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Нет открытых комнат
                      </p>
                    )}
                  </div>
                )}

                <div className="text-center text-xs text-muted-foreground mt-4">
                  <p>Постройте железнодорожную империю в Европе!</p>
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

                {/* Переключатель приватности */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {isPrivate ? (
                      <Lock className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-600" />
                    )}
                    <Label htmlFor="private-mode" className="text-sm font-medium cursor-pointer">
                      {isPrivate ? 'Приватная комната' : 'Открытая комната'}
                    </Label>
                  </div>
                  <Switch
                    id="private-mode"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                </div>
                <p className="text-xs text-muted-foreground -mt-2 px-1">
                  {isPrivate 
                    ? 'Только по коду — комната не видна в списке' 
                    : 'Все смогут найти и присоединиться'}
                </p>

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
          <div className="mt-4 text-center space-y-2 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            <div className="inline-flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm">
              <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full border border-gold/30 hover-scale">
                <span className="text-gold">👥</span>
                <span className="text-foreground font-medium">2-4 игрока</span>
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full border border-gold/30 hover-scale">
                <span className="text-gold">⏱️</span>
                <span className="text-foreground font-medium">30-60 мин</span>
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full border border-gold/30 hover-scale">
                <span className="text-gold">🏙️</span>
                <span className="text-foreground font-medium">46 городов</span>
              </span>
            </div>
            
            <div>
              <RulesModal />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Vintage style */}
      <footer className="py-3 text-center border-t-4 border-gold/50 bg-primary/80 backdrop-blur-sm relative z-10 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        <div className="flex items-center justify-center gap-2">
          <p className="text-primary-foreground font-display text-sm md:text-base">
            Разработчик: <strong className="text-gold">Симинеев Тимур</strong>
          </p>
          <a 
            href="https://t.me/timursimineev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/20 hover:bg-gold/40 transition-colors"
            title="Telegram"
          >
            <Send className="h-3.5 w-3.5 text-gold" />
          </a>
        </div>
        <p className="text-xs text-primary-foreground/80 mt-1">
          Вдохновлено <span className="italic">Ticket to Ride: Europe</span>
        </p>
      </footer>

      {/* Modals are handled inside <AuthControls /> */}
    </div>
  );
};

export default Index;
