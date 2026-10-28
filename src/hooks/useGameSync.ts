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
  | { type: 'attemptClaimTunnel'; routeId: string; cardsUsed: TrainCardType[] }
  | { type: 'confirmTunnelClaim'; extraCards: TrainCardType[] }
  | { type: 'cancelTunnelClaim' }
  | { type: 'drawDestinations' }
  | { type: 'keepDestinations'; ticketIds: string[] }
  | { type: 'cancelDestinationDraw' }
  | { type: 'endTurn' }
  | { type: 'playerLeft'; playerId: string; playerName: string }
  | { type: 'initiateKickVote'; targetPlayerId: string; initiatorId: string }
  | { type: 'castKickVote'; targetPlayerId: string; voterId: string; approve: boolean }
  | { type: 'startBuildStation' }
  | { type: 'buildStation'; cityId: string; cardsUsed: TrainCardType[] }
  | { type: 'cancelBuildStation' };

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
  const pendingActionsRef = useRef(new Map<string, { action: GameAction; retries: number; timer: ReturnType<typeof setTimeout> | null }>());
  const processedActionsRef = useRef(new Set<string>());
  const actionSequenceRef = useRef(0);
  
  // Game actions from store (host will execute these)
  const executeStartDrawingCards = useGameStore(state => state.startDrawingCards);
  const executeDrawTrainCard = useGameStore(state => state.drawTrainCard);
  const executeCancelDrawingCards = useGameStore(state => state.cancelDrawingCards);
  const executeClaimRoute = useGameStore(state => state.claimRoute);
  const executeDrawDestinations = useGameStore(state => state.drawDestinations);
  const executeKeepDestinations = useGameStore(state => state.keepDestinations);
  const executeCancelDestinationDraw = useGameStore(state => state.cancelDestinationDraw);
  const executeEndTurn = useGameStore(state => state.endTurn);
  const executeRemovePlayer = useGameStore(state => state.removePlayer);
  const executeAddLog = useGameStore(state => state.addLog);
  const executeInitiateKickVote = useGameStore(state => state.initiateKickVote);
  const executeCastKickVote = useGameStore(state => state.castKickVote);
  
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
    pendingActionsRef.current.forEach(item => { if (item.timer) clearTimeout(item.timer); });
    pendingActionsRef.current.clear();
  }, [clearRetryTimer, clearReconnectTimer, clearStaleCheckTimer]);

  // Отправляем игровые события только через активный Realtime-канал.
  // REST fallback не подтверждает получение события другим клиентом.
  // Унифицированная отправка broadcast
  const sendBroadcast = useCallback(async (
  event: string,
  payload: Record<string, unknown>
) => {
  const channel = channelRef.current;

  if (!channel || channel.state !== 'joined') {
    console.warn('[GameSync] Broadcast skipped: realtime channel is not joined', { event, state: channel?.state });
    if (mountedRef.current) setConnectionStatus('disconnected');
    return;
  }

  console.log('[GameSync DEBUG] Sending broadcast:', {
    event,
    channelState: channel.state,
    payload,
  });

  try {
    const status = await channel.send({
      type: 'broadcast',
      event,
      payload,
    });

    console.log('[GameSync DEBUG] Broadcast result:', {
      event,
      status,
      channelState: channel.state,
    });

    if (status !== 'ok') {
      console.error('[GameSync DEBUG] Broadcast was not acknowledged:', status);
    }
  } catch (error) {
    console.error('[GameSync DEBUG] Broadcast error:', error);
  }
}, []);

  // Действие повторяется с тем же ID до подтверждения хостом.
  // Хост дедуплицирует ID, поэтому повтор не выполняет ход дважды.
  const dispatchPendingAction = useCallback((actionId: string) => {
    const pending = pendingActionsRef.current.get(actionId);
    if (!pending || !mountedRef.current) return;
    if (pending.timer) clearTimeout(pending.timer);
    const channel = channelRef.current;
    if (channel?.state === 'joined') {
      void sendBroadcast('player_action', {
        playerId: localPlayerId,
        actionId,
        action: pending.action,
      });
      pending.retries += 1;
    }
    if (pending.retries >= 12) {
      console.error('[GameSync] Action not acknowledged by host:', actionId, pending.action.type);
      pendingActionsRef.current.delete(actionId);
      setConnectionStatus('degraded');
      return;
    }
    pending.timer = setTimeout(() => dispatchPendingAction(actionId), 2000);
  }, [localPlayerId, sendBroadcast]);

  const sendActionToHost = useCallback((action: GameAction) => {
    if (isHostRef.current || !localPlayerId) return;
    const actionId = `${localPlayerId}-${Date.now()}-${++actionSequenceRef.current}`;
    pendingActionsRef.current.set(actionId, { action, retries: 0, timer: null });
    dispatchPendingAction(actionId);
  }, [localPlayerId, dispatchPendingAction]);

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
  if (!roomId || !localPlayerId || !mountedRef.current) return;

  if (reconnectAttemptsRef.current >= SYNC_CONFIG.MAX_RECONNECT_ATTEMPTS) {
    console.error('[GameSync] Max reconnect attempts reached');
    setConnectionStatus('disconnected');
    return;
  }

  reconnectAttemptsRef.current += 1;

  console.log(
    '[GameSync] Scheduling channel reconnect, attempt:',
    reconnectAttemptsRef.current
  );

  setConnectionStatus('reconnecting');
  setReconnectAttempt(prev => prev + 1);
}, [roomId, localPlayerId]);

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

    const sendFromChannel = async (
  event: string,
  payload: Record<string, unknown>
) => {
  const ch = channel;
      if (ch.state !== 'joined') {
        console.warn('[GameSync] Skipping broadcast on inactive channel:', event, ch.state);
        return;
      }
      try {
        if (typeof ch.httpSend === 'function') {
          await ch.httpSend(event, payload);
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
          if (channel.state === 'joined') setConnectionStatus('connected');
          return;
        }

        // Ищем presence хоста
        const hostPresences = presenceState[hostId];
        if (hostPresences && hostPresences.length > 0) {
          hostOnlineRef.current = true;
          setConnectionStatus(prev => prev === 'connecting' ? 'connected' : prev);
          
          const hostPresence = hostPresences[0] as {
  gameState?: string;
};
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
      .on('broadcast', { event: 'action_ack' }, ({ payload }) => {
        if (payload.targetPlayerId !== localPlayerId) return;
        const pending = pendingActionsRef.current.get(payload.actionId as string);
        if (!pending) return;
        if (pending.timer) clearTimeout(pending.timer);
        pendingActionsRef.current.delete(payload.actionId as string);
        if (payload.accepted === false) {
          console.warn('[GameSync] Host rejected action:', payload.actionId, payload.reason);
          setConnectionStatus('degraded');
          void sendBroadcast('request_sync', { playerId: localPlayerId, timestamp: Date.now() });
        }
      })
      .on('broadcast', { event: 'player_action' }, (payload) => {
        if (!isHostRef.current || channel.state !== 'joined') return;
        
        const { playerId, action, actionId } = payload.payload as { playerId: string; action: GameAction; actionId?: string };
        if (!playerId || !action?.type) return;
        const acknowledge = (accepted: boolean, reason?: string) => {
          if (actionId) void sendFromChannel('action_ack', { actionId, targetPlayerId: playerId, accepted, reason });
        };
        if (actionId && processedActionsRef.current.has(actionId)) {
          acknowledge(true);
          return;
        }
        console.log('[GameSync] Host received action from player:', playerId, 'action:', action.type);
	console.log('[GameSync DEBUG] Action received:', {
  	 senderPlayerId: playerId,
	 actionType: action.type,
  	 hostPlayerId: localPlayerId,
	 isHost: isHostRef.current,
	});
        
        const currentState = useGameStore.getState().gameState;
	console.log('[GameSync DEBUG] Current turn:', {
  	 currentPlayerId: currentState?.currentPlayerId,
  	 turnNumber: currentState?.turnNumber,
  	 senderMatchesCurrentPlayer: currentState?.currentPlayerId === playerId,
	});
        if (!currentState) {
          console.log('[GameSync] Ignoring action - no game state');
          acknowledge(false, 'no_game_state');
          return;
        }
        
        // Действия playerLeft, initiateKickVote и castKickVote могут приходить от любого игрока
        const allowedFromAnyPlayer = ['playerLeft', 'initiateKickVote', 'castKickVote'];
        if (!allowedFromAnyPlayer.includes(action.type)) {
          // Проверяем, что действие от текущего активного игрока
          if (currentState.currentPlayerId !== playerId) {
            console.log('[GameSync] Ignoring action - not from current player');
            acknowledge(false, 'not_current_player');
            return;
          }
        }
        
        // Временно подменяем localPlayerId для выполнения действия.
        // Восстанавливаем его даже при исключении в обработчике.
        const originalPlayerId = useGameStore.getState().localPlayerId;
        useGameStore.setState({ localPlayerId: playerId });
        try {
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
          case 'attemptClaimTunnel':
            useGameStore.getState().attemptClaimTunnel(action.routeId, action.cardsUsed);
            break;
          case 'confirmTunnelClaim':
            useGameStore.getState().confirmTunnelClaim(action.extraCards);
            break;
          case 'cancelTunnelClaim':
            useGameStore.getState().cancelTunnelClaim();
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
          case 'playerLeft':
            executeRemovePlayer(action.playerId, action.playerName);
            break;
          case 'initiateKickVote':
            executeInitiateKickVote(action.targetPlayerId, action.initiatorId);
            break;
          case 'castKickVote':
            executeCastKickVote(action.voterId, action.approve);
            break;
          case 'startBuildStation':
            useGameStore.getState().startBuildStation();
            break;
          case 'buildStation':
            useGameStore.getState().buildStation(action.cityId, action.cardsUsed);
            break;
          case 'cancelBuildStation':
            useGameStore.getState().cancelBuildStation();
            break;
        }
        
        } catch (error) {
          console.error('[GameSync] Failed to process remote action:', action.type, error);
          acknowledge(false, 'processing_failed');
          return;
        } finally {
          useGameStore.setState({ localPlayerId: originalPlayerId });
        }
        
        if (actionId) {
          processedActionsRef.current.add(actionId);
          if (processedActionsRef.current.size > 500) {
            const oldest = processedActionsRef.current.values().next().value;
            if (oldest) processedActionsRef.current.delete(oldest);
          }
        }
        acknowledge(true);
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
          if (mountedRef.current) {
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
          reconnectAttemptsRef.current = 0;
          usingRestFallbackRef.current = false;
          setConnectionStatus('connected');
          // Хост всегда считает себя подключенным
          if (isHostRef.current) {
            setConnectionStatus('connected');
          }

          // Все клиенты должны track-аться в presence
          if (!isHostRef.current) {
            pendingActionsRef.current.forEach((_, actionId) => dispatchPendingAction(actionId));
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
  }, [roomId, localPlayerId, dispatchPendingAction, setGameState, executeStartDrawingCards, executeDrawTrainCard, executeCancelDrawingCards, executeClaimRoute, executeDrawDestinations, executeKeepDestinations, executeCancelDestinationDraw, executeEndTurn, executeRemovePlayer, executeInitiateKickVote, executeCastKickVote, requestSyncWithRetry, clearAllTimers, attemptReconnect, clearReconnectTimer, reconnectAttempt, clearRetryTimer]);

  // Транслируем изменения состояния игры (только хост) через broadcast + presence
  useEffect(() => {
    if (gameState && isHostRef.current && channelRef.current?.state === 'joined') {
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
      if (currentGameState && channelRef.current?.state === 'joined') {
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