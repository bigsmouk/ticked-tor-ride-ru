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

interface LeaveGameButtonProps {
  onLeave?: () => void;
}

export const LeaveGameButton: React.FC<LeaveGameButtonProps> = ({ onLeave }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { currentRoom, leaveRoom, addLog, localPlayerId, gameState } = useGameStore();
  const { leaveRoom: leaveRoomFromDb } = useMultiplayer();
  const { sendActionToHost, isHost } = useGameSyncContext();

  const handleLeaveClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLeave = async () => {
    const localPlayer = gameState?.players.find(p => p.id === localPlayerId);
    const playerName = localPlayer?.name || 'Игрок';

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
