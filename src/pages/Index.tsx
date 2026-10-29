import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { RulesModal } from '@/components/game/RulesModal';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Users, Lock, Globe, Train, Send } from 'lucide-react';
import AnimatedTrainBackground from '@/components/home/AnimatedTrainBackground';
import ActiveGamesCounter from '@/components/home/ActiveGamesCounter';
import { toast } from 'sonner';
import { AuthControls } from '@/components/auth/AuthControls';

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
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const {
    isRecovering,
    showRecoveryPrompt,
    savedSessionData,
    attemptRecovery,
    dismissRecovery,
  } = useSessionRecovery();
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ttr_guest_name') || '');
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // For signed-in players the account nickname takes precedence over the guest name.
  const accountName = isAuthenticated
    ? (profile?.display_name?.trim() || (user?.user_metadata?.display_name as string | undefined)?.trim() || '')
    : '';
  const effectivePlayerName = accountName || playerName.trim();

  useEffect(() => {
    if (accountName) setPlayerName(accountName);
    else if (!isAuthenticated) setPlayerName(localStorage.getItem('ttr_guest_name') || '');
  }, [accountName, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && playerName.trim()) localStorage.setItem('ttr_guest_name', playerName.trim());
  }, [playerName, isAuthenticated]);
  const loadPublicRooms = async () => {
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
    const interval = setInterval(cleanupRooms, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Загружаем открытые комнаты при входе на страницу + realtime подписка
  useEffect(() => {
    if (showCreate || showJoin) return;
    
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
            <Link to="/" title="На главную" className="hover:opacity-80">🚂 Ticket to Ride</Link> <span className="align-middle text-sm font-semibold text-amber-300">(beta)</span>
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

              <div className="space-y-2">
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
          <nav aria-label="Карта сайта" className="flex flex-wrap justify-center gap-4 text-xs mt-2">
            <Link to="/" className="underline">Главная</Link>
            <Link to="/rules" className="underline">Правила игры</Link>
            <Link to="/privacy" className="underline">Конфиденциальность</Link>
            <Link to="/about" className="underline">Об авторе</Link>
          </nav>
          <p className="text-xs opacity-75">Вдохновлено настольной игрой Ticket to Ride: Europe</p>
        </footer>
      </div>
    );
  }

  const handleCreateGame = async () => {
    if (effectivePlayerName && roomName.trim()) {
      const result = await createRoom(roomName.trim(), effectivePlayerName, isPrivate);
      if (result) {
        navigate('/waiting');
      }
    }
  };

  const handleJoinGame = async () => {
    if (effectivePlayerName && joinCode.trim()) {
      const result = await joinRoom(joinCode.trim(), effectivePlayerName);
      if (result) {
        navigate('/waiting');
      }
    }
  };

 const handleJoinPublicRoom = async (roomId: string) => {
  if (!effectivePlayerName) {
    alert('Введите имя игрока, чтобы присоединиться к комнате.');
    return;
  }

  const result = await joinRoomById(roomId, effectivePlayerName);

  if (result) {
    navigate('/waiting');
  }
};

  return (
    <>
    <div className="min-h-[100dvh] lg:h-[100dvh] parchment flex flex-col relative lg:overflow-hidden">
      {/* Background */}
      <AnimatedTrainBackground />
      
      {/* Header - Retro poster style */}
      <header className="retro-header py-1 md:py-1.5 text-center relative z-10 flex-shrink-0 animate-fade-in">
        
        <div className="absolute right-2 md:right-4 top-2 z-20"><AuthControls /></div>
        {/* Decorative train icon */}
        <Link to="/" aria-label="Ticket to Ride — на главную" title="На главную" className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 block animate-scale-in rounded-md p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold hover:scale-110 transition-transform">
          <Train className="h-7 w-7 md:h-10 md:w-10 text-gold opacity-90" />
        </Link>

        <h1 className="vintage-title text-xl md:text-3xl font-bold text-primary-foreground">
          <Link to="/" title="На главную" className="hover:opacity-80">Ticket to Ride</Link> <span className="align-middle text-xs md:text-sm font-semibold tracking-normal text-amber-300">(beta)</span>
        </h1>
        <p className="vintage-subtitle text-sm md:text-base font-bold">
          ЕВРОПА
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-start lg:justify-center px-3 py-5 md:py-6 lg:py-2 relative z-10">
        <div className="text-center max-w-3xl mb-3 lg:mb-2 space-y-1"><span className="inline-block rounded-full border border-gold/50 bg-primary/10 px-4 py-1 text-xs font-semibold tracking-widest uppercase text-foreground">Железнодорожное приключение по Европе</span><h2 className="font-display text-2xl md:text-3xl lg:text-3xl font-bold text-foreground leading-tight">Построй свою железнодорожную империю</h2><p className="text-sm md:text-base text-foreground/80">Бесплатная стратегия онлайн: играй с друзьями или против бота прямо в браузере, без скачивания и регистрации.</p></div>
        {/* Active games counter */}
        <div className="mb-1 animate-fade-in flex-shrink-0">
          <ActiveGamesCounter />
        </div>
        
        <div className="max-w-lg w-full min-h-0 flex flex-col animate-scale-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <div className="vintage-card rounded-2xl p-3 md:p-4 shadow-2xl min-h-0 overflow-y-auto">
            {/* Welcome text */}
            <div className="text-center mb-2">
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Добро пожаловать!
              </h2>
              <div className="ornate-divider my-2"></div>
            </div>

            {!authLoading && !isAuthenticated && (
              <div className="mb-3 rounded-lg border border-amber-500 bg-amber-100 p-3 text-center text-sm text-amber-950">
                🚂 Играйте с друзьями без регистрации! Просто введите имя. Аккаунт необязателен.
              </div>
            )}
            {/* Player name input */}
            <div className="mb-2">
              <label className="block font-display text-sm font-semibold mb-1 text-foreground">
                Ваше имя
              </label>
              <Input
                value={effectivePlayerName}
                onChange={(e) => setPlayerName(e.target.value)}
                readOnly={Boolean(accountName)}
                placeholder="Введите имя..."
                className="w-full bg-background border-ornament"
              />
            </div>

            {!showCreate && !showJoin ? (
              <div className="space-y-2">
                <button
                  id="create-room-button"
                  className="btn-gold w-full rounded-lg py-2 text-base hover-scale"
                  onClick={() => {
                    if (localStorage.getItem('ttr_analytics_consent') === 'accepted') {
                      const ym = (window as Window & { ym?: (...args: any[]) => void }).ym;
                      ym?.(113841365, 'reachGoal', 'create-room-button');
                    }
                    setShowCreate(true);
                  }}
                >
                  ➕ Создать комнату
                </button>
                
                <button
                  className="btn-vintage w-full rounded-lg py-2 hover-scale"
                  onClick={() => setShowJoin(true)}
                  disabled={isLoading}
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
                  className="w-full rounded-lg py-2 bg-muted/50 hover:bg-muted border border-ornament/30 text-foreground font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={async () => {
                    if (!effectivePlayerName) {
                      toast.error('Введите ваше имя');
                      return;
                    }
                    const result = await startSoloGame(effectivePlayerName);
                    if (result) {
                      navigate('/game');
                    }
                  }}
                  disabled={isLoading}
                >
                  <span>🎯</span>
                  <span>Играть соло против бота</span>
                  <span className="text-xs text-muted-foreground">(без регистрации)</span>
                </button>

                {/* Список открытых комнат */}
                {(
                  <div className="mt-2 pt-2 border-t border-ornament">
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
                      <div className="space-y-2">
                        {publicRooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => handleJoinPublicRoom(room.id)}
                            disabled={isLoading}
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

                <div className="text-center text-xs text-muted-foreground mt-2">
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
                  disabled={!effectivePlayerName || !roomName.trim() || isLoading}
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
                  disabled={!effectivePlayerName || !joinCode.trim() || isLoading}
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
          <div className="mt-1 text-center space-y-1 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
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
              <Link to="/rules" className="block mt-1 text-xs underline text-primary hover:text-amber-700">Подробные правила на отдельной странице →</Link>
            </div>
          </div>
        </div>
      </main>

    </div>
    <section aria-labelledby="features-title" className="bg-amber-50 text-amber-950 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12"><p className="uppercase tracking-[.2em] text-xs font-bold text-amber-700 mb-3">Твоё приключение начинается здесь</p><h2 id="features-title" className="font-display text-3xl md:text-4xl font-bold mb-4">Железнодорожная стратегия онлайн бесплатно</h2><p className="text-amber-900/80">Соединяй города Европы, собирай карты вагонов и выполняй билеты с маршрутами. Выбирай, как отправиться в путешествие.</p></div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: '👥', title: 'С друзьями', description: 'Создай комнату, поделись кодом и соревнуйся с друзьями за лучшие маршруты.', link: '/play-with-friends', action: 'Игра с друзьями' },
            { icon: '🚂', title: 'Против бота', description: 'Тренируй стратегию в одиночном режиме. Начать можно без аккаунта.', link: '/play-solo', action: 'Соло-режим' },
            { icon: '🗺️', title: 'Изучи правила', description: 'Разберись с картами, маршрутами, станциями и подсчётом очков.', link: '/how-to-play', action: 'Как играть' }
          ].map(card => <article key={card.title} className="group rounded-2xl border border-amber-900/15 bg-white/85 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"><div className="text-4xl mb-5" aria-hidden="true">{card.icon}</div><h3 className="font-display text-2xl font-bold mb-3">{card.title}</h3><p className="leading-relaxed text-amber-900/80 mb-6">{card.description}</p><Link to={card.link} className="font-semibold text-amber-800 underline underline-offset-4 hover:text-amber-600">{card.action} →</Link></article>)}
        </div>
      </div>
    </section>
    <section aria-labelledby="steps-title" className="bg-[#f5ead3] text-amber-950 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-5xl text-center"><h2 id="steps-title" className="font-display text-3xl md:text-4xl font-bold mb-10">Как начать играть</h2><ol className="grid gap-8 md:grid-cols-3 text-left">{[
        ['01', 'Введи имя', 'Укажи имя игрока на главной странице. Регистрация необязательна.'],
        ['02', 'Выбери режим', 'Создай комнату для друзей, присоединись по коду или начни соло-партию.'],
        ['03', 'Строй маршруты', 'Собирай карты вагонов, соединяй города и набирай победные очки.']
      ].map(([number,title,description]) => <li key={number} className="border-t-2 border-amber-800/30 pt-5"><span className="font-display text-4xl text-amber-700/70">{number}</span><h3 className="text-xl font-bold mt-3 mb-2">{title}</h3><p className="text-amber-900/80">{description}</p></li>)}</ol><Link to="/rules" className="inline-block mt-10 font-semibold underline underline-offset-4 text-amber-900">Читать подробные правила →</Link></div>
    </section>
    <section aria-labelledby="faq-title" className="bg-amber-50 text-amber-950 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-3xl"><h2 id="faq-title" className="font-display text-3xl md:text-4xl font-bold text-center mb-10">Частые вопросы</h2><div className="space-y-3">{[
        ['Можно ли играть без регистрации?', 'Да. Для начала игры с друзьями или против бота достаточно указать имя игрока.'],
        ['Сколько игроков могут участвовать?', 'В многопользовательской партии могут участвовать от 2 до 4 игроков.'],
        ['Как пригласить друзей?', 'Создай комнату и отправь друзьям её код. Они смогут присоединиться с главной страницы.'],
        ['Нужно ли скачивать игру?', 'Нет. Игра запускается прямо в браузере на сайте.']
      ].map(([question,answer]) => <details key={question} className="group rounded-xl border border-amber-900/15 bg-white p-5 shadow-sm"><summary className="cursor-pointer font-semibold marker:text-amber-700">{question}</summary><p className="mt-3 text-amber-900/80 leading-relaxed">{answer}</p></details>)}</div></div>
    </section>
    <div className="relative">      {/* Footer - Vintage style */}
      <footer className="py-2 text-center border-t-4 border-gold/50 bg-primary/80 backdrop-blur-sm relative z-10 flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="text-primary-foreground font-display text-sm md:text-base">
            Разработчик: <strong className="text-gold">Симинеев Тимур</strong>
          </p>
          <nav aria-label="Карта сайта" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gold">
            <span className="text-primary-foreground/70">Карта сайта:</span>
            <Link to="/" className="underline hover:text-amber-200">Главная</Link>
            <Link to="/rules" className="underline hover:text-amber-200">Правила игры</Link>
            <Link to="/privacy" className="underline hover:text-amber-200">Конфиденциальность</Link>
            <Link to="/about" className="underline hover:text-amber-200">Об авторе</Link>
          </nav>
          <a 
            href="https://t.me/bigsssmoke" 
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

</div>
    </>
  );
};

export default Index;
