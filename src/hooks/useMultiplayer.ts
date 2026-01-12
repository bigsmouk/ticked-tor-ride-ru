import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { Player, PlayerColor } from '@/types/game';
import { toast } from 'sonner';
import { z } from 'zod';
import { saveSession, clearSession } from './useSessionRecovery';

const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];

// Схемы валидации
const playerNameSchema = z.string()
  .trim()
  .min(1, 'Имя не может быть пустым')
  .max(30, 'Имя слишком длинное (максимум 30 символов)')
  .regex(/^[\p{L}\p{N}\s\-_]+$/u, 'Имя содержит недопустимые символы');

const roomNameSchema = z.string()
  .trim()
  .min(1, 'Название комнаты не может быть пустым')
  .max(50, 'Название слишком длинное (максимум 50 символов)')
  .regex(/^[\p{L}\p{N}\s\-_!?.,]+$/u, 'Название содержит недопустимые символы');

// Генерация уникального ID игрока (сохраняется в localStorage)
const getOrCreatePlayerId = (): string => {
  const stored = localStorage.getItem('ttr_player_id');
  if (stored) return stored;
  
  const newId = crypto.randomUUID();
  localStorage.setItem('ttr_player_id', newId);
  return newId;
};

// Генерация короткого кода комнаты
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useMultiplayer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentRoom, setLocalPlayerId, setView } = useGameStore();

  const playerId = getOrCreatePlayerId();

  // Устанавливаем playerId в store при инициализации
  useEffect(() => {
    setLocalPlayerId(playerId);
  }, [playerId, setLocalPlayerId]);

  // Создание комнаты
  const createRoom = useCallback(async (roomName: string, playerName: string) => {
    if (!playerId) {
      toast.error('Подождите, идёт подключение...');
      return null;
    }

    // Валидация входных данных
    const roomNameResult = roomNameSchema.safeParse(roomName);
    if (!roomNameResult.success) {
      toast.error(roomNameResult.error.errors[0].message);
      return null;
    }

    const playerNameResult = playerNameSchema.safeParse(playerName);
    if (!playerNameResult.success) {
      toast.error(playerNameResult.error.errors[0].message);
      return null;
    }

    const validatedRoomName = roomNameResult.data;
    const validatedPlayerName = playerNameResult.data;

    setIsLoading(true);
    setError(null);

    try {
      const roomCode = generateRoomCode();

      // Создаём комнату в базе
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code: roomCode,
          name: validatedRoomName,
          host_id: playerId,
          status: 'waiting',
          max_players: 4,
          is_private: false,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Добавляем хоста как первого игрока
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          player_id: playerId,
          player_name: validatedPlayerName,
          color: PLAYER_COLORS[0],
          is_ready: true,
          is_host: true,
        });

      if (playerError) throw playerError;

      setCurrentRoom({
        id: room.id,
        code: roomCode,
        name: validatedRoomName,
        hostId: playerId,
        players: [{
          id: playerId,
          name: validatedPlayerName,
          color: PLAYER_COLORS[0],
          trainCards: [],
          destinationTickets: [],
          trainsRemaining: 45,
          stations: 3,
          score: 0,
          isActive: false,
          isConnected: true,
        }],
        maxPlayers: 4,
        status: 'waiting',
        createdAt: new Date(),
      });
      setView('waiting');

      // Сохраняем сессию для реконнекта
      saveSession(room.id, roomCode, validatedPlayerName);

      return { roomCode, roomId: room.id };
    } catch (err: any) {
      console.error('Error creating room:', err);
      setError(err.message);
      toast.error('Ошибка создания комнаты');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [playerId, setCurrentRoom, setView]);

  // Присоединение к комнате
  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    if (!playerId) {
      toast.error('Подождите, идёт подключение...');
      return null;
    }

    // Валидация имени игрока
    const playerNameResult = playerNameSchema.safeParse(playerName);
    if (!playerNameResult.success) {
      toast.error(playerNameResult.error.errors[0].message);
      return null;
    }

    const validatedPlayerName = playerNameResult.data;

    setIsLoading(true);
    setError(null);

    try {
      // Находим комнату по коду
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, code, name, host_id, status, max_players, is_private, created_at, updated_at')
        .eq('code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (roomError) throw roomError;
      if (!room) {
        toast.error('Комната не найдена или игра уже началась');
        return null;
      }

      // Получаем текущих игроков
      const { data: existingPlayers, error: playersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id);

      if (playersError) throw playersError;

      if (existingPlayers.length >= room.max_players) {
        toast.error('Комната заполнена');
        return null;
      }

      // Проверяем, не присоединился ли уже этот игрок
      const alreadyJoined = existingPlayers.find(p => p.player_id === playerId);
      if (!alreadyJoined) {
        // Определяем свободный цвет
        const usedColors = existingPlayers.map(p => p.color);
        const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[0];

        // Присоединяемся к комнате
        const { error: joinError } = await supabase
          .from('room_players')
          .insert({
            room_id: room.id,
            player_id: playerId,
            player_name: validatedPlayerName,
            color: availableColor,
            is_ready: true,
            is_host: false,
          });

        if (joinError) throw joinError;
      }

      // Получаем обновлённый список игроков
      const { data: allPlayers, error: allPlayersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id)
        .order('joined_at', { ascending: true });

      if (allPlayersError) throw allPlayersError;

      const players: Player[] = allPlayers.map(p => ({
        id: p.player_id,
        name: p.player_name,
        color: p.color as PlayerColor,
        trainCards: [],
        destinationTickets: [],
        trainsRemaining: 45,
        stations: 3,
        score: 0,
        isActive: false,
        isConnected: true,
      }));

      setCurrentRoom({
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.host_id,
        players,
        maxPlayers: room.max_players,
        status: room.status as 'waiting' | 'playing' | 'finished',
        createdAt: new Date(room.created_at),
      });
      setView('waiting');

      // Сохраняем сессию для реконнекта
      saveSession(room.id, room.code, validatedPlayerName);

      toast.success(`Вы присоединились к комнате "${room.name}"`);
      return room.id;
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.message);
      toast.error('Ошибка присоединения к комнате');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [playerId, setCurrentRoom, setView]);

  // Выход из комнаты
  const leaveRoom = useCallback(async (roomId: string) => {
    if (!playerId) return;
    
    try {
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', roomId)
        .eq('player_id', playerId);

      // Очищаем сохранённую сессию
      clearSession();

      setCurrentRoom(null);
      setView('lobby');
    } catch (err: any) {
      console.error('Error leaving room:', err);
    }
  }, [playerId, setCurrentRoom, setView]);

  // Начать игру (только для хоста)
  const startGame = useCallback(async (roomId: string) => {
    if (!playerId) return false;
    
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'playing' })
        .eq('id', roomId)
        .eq('host_id', playerId);

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error('Error starting game:', err);
      toast.error('Ошибка запуска игры');
      return false;
    }
  }, [playerId]);

  return {
    playerId,
    isLoading,
    error,
    isReady: true,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
  };
};

// Хук для подписки на изменения в комнате
export const useRoomSubscription = (roomId: string | null) => {
  const { setCurrentRoom, currentRoom } = useGameStore();

  useEffect(() => {
    if (!roomId) return;

    // Подписка на изменения игроков в комнате
    const playersChannel = supabase
      .channel(`room-players-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Получаем обновлённый список игроков
          const { data: players } = await supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomId)
            .order('joined_at', { ascending: true });

          if (players && currentRoom) {
            const updatedPlayers: Player[] = players.map(p => ({
              id: p.player_id,
              name: p.player_name,
              color: p.color as PlayerColor,
              trainCards: [],
              destinationTickets: [],
              trainsRemaining: 45,
              stations: 3,
              score: 0,
              isActive: false,
              isConnected: true,
            }));

            setCurrentRoom({
              ...currentRoom,
              players: updatedPlayers,
            });
          }
        }
      )
      .subscribe();

    // Подписка на изменения статуса комнаты
    const roomChannel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (currentRoom && newStatus !== currentRoom.status) {
            setCurrentRoom({
              ...currentRoom,
              status: newStatus as 'waiting' | 'playing' | 'finished',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(roomChannel);
    };
  }, [roomId, currentRoom, setCurrentRoom]);
};
