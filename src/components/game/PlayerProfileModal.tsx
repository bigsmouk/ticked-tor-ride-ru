import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Player, PlayerColor } from '@/types/game';
import { Crown, LogOut, UserX } from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  isLocalPlayer: boolean;
  isOnline: boolean;
  canKick: boolean;
  onInitiateKick?: (playerId: string) => void;
}

const PLAYER_COLORS: Record<PlayerColor, { bg: string; border: string }> = {
  red: { bg: 'hsl(0 70% 50%)', border: 'hsl(0 60% 35%)' },
  blue: { bg: 'hsl(210 75% 50%)', border: 'hsl(210 65% 35%)' },
  green: { bg: 'hsl(140 55% 45%)', border: 'hsl(140 50% 30%)' },
  yellow: { bg: 'hsl(48 90% 55%)', border: 'hsl(45 80% 35%)' },
  black: { bg: 'hsl(0 0% 25%)', border: 'hsl(0 0% 10%)' },
};

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  isHost,
  isLocalPlayer,
  isOnline,
  canKick,
  onInitiateKick,
}) => {
  if (!player) return null;

  const colors = PLAYER_COLORS[player.color];

  const handleKickClick = () => {
    if (onInitiateKick) {
      onInitiateKick(player.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-sidebar border-ornament">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            Профиль игрока
            {isHost && <Crown className="w-4 h-4 text-gold" />}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Avatar */}
          <div className="relative">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: `4px solid ${colors.border}` }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-display text-3xl font-bold"
                style={{
                  background: 'hsl(40 30% 90%)',
                  border: `4px solid ${colors.border}`,
                  color: colors.border,
                }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Online indicator */}
            <div
              className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 ${
                isOnline ? 'bg-green-500 border-green-600' : 'bg-gray-400 border-gray-500'
              }`}
              title={isOnline ? 'Онлайн' : 'Оффлайн'}
            />
          </div>

          {/* Name and color */}
          <div className="text-center">
            <h3 className="font-display text-xl font-bold">{player.name}</h3>
            <div
              className="mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block text-white"
              style={{ background: colors.bg }}
            >
              {player.color === 'red' && 'Красный'}
              {player.color === 'blue' && 'Синий'}
              {player.color === 'green' && 'Зелёный'}
              {player.color === 'yellow' && 'Жёлтый'}
              {player.color === 'black' && 'Чёрный'}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            <div className="text-center p-3 bg-background rounded-lg border border-ornament/30">
              <div className="text-2xl font-bold text-gold">{player.score}</div>
              <div className="text-xs text-muted-foreground">Очки</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border border-ornament/30">
              <div className="text-2xl font-bold">{player.trainsRemaining}</div>
              <div className="text-xs text-muted-foreground">Вагоны</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg border border-ornament/30">
              <div className="text-2xl font-bold">{player.destinationTickets.length}</div>
              <div className="text-xs text-muted-foreground">Маршруты</div>
            </div>
          </div>

          {/* Actions */}
          {!isLocalPlayer && canKick && (
            <Button
              variant="destructive"
              onClick={handleKickClick}
              className="gap-2"
            >
              <UserX className="w-4 h-4" />
              Голосовать за исключение
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
