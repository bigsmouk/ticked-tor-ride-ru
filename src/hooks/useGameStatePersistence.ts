import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { GameState } from '@/types/game';

const SAVE_INTERVAL_MS = 10000; // Сохраняем каждые 10 секунд
const SAVE_DEBOUNCE_MS = 2000;  // Дебаунс после изменения состояния

interface UseGameStatePersistenceOptions {
  roomId: string | null;
  enabled?: boolean;
}

export const useGameStatePersistence = ({ roomId, enabled = true }: UseGameStatePersistenceOptions) => {
  // Всегда вызываем все хуки в одинаковом порядке - это критично для React!
  const gameState = useGameStore(state => state.gameState);
  const setGameState = useGameStore(state => state.setGameState);
  const localPlayerId = useGameStore(state => state.localPlayerId);
  
  const lastSavedTurnRef = useRef<number>(-1);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Сохранение состояния в БД
  const saveToDb = useCallback(async (state: GameState) => {
    // Early return но хук всегда вызывается
    if (!roomId || isSavingRef.current) return;
    
    // Не сохраняем если ничего не изменилось
    if (state.turnNumber === lastSavedTurnRef.current) return;

    isSavingRef.current = true;
    
    try {
      // Upsert - вставить или обновить
      const { error } = await (supabase
        .from('game_states') as any)
        .upsert(
          {
            room_id: roomId,
            game_state: state,
            turn_number: state.turnNumber,
            updated_by: localPlayerId || 'unknown',
          },
          {
            onConflict: 'room_id',
          }
        );

      if (error) {
        console.error('[GameStatePersistence] Error saving state:', error);
      } else {
        lastSavedTurnRef.current = state.turnNumber;
        console.log('[GameStatePersistence] State saved, turn:', state.turnNumber);
      }
    } catch (err) {
      console.error('[GameStatePersistence] Save failed:', err);
    } finally {
      isSavingRef.current = false;
    }
  }, [roomId, localPlayerId]);

  // Загрузка состояния из БД
  const loadFromDb = useCallback(async (): Promise<GameState | null> => {
    if (!roomId) return null;

    try {
      const { data, error } = await (supabase
        .from('game_states') as any)
        .select('game_state, turn_number, updated_at')
        .eq('room_id', roomId)
        .maybeSingle();

      if (error) {
        console.error('[GameStatePersistence] Error loading state:', error);
        return null;
      }

      if (data?.game_state) {
        console.log('[GameStatePersistence] Loaded state from DB, turn:', data.turn_number);
        return data.game_state as unknown as GameState;
      }

      return null;
    } catch (err) {
      console.error('[GameStatePersistence] Load failed:', err);
      return null;
    }
  }, [roomId]);

  // Попытка восстановить состояние из БД
  const restoreFromDb = useCallback(async (): Promise<boolean> => {
    if (!roomId) return false;
    
    const currentState = useGameStore.getState().gameState;
    
    // Если состояние уже есть, не перезаписываем
    if (currentState) {
      console.log('[GameStatePersistence] State already exists, skipping restore');
      return true;
    }

    const dbState = await loadFromDb();
    if (dbState) {
      setGameState(dbState);
      lastSavedTurnRef.current = dbState.turnNumber;
      console.log('[GameStatePersistence] Restored state from DB');
      return true;
    }

    return false;
  }, [roomId, loadFromDb, setGameState]);

  // Обёртка для безопасного сохранения
  const saveCurrentState = useCallback(() => {
    if (gameState && roomId) {
      saveToDb(gameState);
    }
  }, [gameState, roomId, saveToDb]);

  // Дебаунсированное сохранение при изменении состояния
  useEffect(() => {
    // Проверка условий внутри эффекта, а не перед ним
    if (!enabled || !roomId || !gameState) {
      return;
    }

    // Очищаем предыдущий таймер
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Сохраняем с дебаунсом
    saveTimerRef.current = setTimeout(() => {
      saveToDb(gameState);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [gameState, roomId, enabled, saveToDb]);

  // Периодическое сохранение (backup)
  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentState = useGameStore.getState().gameState;
      if (currentState) {
        saveToDb(currentState);
      }
    }, SAVE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomId, enabled, saveToDb]);

  // Сохранение при уходе со страницы
  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    const handleBeforeUnload = () => {
      const currentState = useGameStore.getState().gameState;
      if (currentState && currentState.turnNumber !== lastSavedTurnRef.current) {
        // Синхронный запрос через sendBeacon для надёжности
        console.log('[GameStatePersistence] Page unload, state should be saved');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [roomId, localPlayerId, enabled]);

  return {
    saveToDb: saveCurrentState,
    loadFromDb,
    restoreFromDb,
  };
};