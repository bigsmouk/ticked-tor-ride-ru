import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Player, KickVote } from '@/types/game';
import { Check, X, Clock, Users } from 'lucide-react';

const VOTE_DURATION_SECONDS = 30;

interface KickVoteModalProps {
  vote: KickVote | null;
  players: Player[];
  localPlayerId: string;
  isOpen: boolean;
  onVote: (approve: boolean) => void;
  onClose: () => void;
}

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

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((vote.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [vote, isOpen]);

  if (!vote) return null;

  const targetPlayer = players.find(p => p.id === vote.targetPlayerId);
  const hasVoted = vote.votes[localPlayerId] !== undefined;
  const isTarget = localPlayerId === vote.targetPlayerId;
  const isInitiator = localPlayerId === vote.initiatorId;
  const initiator = players.find(p => p.id === vote.initiatorId);

  // Count votes
  const voteEntries = Object.entries(vote.votes);
  const approveCount = voteEntries.filter(([, v]) => v).length;
  const rejectCount = voteEntries.filter(([, v]) => !v).length;
  const totalVoters = players.length - 1; // Exclude target player
  const votedCount = voteEntries.length;

  // Show who voted
  const votersList = voteEntries.map(([id, approved]) => {
    const voter = players.find(p => p.id === id);
    return {
      name: voter?.name || 'Игрок',
      approved,
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-sidebar border-ornament">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-destructive" />
            Голосование за исключение
          </DialogTitle>
          <DialogDescription>
            {isTarget 
              ? 'Игроки голосуют за ваше исключение из игры'
              : isInitiator
                ? 'Вы инициировали голосование'
                : `${initiator?.name || 'Игрок'} инициировал голосование`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Target player info */}
          <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
            {targetPlayer?.avatarUrl ? (
              <img
                src={targetPlayer.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-2 ring-destructive/50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center font-display text-lg font-bold text-destructive">
                {targetPlayer?.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-semibold text-destructive">{targetPlayer?.name}</div>
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
              <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>
                {timeLeft}с
              </span>
            </div>
            <Progress 
              value={(timeLeft / VOTE_DURATION_SECONDS) * 100} 
              className={timeLeft <= 10 ? '[&>div]:bg-destructive' : ''}
            />
          </div>

          {/* Vote counts */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-lg font-bold text-green-500">{approveCount}</div>
              <div className="text-xs text-muted-foreground">За кик</div>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="text-lg font-bold text-blue-500">{rejectCount}</div>
              <div className="text-xs text-muted-foreground">Против</div>
            </div>
            <div className="p-2 bg-muted rounded-lg border border-ornament/30">
              <div className="text-lg font-bold">{votedCount}/{totalVoters}</div>
              <div className="text-xs text-muted-foreground">Голосов</div>
            </div>
          </div>

          {/* Votes list */}
          {votersList.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Голоса:</div>
              <div className="flex flex-wrap gap-1">
                {votersList.map((voter, i) => (
                  <span 
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      voter.approved 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {voter.name}: {voter.approved ? 'За' : 'Против'}
                  </span>
                ))}
              </div>
            </div>
          )}

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
                className="flex-1 gap-2 border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                onClick={() => onVote(false)}
              >
                <X className="w-4 h-4" />
                Оставить
              </Button>
            </div>
          )}

          {hasVoted && (
            <div className={`text-center p-2 rounded-lg ${
              vote.votes[localPlayerId] 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              Вы проголосовали: {vote.votes[localPlayerId] ? 'За исключение' : 'Против исключения'}
            </div>
          )}

          {isTarget && (
            <div className="text-center p-2 bg-destructive/10 rounded-lg text-destructive">
              Вы не можете голосовать за своё исключение
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const VOTE_DURATION_MS = VOTE_DURATION_SECONDS * 1000;
