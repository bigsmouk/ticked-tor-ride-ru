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

  // Сохраняем историю для игрока который выходит
  const saveMatchHistoryForLeavingPlayer = async () => {
    console.log('[LeaveGame] Starting save...', { 
      hasGameState: !!gameState, 
      hasRoom: !!currentRoom, 
      hasProfile: !!profile,
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
      const localPlayer = gameState.players.find(p => p.id === localPlayerId);
      if (!localPlayer) {
        console.log('[LeaveGame] Local player not found');
        return;
      }

      console.log('[LeaveGame] Saving match for player:', localPlayer.name);

      // Создаём запись матча для вышедшего игрока
      const { data: matchData, error: matchError } = await supabase
        .from('match_history')
        .insert({
          room_id: null, // Не привязываем к комнате, чтобы обойти RLS 
          room_name: currentRoom.name,
          player_count: gameState.players.length,
          game_data: {
            turnNumber: gameState.turnNumber,
            finishedAt: new Date().toISOString(),
            endReason: 'left_game',
          },
        })
        .select()
        .single();

      if (matchError) {
        console.error('[LeaveGame] Error saving match:', matchError);
        return;
      }

      console.log('[LeaveGame] Match created:', matchData.id);

      // Гарантируем profile_id (без него матч не попадёт в историю/статистику)
      let profileId: string | null = profile?.id ?? null;
      if (!profileId && user) {
        console.log('[LeaveGame] profile not loaded yet, refreshing...');
        const refreshed = await refreshProfile();
        profileId = refreshed?.id ?? null;
      }

      // Сохраняем запись для текущего игрока
      const { error: playerError } = await supabase
        .from('match_players')
        .insert({
          match_id: matchData.id,
          profile_id: profileId,
          player_name: localPlayer.name,
          player_color: localPlayer.color,
          final_score: localPlayer.score,
          route_points: localPlayer.score,
          ticket_points: 0,
          longest_path_bonus: 0,
          tickets_completed: 0,
          tickets_failed: 0,
          is_winner: false,
          placement: 0, // 0 = покинул игру
        });

      if (playerError) {
        console.error('[LeaveGame] Error saving player record:', playerError);
      } else {
        console.log('[LeaveGame] Match history saved successfully for:', localPlayer.name);
      }
    } catch (error) {
      console.error('[LeaveGame] Error:', error);
    }
  };

  const handleConfirmLeave = async () => {
    const localPlayer = gameState?.players.find(p => p.id === localPlayerId);
    const playerName = localPlayer?.name || 'Игрок';

    // Сохраняем историю матча для вышедшего игрока
    await saveMatchHistoryForLeavingPlayer();

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
            <AlertDialogTitle className="font-display">Покинуть игру?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите выйти из игры? Игра продолжится без вас, 
              и ваши ходы будут пропускаться.
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
