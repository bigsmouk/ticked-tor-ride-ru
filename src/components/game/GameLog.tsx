import React, { useEffect, useRef } from 'react';
import { GameLogEntry, Player } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GameLogProps {
  logs: GameLogEntry[];
  players: Player[];
}

// Player color mapping - high contrast on dark backgrounds
const PLAYER_COLOR_CLASSES: Record<string, string> = {
  red: 'text-red-300',
  blue: 'text-blue-300',
  green: 'text-green-300',
  yellow: 'text-yellow-200',
  black: 'text-gray-200',
};

const ACTION_ICONS: Record<string, string> = {
  draw_card: '🎴',
  draw_locomotive: '🚂',
  claim_route: '🛤️',
  draw_destinations: '🎫',
  keep_destinations: '✅',
  turn_start: '▶️',
  game_start: '🎮',
  last_round: '⚠️',
  game_end: '🏆',
};

export const GameLog: React.FC<GameLogProps> = ({ logs, players }) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length]);

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return 'Система';
    const player = players.find(p => p.id === playerId);
    return player?.name || 'Неизвестный';
  };

  const getPlayerColorClass = (playerId?: string) => {
    if (!playerId) return 'text-amber-400';
    const player = players.find(p => p.id === playerId);
    return player ? PLAYER_COLOR_CLASSES[player.color] || 'text-foreground' : 'text-foreground';
  };

  const getActionIcon = (action: string) => {
    // Match action to icon
    for (const [key, icon] of Object.entries(ACTION_ICONS)) {
      if (action.toLowerCase().includes(key)) return icon;
    }
    return '📝';
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-ornament/30 bg-primary/10">
        <h3 className="font-display font-bold text-sm text-foreground flex items-center gap-2">
          📜 История игры
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {logs.length === 0 ? (
            <div className="text-muted-foreground text-xs text-center py-4">
              Ожидание действий...
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className="text-xs p-2 rounded bg-card border border-border shadow-sm hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">{getActionIcon(log.action)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-bold ${getPlayerColorClass(log.playerId)}`}>
                        {getPlayerName(log.playerId)}
                      </span>
                      <span className="text-foreground/60">—</span>
                      <span className="text-foreground font-medium">{log.action}</span>
                    </div>
                    {log.details && (
                      <div className="text-foreground/80 mt-0.5 break-words">
                        {log.details}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-foreground/50 shrink-0">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
          {/* Anchor for auto-scroll */}
          <div ref={scrollEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
