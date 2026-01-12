import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Player } from '@/types/game';
import { Check, X, Clock } from 'lucide-react';

export interface KickVote {
  targetPlayerId: string;
  targetPlayerName: string;
  initiatorId: string;
  votes: Record<string, boolean>; // playerId -> true/false
  expiresAt: number; // timestamp
}

interface KickVoteModalProps {
  vote: KickVote | null;
  players: Player[];
  localPlayerId: string;
  isOpen: boolean;
  onVote: (approve: boolean) => void;
  onClose: () => void;
}

const VOTE_DURATION_SECONDS = 30;

export const KickVoteModal: React.FC<KickVoteModalProps> = ({
  vote,
  players,
  localPlayerId,
  isOpen,
  onVote,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(VOTE_DURATION_SECONDS);

  useEffect(() => {
    if (!vote || !isOpen) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((vote.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [vote, isOpen]);

  if (!vote) return null;

  const targetPlayer = players.find(p => p.id === vote.targetPlayerId);
  const hasVoted = vote.votes[localPlayerId] !== undefined;
  const isTarget = localPlayerId === vote.targetPlayerId;

  // Count votes
  const voteEntries = Object.entries(vote.votes);
  const approveCount = voteEntries.filter(([, v]) => v).length;
  const rejectCount = voteEntries.filter(([, v]) => !v).length;
  const totalVoters = players.length - 1; // Exclude target player
  const votedCount = voteEntries.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-sidebar border-ornament">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            ⚠️ Голосование за исключение
          </DialogTitle>
          <DialogDescription>
            {isTarget 
              ? 'Игроки голосуют за ваше исключение из игры'
              : `Голосование за исключение игрока "${targetPlayer?.name}"`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Target player info */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-ornament/30">
            {targetPlayer?.avatarUrl ? (
              <img
                src={targetPlayer.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-display text-lg font-bold">
                {targetPlayer?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold">{targetPlayer?.name}</div>
              <div className="text-sm text-muted-foreground">
                Очки: {targetPlayer?.score} | Вагоны: {targetPlayer?.trainsRemaining}
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Осталось времени
              </span>
              <span className="font-mono font-bold">{timeLeft}с</span>
            </div>
            <Progress value={(timeLeft / VOTE_DURATION_SECONDS) * 100} />
          </div>

          {/* Vote counts */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-lg font-bold text-green-500">{approveCount}</div>
              <div className="text-xs text-muted-foreground">За</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-lg font-bold text-red-500">{rejectCount}</div>
              <div className="text-xs text-muted-foreground">Против</div>
            </div>
            <div className="p-2 bg-muted rounded-lg border border-ornament/30">
              <div className="text-lg font-bold">{votedCount}/{totalVoters}</div>
              <div className="text-xs text-muted-foreground">Голосов</div>
            </div>
          </div>

          {/* Vote buttons */}
          {!isTarget && !hasVoted && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={() => onVote(true)}
              >
                <Check className="w-4 h-4" />
                Исключить
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => onVote(false)}
              >
                <X className="w-4 h-4" />
                Оставить
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className="text-center text-muted-foreground">
              Вы уже проголосовали: {vote.votes[localPlayerId] ? 'За исключение' : 'Против'}
            </div>
          )}

          {isTarget && (
            <div className="text-center text-muted-foreground">
              Вы не можете голосовать в этом голосовании
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const VOTE_DURATION_MS = VOTE_DURATION_SECONDS * 1000;
