import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LogOut } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useGameSyncContext } from '@/contexts/gameSyncContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaveGameButtonProps {
  onLeave?: () => void;
}

export const LeaveGameButton: React.FC<LeaveGameButtonProps> = ({ onLeave }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { currentRoom, leaveRoom, addLog, localPlayerId, gameState } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const { sendActionToHost, isHost } = useGameSyncContext();
  const { user, profile, refreshProfile } = useAuth();

  const handleLeaveClick = () => {
    setShowConfirm(true);
  };

  // Сохраняем историю через серверную функцию (надёжнее — работает даже если браузер закрылся)
  // НЕ сохраняем для соло-игр (они не учитываются в статистике)
  const saveMatchHistoryViaServer = async () => {
    // Пропускаем для соло-режима
    if (currentRoom?.isSoloMode) {
      console.log('[LeaveGame] Solo mode, skipping server save');
      return;
    }
    
    console.log('[LeaveGame] Starting server save...', { 
      hasGameState: !!gameState, 
      hasRoom: !!currentRoom, 
      turnNumber: gameState?.turnNumber,
      phase: gameState?.phase
    });
    
    if (!gameState || !currentRoom) {
      console.log('[LeaveGame] No gameState or currentRoom, skipping');
      return;
    }
    
    // Сохраняем только если игра началась (фаза playing или finished)
    if (gameState.phase !== 'playing' && gameState.phase !== 'finished') {
      console.log('[LeaveGame] Game not in playing/finished phase, skipping');
      return;
    }
    
    try {
      console.log('[LeaveGame] Calling finalize-match edge function...');
      
      const { data, error } = await supabase.functions.invoke('finalize-match', {
        body: {
          roomId: currentRoom.id,
          roomName: currentRoom.name,
          leavingPlayerId: localPlayerId,
          gameState: {
            roomId: gameState.roomId,
            phase: gameState.phase,
            turnNumber: gameState.turnNumber,
            players: gameState.players.map(p => ({
              id: p.id,
              name: p.name,
              color: p.color,
              score: p.score,
            })),
            logs: gameState.logs.slice(-5), // Только последние 5 записей
            winnerId: gameState.winnerId,
            finalScores: gameState.finalScores,
          },
        },
      });

      if (error) {
        console.error('[LeaveGame] Edge function error:', error);
      } else {
        console.log('[LeaveGame] Server saved match:', data);
      }
    } catch (error) {
      console.error('[LeaveGame] Error calling edge function:', error);
    }
  };

  const handleConfirmLeave = async () => {
    const localPlayer = gameState?.players.find(p => p.id === localPlayerId);
    const playerName = localPlayer?.name || 'Игрок';

    // Сохраняем историю матча через серверную функцию
    await saveMatchHistoryViaServer();

    // Добавляем запись в лог через синхронизацию
    if (isHost) {
      addLog(localPlayerId || undefined, 'Покинул игру', playerName);
    } else {
      sendActionToHost({ 
        type: 'playerLeft', 
        playerId: localPlayerId || '',
        playerName 
      });
    }

    // Выходим из комнаты
    if (currentRoom?.id) {
      await leaveRoomFromDb(currentRoom.id);
    }
    leaveRoom();

    // Вызываем колбэк если есть
    onLeave?.();

    // Переходим на главную
    navigate('/?noRecover=1');
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLeaveClick}
        className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Выйти</span>
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-sidebar border-ornament">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {currentRoom?.isSoloMode ? 'Завершить тренировку?' : 'Покинуть игру?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentRoom?.isSoloMode 
                ? 'Вы уверены, что хотите завершить соло-игру?'
                : 'Вы уверены, что хотите выйти из игры? Игра продолжится без вас, и ваши ходы будут пропускаться.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Остаться</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className="bg-destructive hover:bg-destructive/90"
            >
              Выйти из игры
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
