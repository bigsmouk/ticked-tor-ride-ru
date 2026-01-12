import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGameStore } from '@/stores/gameStore';
import { GameState, TrainCardType } from '@/types/game';
import { RealtimeChannel } from '@supabase/supabase-js';

export type GameAction = 
  | { type: 'startDrawingCards' }
  | { type: 'drawTrainCard'; fromFaceUp: boolean; cardIndex?: number }
  | { type: 'cancelDrawingCards' }
  | { type: 'claimRoute'; routeId: string; cardsUsed: TrainCardType[] }
  | { type: 'drawDestinations' }
  | { type: 'keepDestinations'; ticketIds: string[] }
  | { type: 'cancelDestinationDraw' }
  | { type: 'endTurn' };

export type ConnectionStatus = 'connecting' | 'connected' | 'degraded' | 'disconnected' | 'reconnecting';

// Конфигурация синхронизации
const SYNC_CONFIG = {
  INITIAL_RETRY_DELAY: 500,       // Начальная задержка retry (мс)
  MAX_RETRY_DELAY: 5000,          // Максимальная задержка
  RETRY_BACKOFF_MULTIPLIER: 1.5,  // Множитель увеличения задержки
  MAX_RETRIES: 10,                // Максимум попыток
  HOST_BROADCAST_INTERVAL: 5000,  // Периодическая синхронизация хоста (мс)
  HEARTBEAT_INTERVAL: 3000,       // Heartbeat для проверки связи
  RECONNECT_DELAY: 2000,          // Задержка перед переподключением
  MAX_RECONNECT_ATTEMPTS: 5,      // Максимум попыток переподключения
  STALE_THRESHOLD: 15000,         // Порог "устаревшего" состояния (мс)
};

export const useGameSync = (roomId: string | null) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const gameState = useGameStore(state => state.gameState);
  const localPlayerId = useGameStore(state => state.localPlayerId);
  const currentRoom = useGameStore(state => state.currentRoom);
  const setGameState = useGameStore(state => state.setGameState);
  
  // Состояние подключения
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const hostOnlineRef = useRef(false);
  const usingRestFallbackRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const staleCheckTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  
  // Game actions from store (host will execute these)
  const executeStartDrawingCards = useGameStore(state => state.startDrawingCards);
  const executeDrawTrainCard = useGameStore(state => state.drawTrainCard);
  const executeCancelDrawingCards = useGameStore(state => state.cancelDrawingCards);
  const executeClaimRoute = useGameStore(state => state.claimRoute);
  const executeDrawDestinations = useGameStore(state => state.drawDestinations);
  const executeKeepDestinations = useGameStore(state => state.keepDestinations);
  const executeCancelDestinationDraw = useGameStore(state => state.cancelDestinationDraw);
  const executeEndTurn = useGameStore(state => state.endTurn);
  
  const isHost = currentRoom?.hostId === localPlayerId;
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;
  
  const hostIdRef = useRef<string | null>(null);
  hostIdRef.current = currentRoom?.hostId || null;

  // Очистка таймеров
  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const clearStaleCheckTimer = useCallback(() => {
    if (staleCheckTimerRef.current) {
      clearTimeout(staleCheckTimerRef.current);
      staleCheckTimerRef.current = null;
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    clearRetryTimer();
    clearReconnectTimer();
    clearStaleCheckTimer();
  }, [clearRetryTimer, clearReconnectTimer, clearStaleCheckTimer]);

  // Унифицированная отправка broadcast (предпочитаем REST-доставку)
  const sendBroadcast = useCallback(async (event: string, payload: Record<string, any>) => {
    const channel = channelRef.current as any;
    if (!channel) return;

    try {
      if (typeof channel.httpSend === 'function') {
        await channel.httpSend({ type: 'broadcast', event, payload });
        return;
      }
    } catch (e) {
      console.warn('[GameSync] httpSend failed, falling back to send()', e);
    }

    // Помечаем что используем REST fallback
    if (!usingRestFallbackRef.current) {
      usingRestFallbackRef.current = true;
      setConnectionStatus('degraded');
      console.log('[GameSync] Switched to REST fallback mode');
    }

    try {
      await channel.send({ type: 'broadcast', event, payload });
    } catch (e) {
      console.error('[GameSync] send() failed', e);
    }
  }, []);

  // Отправка действия хосту (для не-хостов)
  const sendActionToHost = useCallback((action: GameAction) => {
    if (!channelRef.current || isHostRef.current) return;

    console.log('[GameSync] Sending action to host:', action.type);
    void sendBroadcast('player_action', {
      playerId: localPlayerId,
      action,
    });
  }, [localPlayerId, sendBroadcast]);

  // Запрос синхронизации у хоста с экспоненциальным backoff
  const requestSyncWithRetry = useCallback(() => {
    if (!channelRef.current || isHostRef.current || !mountedRef.current) return;

    const currentGameState = useGameStore.getState().gameState;
    if (currentGameState) {
      // Состояние уже есть, сбрасываем счётчик
      retryCountRef.current = 0;
      clearRetryTimer();
      return;
    }

    if (retryCountRef.current >= SYNC_CONFIG.MAX_RETRIES) {
      console.log('[GameSync] Max retries reached, giving up');
      setConnectionStatus('disconnected');
      return;
    }

    console.log('[GameSync] Requesting sync from host, attempt:', retryCountRef.current + 1);
    void sendBroadcast('request_sync', { 
      playerId: localPlayerId,
      timestamp: Date.now(),
    });

    // Планируем следующую попытку с backoff
    const delay = Math.min(
      SYNC_CONFIG.INITIAL_RETRY_DELAY * Math.pow(SYNC_CONFIG.RETRY_BACKOFF_MULTIPLIER, retryCountRef.current),
      SYNC_CONFIG.MAX_RETRY_DELAY
    );
    retryCountRef.current += 1;

    clearRetryTimer();
    retryTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        requestSyncWithRetry();
      }
    }, delay);
  }, [localPlayerId, sendBroadcast, clearRetryTimer]);

  // Публичный метод запроса синхронизации (сбрасывает счётчик)
  const requestSync = useCallback(() => {
    if (!channelRef.current || isHostRef.current) return;
    
    retryCountRef.current = 0;
    clearRetryTimer();
    setConnectionStatus('reconnecting');
    setReconnectAttempt(prev => prev + 1);
    requestSyncWithRetry();
  }, [requestSyncWithRetry, clearRetryTimer]);

  // Автоматическое переподключение при потере связи
  const attemptReconnect = useCallback(() => {
    if (!roomId || !localPlayerId || isHostRef.current || !mountedRef.current) return;

    if (reconnectAttemptsRef.current >= SYNC_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.log('[GameSync] Max reconnect attempts reached');
      setConnectionStatus('disconnected');
      return;
    }

    reconnectAttemptsRef.current += 1;
    setReconnectAttempt(reconnectAttemptsRef.current);
    setConnectionStatus('reconnecting');
    
    console.log('[GameSync] Attempting reconnect, attempt:', reconnectAttemptsRef.current);
    
    // Пересоздаём канал
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Небольшая задержка перед переподключением
    clearReconnectTimer();
    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        // Эффект перезапустится из-за изменения зависимости
        retryCountRef.current = 0;
        requestSyncWithRetry();
      }
    }, SYNC_CONFIG.RECONNECT_DELAY);
  }, [roomId, localPlayerId, requestSyncWithRetry, clearReconnectTimer]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!roomId || !localPlayerId) {
      console.log('[GameSync] No roomId or localPlayerId, skipping');
      return;
    }

    console.log('[GameSync] Setting up channel for room:', roomId, 'player:', localPlayerId, 'isHost:', isHostRef.current);

    setConnectionStatus('connecting');
    retryCountRef.current = 0;

    // Создаём канал для синхронизации
    const channel = supabase.channel(`game-sync-${roomId}`, {
      config: {
        presence: {
          key: localPlayerId,
        },
        broadcast: {
          self: false,
        },
      },
    });

    const sendFromChannel = async (event: string, payload: Record<string, any>) => {
      const ch = channel as any;
      try {
        if (typeof ch.httpSend === 'function') {
          await ch.httpSend({ type: 'broadcast', event, payload });
          return;
        }
      } catch (e) {
        console.warn('[GameSync] httpSend failed (channel), falling back to send()', e);
      }
      if (!usingRestFallbackRef.current) {
        usingRestFallbackRef.current = true;
        setConnectionStatus('degraded');
        console.log('[GameSync] Switched to REST fallback mode');
      }
      await ch.send({ type: 'broadcast', event, payload });
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        console.log('[GameSync] Presence sync event, state:', Object.keys(presenceState));
        
        const hostId = hostIdRef.current;
        if (!hostId) {
          console.log('[GameSync] No hostId found');
          return;
        }

        // Если мы хост, статус всегда "connected"
        if (isHostRef.current) {
          console.log('[GameSync] We are host, ignoring presence sync');
          setConnectionStatus('connected');
          return;
        }

        // Ищем presence хоста
        const hostPresences = presenceState[hostId];
        if (hostPresences && hostPresences.length > 0) {
          hostOnlineRef.current = true;
          setConnectionStatus(prev => prev === 'connecting' ? 'connected' : prev);
          
          const hostPresence = hostPresences[0] as any;
          if (hostPresence?.gameState) {
            try {
              const parsedState = JSON.parse(hostPresence.gameState) as GameState;
              console.log('[GameSync] Received state from presence, currentPlayer:', parsedState.currentPlayerId, 'turn:', parsedState.turnNumber);
              setGameState(parsedState);
              setLastSyncTime(Date.now());
              
              // Успешно получили состояние, останавливаем retry
              retryCountRef.current = 0;
              clearRetryTimer();
            } catch (e) {
              console.error('[GameSync] Error parsing game state:', e);
            }
          }
        } else {
          hostOnlineRef.current = false;
          setConnectionStatus('disconnected');
          console.log('[GameSync] Host not found in presence, waiting...');
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('[GameSync] Player joined presence:', key);
        
        // Хост сразу отправляет состояние новому игроку
        if (isHostRef.current) {
          const currentGameState = useGameStore.getState().gameState;
          if (currentGameState) {
            console.log('[GameSync] Host sending state to new player via broadcast');
            void sendFromChannel('game_state_update', {
              gameState: JSON.stringify(currentGameState),
              timestamp: Date.now(),
            });
          }
        }
      })
      // Слушаем запросы на синхронизацию от переподключившихся игроков
      .on('broadcast', { event: 'request_sync' }, (payload) => {
        if (!isHostRef.current) return;

        const { playerId: requestingPlayerId } = payload.payload as { playerId: string; timestamp: number };
        console.log('[GameSync] Host received sync request from player:', requestingPlayerId);

        // Отправляем текущее состояние игры через broadcast (надёжнее чем presence)
        const currentGameState = useGameStore.getState().gameState;
        if (currentGameState) {
          // Отправляем адресно
          void sendFromChannel('sync_response', {
            targetPlayerId: requestingPlayerId,
            gameState: JSON.stringify(currentGameState),
            timestamp: Date.now(),
          });
          
          // Также обновляем presence для всех
          channel.track({
            gameState: JSON.stringify(currentGameState),
            updatedAt: Date.now(),
            isHost: true,
          });
          
          console.log('[GameSync] Host sent sync response to player:', requestingPlayerId);
        }
      })
      // Слушаем ответы на запрос синхронизации
      .on('broadcast', { event: 'sync_response' }, (payload) => {
        if (isHostRef.current) return;
        
        const { targetPlayerId, gameState: gameStateStr, timestamp } = payload.payload as { 
          targetPlayerId: string; 
          gameState: string;
          timestamp: number;
        };
        
        // Проверяем, что ответ для нас
        if (targetPlayerId !== localPlayerId) return;
        
        try {
          const parsedState = JSON.parse(gameStateStr) as GameState;
          console.log('[GameSync] Received sync response, currentPlayer:', parsedState.currentPlayerId, 'turn:', parsedState.turnNumber);
          setGameState(parsedState);
          setLastSyncTime(timestamp);
          setConnectionStatus('connected');
          
          // Успешно, останавливаем retry
          retryCountRef.current = 0;
          clearRetryTimer();
        } catch (e) {
          console.error('[GameSync] Error parsing sync response:', e);
        }
      })
      // Слушаем broadcast обновлений состояния от хоста (дополнительный канал)
      .on('broadcast', { event: 'game_state_update' }, (payload) => {
        if (isHostRef.current) return;
        
        const { gameState: gameStateStr, timestamp } = payload.payload as { 
          gameState: string;
          timestamp: number;
        };
        
        try {
          const parsedState = JSON.parse(gameStateStr) as GameState;
          const currentState = useGameStore.getState().gameState;
          
          // Принимаем обновление если оно новее или если у нас нет состояния
          if (!currentState || parsedState.turnNumber >= currentState.turnNumber) {
            console.log('[GameSync] Received broadcast state update, turn:', parsedState.turnNumber);
            setGameState(parsedState);
            setLastSyncTime(timestamp);
            setConnectionStatus('connected');
            
            retryCountRef.current = 0;
            clearRetryTimer();
          }
        } catch (e) {
          console.error('[GameSync] Error parsing broadcast state:', e);
        }
      })
      // Хост слушает действия от других игроков
      .on('broadcast', { event: 'player_action' }, (payload) => {
        if (!isHostRef.current) return;
        
        const { playerId, action } = payload.payload as { playerId: string; action: GameAction };
        console.log('[GameSync] Host received action from player:', playerId, 'action:', action.type);
        
        // Проверяем, что действие от текущего активного игрока
        const currentState = useGameStore.getState().gameState;
        if (!currentState || currentState.currentPlayerId !== playerId) {
          console.log('[GameSync] Ignoring action - not from current player');
          return;
        }
        
        // Временно подменяем localPlayerId для выполнения действия
        const originalPlayerId = useGameStore.getState().localPlayerId;
        useGameStore.setState({ localPlayerId: playerId });
        
        // Выполняем действие
        switch (action.type) {
          case 'startDrawingCards':
            executeStartDrawingCards();
            break;
          case 'drawTrainCard':
            executeDrawTrainCard(action.fromFaceUp, action.cardIndex);
            break;
          case 'cancelDrawingCards':
            executeCancelDrawingCards();
            break;
          case 'claimRoute':
            executeClaimRoute(action.routeId, action.cardsUsed);
            break;
          case 'drawDestinations':
            executeDrawDestinations();
            break;
          case 'keepDestinations':
            executeKeepDestinations(action.ticketIds);
            break;
          case 'cancelDestinationDraw':
            executeCancelDestinationDraw();
            break;
          case 'endTurn':
            executeEndTurn();
            break;
        }
        
        // Восстанавливаем localPlayerId
        useGameStore.setState({ localPlayerId: originalPlayerId });
        
        // После выполнения действия сразу рассылаем обновлённое состояние
        const updatedState = useGameStore.getState().gameState;
        if (updatedState) {
          void sendFromChannel('game_state_update', {
            gameState: JSON.stringify(updatedState),
            timestamp: Date.now(),
          });
        }
      })
      .subscribe(async (status) => {
        console.log('[GameSync] Subscription status:', status);

        if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log('[GameSync] Connection lost, attempting reconnect...');
          setConnectionStatus('disconnected');
          
          // Автоматически пытаемся переподключиться (для не-хостов)
          if (!isHostRef.current && mountedRef.current) {
            clearReconnectTimer();
            reconnectTimerRef.current = setTimeout(() => {
              if (mountedRef.current && reconnectAttemptsRef.current < SYNC_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                attemptReconnect();
              }
            }, SYNC_CONFIG.RECONNECT_DELAY);
          }
          return;
        }

        if (status === 'SUBSCRIBED') {
          // Хост всегда считает себя подключенным
          if (isHostRef.current) {
            setConnectionStatus('connected');
          }

          // Все клиенты должны track-аться в presence
          if (!isHostRef.current) {
            await channel.track({
              updatedAt: Date.now(),
              isHost: false,
            });

            // Запрашиваем состояние у хоста при подключении
            const currentGameState = useGameStore.getState().gameState;
            if (!currentGameState) {
              console.log('[GameSync] No local gameState, starting sync requests');
              // Небольшая задержка перед первым запросом
              setTimeout(() => {
                if (mountedRef.current) {
                  requestSyncWithRetry();
                }
              }, 300);
            }
          }

          // Если мы хост и есть состояние игры, транслируем его
          const currentGameState = useGameStore.getState().gameState;
          if (isHostRef.current && currentGameState) {
            console.log('[GameSync] Host broadcasting initial state');
            await channel.track({
              gameState: JSON.stringify(currentGameState),
              updatedAt: Date.now(),
              isHost: true,
            });
            
            // Также отправляем через broadcast для надёжности
            void sendFromChannel('game_state_update', {
              gameState: JSON.stringify(currentGameState),
              timestamp: Date.now(),
            });
          }
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[GameSync] Cleaning up channel');
      mountedRef.current = false;
      clearAllTimers();
      supabase.removeChannel(channel);
      channelRef.current = null;
      setConnectionStatus('disconnected');
    };
  }, [roomId, localPlayerId, setGameState, executeStartDrawingCards, executeDrawTrainCard, executeCancelDrawingCards, executeClaimRoute, executeDrawDestinations, executeKeepDestinations, executeCancelDestinationDraw, executeEndTurn, requestSyncWithRetry, clearAllTimers, attemptReconnect, clearReconnectTimer]);

  // Транслируем изменения состояния игры (только хост) через broadcast + presence
  useEffect(() => {
    if (gameState && isHostRef.current && channelRef.current) {
      console.log('[GameSync] Host broadcasting updated state, turn:', gameState.turnNumber, 'currentPlayer:', gameState.currentPlayerId);
      
      // Обновляем presence
      channelRef.current.track({
        gameState: JSON.stringify(gameState),
        updatedAt: Date.now(),
        isHost: true,
      });
      
      // Также отправляем через broadcast для надёжности
      void sendBroadcast('game_state_update', {
        gameState: JSON.stringify(gameState),
        timestamp: Date.now(),
      });
    }
  }, [gameState, sendBroadcast]);

  // Периодическая синхронизация от хоста (каждые 5 секунд)
  useEffect(() => {
    if (!isHost || !channelRef.current) return;

    const interval = setInterval(() => {
      const currentGameState = useGameStore.getState().gameState;
      if (currentGameState && channelRef.current) {
        console.log('[GameSync] Host periodic sync, turn:', currentGameState.turnNumber);
        
        channelRef.current.track({
          gameState: JSON.stringify(currentGameState),
          updatedAt: Date.now(),
          isHost: true,
        });
        
        void sendBroadcast('game_state_update', {
          gameState: JSON.stringify(currentGameState),
          timestamp: Date.now(),
        });
      }
    }, SYNC_CONFIG.HOST_BROADCAST_INTERVAL);

    return () => clearInterval(interval);
  }, [isHost, sendBroadcast]);

  // Проверка "устаревшего" состояния для не-хостов
  useEffect(() => {
    if (isHost || !lastSyncTime) return;

    const checkStale = () => {
      const timeSinceSync = Date.now() - (lastSyncTime || 0);
      if (timeSinceSync > SYNC_CONFIG.STALE_THRESHOLD && mountedRef.current) {
        console.log('[GameSync] State is stale, requesting sync...');
        setConnectionStatus('degraded');
        requestSync();
      }
    };

    clearStaleCheckTimer();
    staleCheckTimerRef.current = setTimeout(checkStale, SYNC_CONFIG.STALE_THRESHOLD);

    return () => clearStaleCheckTimer();
  }, [isHost, lastSyncTime, requestSync, clearStaleCheckTimer]);

  return { 
    sendActionToHost, 
    requestSync, 
    attemptReconnect,
    isHost, 
    connectionStatus, 
    lastSyncTime,
    reconnectAttempt,
  };
};