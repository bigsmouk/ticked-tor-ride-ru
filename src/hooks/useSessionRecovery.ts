import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { Player, PlayerColor } from '@/types/game';
import { toast } from 'sonner';

interface SavedSession {
  roomId: string;
  roomCode: string;
  playerName: string;
  timestamp: number;
  gameStateSnapshot?: string; // JSON-сериализованное состояние игры
  lastRoute?: string; // Последний маршрут (/game, /waiting)
}

const SESSION_KEY = 'ttr_game_session';
const SESSION_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 часа

// Внутренняя функция для получения сессии без проверки expiry
const getSavedSessionRaw = (): SavedSession | null => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as SavedSession;
  } catch {
    return null;
  }
};

// Сохранение сессии
export const saveSession = (
  roomId: string, 
  roomCode: string, 
  playerName: string,
  options?: { gameStateSnapshot?: string; lastRoute?: string }
) => {
  const existing = getSavedSessionRaw();
  const session: SavedSession = {
    roomId,
    roomCode,
    playerName,
    timestamp: Date.now(),
    gameStateSnapshot: options?.gameStateSnapshot ?? existing?.gameStateSnapshot,
    lastRoute: options?.lastRoute ?? existing?.lastRoute,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Обновить только snapshot и route (без перезаписи остального)
export const updateSessionSnapshot = (gameStateSnapshot: string, lastRoute: string) => {
  const existing = getSavedSessionRaw();
  if (!existing) return;
  
  const session: SavedSession = {
    ...existing,
    timestamp: Date.now(),
    gameStateSnapshot,
    lastRoute,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Очистка сессии
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Получение сохранённой сессии
const getSavedSession = (): SavedSession | null => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    
    const session = JSON.parse(saved) as SavedSession;
    
    // Проверяем не истекла ли сессия
    if (Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    clearSession();
    return null;
  }
};

export const useSessionRecovery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRoom, localPlayerId, setCurrentRoom, setView, gameState, setGameState } = useGameStore();
  const [isRecovering, setIsRecovering] = useState(false);
  const [hasAttemptedRecovery, setHasAttemptedRecovery] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<SavedSession | null>(null);
  const [autoRecoveryTriggered, setAutoRecoveryTriggered] = useState(false);

  const isNetworkIssue = useCallback((err: any) => {
    const offline = typeof navigator !== 'undefined' && navigator && navigator.onLine === false;
    const msg = String(err?.message || err?.error_description || err?.details || err || '');
    return offline || msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network');
  }, []);

  // Попытка восстановить сессию
  const attemptRecovery = useCallback(async () => {
    if (currentRoom || isRecovering || hasAttemptedRecovery) return false;
    
    const session = getSavedSession();
    if (!session || !localPlayerId) return false;

    setIsRecovering(true);
    console.log('[SessionRecovery] Attempting to recover session:', session.roomId);

    try {
      // Проверяем, существует ли комната
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', session.roomId)
        .maybeSingle();

      if (roomError || !room) {
        if (roomError && isNetworkIssue(roomError)) {
          console.log('[SessionRecovery] Network issue while loading room, keep session for retry');
          toast.error('Нет соединения. Вернитесь в игру, когда интернет появится.');
          setIsRecovering(false);
          // Важно: НЕ чистим сессию и НЕ ставим hasAttemptedRecovery, чтобы можно было повторить
          return false;
        }

        console.log('[SessionRecovery] Room not found, clearing session');
        clearSession();
        return false;
      }

      // Проверяем, есть ли мы в списке игроков
      const { data: existingPlayer, error: playerError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', session.roomId)
        .eq('player_id', localPlayerId)
        .maybeSingle();

      if (playerError) {
        // Если это сеть/оффлайн — не удаляем сессию, дадим повторить
        if (isNetworkIssue(playerError)) {
          console.error('[SessionRecovery] Network issue checking player:', playerError);
          toast.error('Нет соединения. Повторите попытку после восстановления интернета.');
          setIsRecovering(false);
          return false;
        }

        console.error('[SessionRecovery] Error checking player:', playerError);
        clearSession();
        return false;
      }

      // Если игрока нет в комнате и игра уже началась - сессия недействительна
      if (!existingPlayer && room.status === 'playing') {
        console.log('[SessionRecovery] Player not in playing room, clearing session');
        clearSession();
        return false;
      }

      // Если игрока нет, но комната в ожидании - переподключаемся
      if (!existingPlayer && room.status === 'waiting') {
        // Получаем текущих игроков для определения цвета
        const { data: allPlayers } = await supabase
          .from('room_players')
          .select('*')
          .eq('room_id', session.roomId);

        if (allPlayers && allPlayers.length >= room.max_players) {
          console.log('[SessionRecovery] Room is full');
          clearSession();
          toast.error('Комната заполнена');
          return false;
        }

        const usedColors = allPlayers?.map(p => p.color) || [];
        const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
        const availableColor = PLAYER_COLORS.find(c => !usedColors.includes(c)) || PLAYER_COLORS[0];

        // Добавляемся обратно в комнату
        await supabase
          .from('room_players')
          .insert({
            room_id: session.roomId,
            player_id: localPlayerId,
            player_name: session.playerName,
            color: availableColor,
            is_ready: true,
            is_host: false,
          });
      }

      // Получаем всех игроков
      const { data: players, error: playersError } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', session.roomId)
        .order('joined_at', { ascending: true });

      if (playersError || !players) {
        if (playersError && isNetworkIssue(playersError)) {
          console.error('[SessionRecovery] Network issue fetching players:', playersError);
          toast.error('Нет соединения. Повторите попытку позже.');
          setIsRecovering(false);
          return false;
        }

        console.error('[SessionRecovery] Error fetching players:', playersError);
        clearSession();
        return false;
      }

      const gamePlayers: Player[] = players.map(p => ({
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

      // Восстанавливаем комнату в store
      setCurrentRoom({
        id: room.id,
        code: room.code,
        name: room.name,
        hostId: room.host_id,
        players: gamePlayers,
        maxPlayers: room.max_players,
        status: room.status as 'waiting' | 'playing' | 'finished',
        createdAt: new Date(room.created_at),
      });

      console.log('[SessionRecovery] Session recovered successfully, status:', room.status);
      toast.success('Сессия восстановлена!');

      // Обновляем timestamp сессии
      saveSession(session.roomId, session.roomCode, session.playerName);

      // Восстанавливаем gameState из snapshot если есть и статус playing
      if (room.status === 'playing' && session.gameStateSnapshot) {
        try {
          const restoredGameState = JSON.parse(session.gameStateSnapshot);
          console.log('[SessionRecovery] Restoring gameState from snapshot, turn:', restoredGameState.turnNumber);
          setGameState(restoredGameState);
        } catch (e) {
          console.warn('[SessionRecovery] Failed to parse gameState snapshot:', e);
        }
      }

      // Сначала сбрасываем состояние загрузки
      setIsRecovering(false);
      setHasAttemptedRecovery(true);

      // Навигация в зависимости от статуса (после сброса isRecovering)
      if (room.status === 'playing') {
        setView('game');
        // Используем setTimeout чтобы React успел обновить состояние
        setTimeout(() => navigate('/game'), 0);
      } else if (room.status === 'waiting') {
        setView('waiting');
        setTimeout(() => navigate('/waiting'), 0);
      } else {
        clearSession();
        return false;
      }

      return true;
    } catch (err) {
      // На сетевых ошибках НЕ очищаем сессию — это ключ к переподключению после оффлайна.
      if (isNetworkIssue(err)) {
        console.error('[SessionRecovery] Recovery failed due to network:', err);
        toast.error('Нет интернета. Как появится связь — нажмите «Повторить подключение».');
        setIsRecovering(false);
        return false;
      }

      console.error('[SessionRecovery] Recovery failed:', err);
      clearSession();
      setIsRecovering(false);
      setHasAttemptedRecovery(true);
      return false;
    }
  }, [currentRoom, isRecovering, hasAttemptedRecovery, localPlayerId, setCurrentRoom, setView, setGameState, navigate]);

  // Автосохранение gameState при изменениях
  useEffect(() => {
    if (gameState && currentRoom) {
      try {
        const snapshot = JSON.stringify(gameState);
        updateSessionSnapshot(snapshot, location.pathname);
      } catch (e) {
        console.warn('[SessionRecovery] Failed to save gameState snapshot:', e);
      }
    }
  }, [gameState, currentRoom, location.pathname]);

  // АВТОМАТИЧЕСКОЕ восстановление при обновлении страницы /game или /waiting
  useEffect(() => {
    const skipAutoRecovery = new URLSearchParams(location.search).has('noRecover');
    
    // Если мы на /game или /waiting и нет currentRoom — автоматически восстанавливаем
    if (
      !skipAutoRecovery &&
      localPlayerId &&
      !currentRoom &&
      !hasAttemptedRecovery &&
      !autoRecoveryTriggered &&
      (location.pathname === '/game' || location.pathname === '/waiting')
    ) {
      const session = getSavedSession();
      if (session) {
        console.log('[SessionRecovery] Auto-recovering session on', location.pathname);
        setAutoRecoveryTriggered(true);
        attemptRecovery();
      } else {
        // Нет сессии — редиректим на главную
        console.log('[SessionRecovery] No session found, redirecting to home');
        setHasAttemptedRecovery(true);
        navigate('/');
      }
    }
  }, [localPlayerId, currentRoom, hasAttemptedRecovery, autoRecoveryTriggered, location.pathname, location.search, attemptRecovery, navigate]);

  // Проверяем наличие сохранённой сессии на ГЛАВНОЙ странице — показываем prompt
  useEffect(() => {
    const skipAutoRecovery = new URLSearchParams(location.search).has('noRecover');

    // Только на главной странице и только если явно не отключили восстановление
    if (
      !skipAutoRecovery &&
      localPlayerId &&
      !currentRoom &&
      !hasAttemptedRecovery &&
      location.pathname === '/'
    ) {
      const session = getSavedSession();
      if (session) {
        setSavedSessionData(session);
        setShowRecoveryPrompt(true);
      } else {
        setHasAttemptedRecovery(true);
      }
    }
  }, [localPlayerId, currentRoom, hasAttemptedRecovery, location.pathname, location.search]);

  // Отклонить восстановление — остаться на главной
  const dismissRecovery = useCallback(() => {
    clearSession();
    setShowRecoveryPrompt(false);
    setSavedSessionData(null);
    setHasAttemptedRecovery(true);
  }, []);

  return {
    isRecovering,
    attemptRecovery,
    hasSession: !!getSavedSession(),
    showRecoveryPrompt,
    savedSessionData,
    dismissRecovery,
  };
};
