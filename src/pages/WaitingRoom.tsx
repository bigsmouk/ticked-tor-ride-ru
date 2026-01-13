import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayer, useRoomSubscription } from '@/hooks/useMultiplayer';
import { usePresence } from '@/hooks/usePresence';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { useMatchHistory } from '@/hooks/useMatchHistory';
import { AuthControls } from '@/components/auth/AuthControls';
import { Copy, Users, Crown, Check, Wifi, WifiOff, Lock, Globe, UserX, History, Loader2, Palette, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const { currentRoom, localPlayerId, leaveRoom, initializeGame } = useGameStore();
  const { startGame: startGameInDb, leaveRoom: leaveRoomFromDb, kickPlayer, changePlayerColor, deleteRoom } = useMultiplayer();
  const { isRecovering } = useSessionRecovery();
  const { matches, loading: historyLoading, fetchMatchHistory } = useMatchHistory();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState<{ id: string; name: string } | null>(null);
  const [playerProfileId, setPlayerProfileId] = useState<string | null>(null);

  // Отслеживание онлайн-статуса игроков
  const { isPlayerOnline } = usePresence(currentRoom?.id || null);

  // Подписка на realtime обновления комнаты
  useRoomSubscription(currentRoom?.id || null);

  // Подписка на кик игрока - слушаем DELETE из room_players
  // Используем ref чтобы callback имел актуальный localPlayerId
  const localPlayerIdRef = React.useRef(localPlayerId);
  localPlayerIdRef.current = localPlayerId;
  
  useEffect(() => {
    if (!currentRoom?.id) {
      console.log('[KickListener] No room id yet, waiting...');
      return;
    }

    console.log('[KickListener] Setting up for room:', currentRoom.id, 'player:', localPlayerId);

    const channel = supabase
      .channel(`kick-listener-${currentRoom.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${currentRoom.id}`,
        },
        (payload) => {
          console.log('[KickListener] DELETE received:', payload);
          console.log('[KickListener] payload.old:', JSON.stringify(payload.old));
          
          // Проверяем, что удалили именно нас
          const deletedPlayerId = (payload.old as { player_id?: string })?.player_id;
          const currentLocalId = localPlayerIdRef.current;
          console.log('[KickListener] Deleted player_id:', deletedPlayerId, 'local:', currentLocalId);
          
          if (deletedPlayerId && deletedPlayerId === currentLocalId) {
            // Нас кикнули!
            console.log('[KickListener] WE WERE KICKED!');
            toast.error('Вы были исключены из комнаты хостом', {
              duration: 5000,
              icon: '🚫',
            });
            leaveRoom(); // Очищаем локальное состояние
            navigate('/');
          }
        }
      )
      .subscribe((status) => {
        console.log('[KickListener] Subscription status:', status);
      });

    return () => {
      console.log('[KickListener] Cleaning up channel');
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id, navigate, leaveRoom]);

  // Редирект если игра началась ИЛИ это соло-режим
  useEffect(() => {
    // Для соло-режима сразу начинаем игру
    if (currentRoom?.isSoloMode) {
      initializeGame();
      navigate('/game');
      return;
    }
    
    if (currentRoom?.status === 'playing') {
      initializeGame();
      navigate('/game');
    }
  }, [currentRoom?.status, currentRoom?.isSoloMode, navigate, initializeGame]);

  // Redirect if no room (но не во время восстановления)
  useEffect(() => {
    if (!currentRoom && !isRecovering) {
      navigate('/');
    }
  }, [currentRoom, navigate, isRecovering]);

  // Показываем загрузку при восстановлении
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

  const handleDeleteRoom = async () => {
    if (!isHost) return;
    const confirmed = window.confirm('Удалить комнату? Все игроки будут отключены.');
    if (confirmed) {
      await deleteRoom(currentRoom.id);
      navigate('/');
    }
  };

  const handleKickPlayer = async (targetPlayerId: string, playerName: string) => {
    if (!isHost) return;
    const success = await kickPlayer(currentRoom.id, targetPlayerId);
    if (success) {
      toast.success(`${playerName} исключён из комнаты`);
    }
  };

  const handleViewHistory = async (playerId: string, playerName: string) => {
    // Ищем profile_id для игрока через room_players
    try {
      const { data } = await supabase
        .from('room_players')
        .select('owner_auth_id')
        .eq('room_id', currentRoom.id)
        .eq('player_id', playerId)
        .single();

      if (data?.owner_auth_id) {
        // Получаем profile по user_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', data.owner_auth_id)
          .single();

        if (profileData) {
          setPlayerProfileId(profileData.id);
          setSelectedPlayerForHistory({ id: playerId, name: playerName });
          fetchMatchHistory(profileData.id);
        } else {
          toast.error('Профиль игрока не найден');
        }
      } else {
        toast.error('Игрок не авторизован');
      }
    } catch (err) {
      console.error('Error fetching player profile:', err);
      toast.error('Не удалось загрузить историю');
    }
  };

  const playerColors: Record<string, string> = {
    red: 'bg-player-red',
    blue: 'bg-player-blue',
    green: 'bg-player-green',
    yellow: 'bg-player-yellow',
    black: 'bg-gray-800',
  };

  const allPlayerColors = ['red', 'blue', 'green', 'yellow', 'black'] as const;
  
  // Получаем занятые цвета другими игроками
  const getUsedColors = () => {
    return currentRoom.players
      .filter(p => p.id !== localPlayerId)
      .map(p => p.color);
  };
  
  const handleChangeColor = async (newColor: typeof allPlayerColors[number]) => {
    if (!currentRoom) return;
    await changePlayerColor(currentRoom.id, newColor);
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
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="font-display text-3xl font-bold text-foreground">
                  {currentRoom.name}
                </h2>
                {currentRoom.isPrivate ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    <Lock className="w-3 h-3" />
                    Приватная
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <Globe className="w-3 h-3" />
                    Открытая
                  </span>
                )}
              </div>
              
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
                {currentRoom.isPrivate 
                  ? 'Поделитесь кодом с друзьями — комната скрыта из списка'
                  : 'Комната видна всем в списке открытых игр'
                }
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
                    {player.avatarUrl ? (
                      <img
                        src={player.avatarUrl}
                        alt=""
                        className={`w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ${
                          player.color === 'red' ? 'ring-player-red' :
                          player.color === 'blue' ? 'ring-player-blue' :
                          player.color === 'green' ? 'ring-player-green' :
                          player.color === 'yellow' ? 'ring-player-yellow' :
                          'ring-gray-700'
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
                      
                      {/* Color display or color picker for self */}
                      {player.id === localPlayerId ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">Ваш цвет:</span>
                          <div className="flex gap-1">
                            {allPlayerColors.map((color) => {
                              const isUsed = getUsedColors().includes(color);
                              const isSelected = player.color === color;
                              
                              return (
                                <button
                                  key={color}
                                  onClick={() => !isUsed && handleChangeColor(color)}
                                  disabled={isUsed}
                                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                                    playerColors[color]
                                  } ${
                                    isSelected 
                                      ? 'border-white ring-2 ring-primary scale-110' 
                                      : isUsed
                                        ? 'opacity-30 cursor-not-allowed border-transparent'
                                        : 'border-transparent hover:scale-110 hover:border-white/50'
                                  }`}
                                  title={
                                    isUsed 
                                      ? 'Цвет занят' 
                                      : color === 'red' ? 'Красный' :
                                        color === 'blue' ? 'Синий' :
                                        color === 'green' ? 'Зелёный' :
                                        color === 'yellow' ? 'Жёлтый' : 'Чёрный'
                                  }
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground capitalize">
                          {player.color === 'red' && '🔴 Красный'}
                          {player.color === 'blue' && '🔵 Синий'}
                          {player.color === 'green' && '🟢 Зелёный'}
                          {player.color === 'yellow' && '🟡 Жёлтый'}
                          {player.color === 'black' && '⚫ Чёрный'}
                        </span>
                      )}
                    </div>

                    {/* Actions: History and Kick buttons */}
                    <div className="flex items-center gap-2">
                      {/* History button */}
                      <button
                        onClick={() => handleViewHistory(player.id, player.name)}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Посмотреть историю матчей"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      
                      {/* Kick button (only for host, not for self) */}
                      {isHost && player.id !== localPlayerId && (
                        <button
                          onClick={() => handleKickPlayer(player.id, player.name)}
                          className="p-1.5 rounded hover:bg-red-100 transition-colors text-red-500 hover:text-red-700"
                          title="Исключить игрока"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
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
                <>
                  <button
                    className="btn-gold w-full rounded-lg py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleStartGame}
                    disabled={!canStart || isStarting}
                  >
                    {isStarting ? '⏳ Запуск...' : canStart ? '🎮 Начать игру' : `Ожидание игроков (минимум 2)`}
                  </button>
                  <button
                    className="w-full rounded-lg py-2 text-sm flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-300"
                    onClick={handleDeleteRoom}
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить комнату
                  </button>
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
            <p className="mt-1">Другие игроки могут присоединиться по коду комнаты</p>
          </div>
        </div>
      </main>

      {/* Player History Modal */}
      <Dialog open={!!selectedPlayerForHistory} onOpenChange={() => setSelectedPlayerForHistory(null)}>
        <DialogContent className="sm:max-w-md bg-amber-50 border-amber-900/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-900">
              📜 История матчей: {selectedPlayerForHistory?.name}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : matches.length > 0 ? (
              <div className="space-y-3 p-1">
                {matches.slice(0, 10).map((match) => {
                  const playerResult = match.match_players.find(p => p.profile_id === playerProfileId);
                  const placement = playerResult?.placement || 1;
                  const isNotCounted = placement <= 0;
                  
                  const getPlacementDisplay = () => {
                    if (placement === 0) return { emoji: '🚪', text: 'Покинул' };
                    if (placement === -1) return { emoji: '⚠️', text: 'Не засчитано' };
                    if (playerResult?.is_winner) return { emoji: '🏆', text: null };
                    return { emoji: `#${placement}`, text: null };
                  };
                  
                  const display = getPlacementDisplay();
                  
                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-lg border ${
                        isNotCounted
                          ? 'bg-gray-50 border-gray-300'
                          : playerResult?.is_winner
                            ? 'bg-green-50 border-green-200'
                            : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-amber-900 flex items-center gap-1">
                            {display.emoji}
                            {display.text && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                placement === 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {display.text}
                              </span>
                            )}
                            <span className="ml-1">{match.room_name}</span>
                          </div>
                          <div className="text-xs text-amber-600">
                            {match.player_count} игроков
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${isNotCounted ? 'text-gray-500' : 'text-amber-900'}`}>
                            {playerResult?.final_score} очков
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-amber-600">
                У этого игрока пока нет истории матчей
              </div>
            )}
          </ScrollArea>
          
          <Button onClick={() => setSelectedPlayerForHistory(null)} className="w-full">
            Закрыть
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaitingRoom;
