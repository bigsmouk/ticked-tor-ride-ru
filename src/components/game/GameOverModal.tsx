import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UNUSED_STATION_POINTS } from '@/types/game';

export const GameOverModal: React.FC = () => {
  const { gameState, currentRoom, leaveRoom, localPlayerId } = useGameStore();
  const navigate = useNavigate();
  const savedRef = useRef(false);
  const isHost = currentRoom?.hostId === localPlayerId;
  const isSoloMode = currentRoom?.isSoloMode;
  
  // Сохраняем результаты матча через серверную функцию (только один раз, только хост, НЕ для соло)
  useEffect(() => {
    if (!isHost || isSoloMode) return; // Не сохраняем соло-игры в статистику
    if (!gameState || gameState.phase !== 'finished' || savedRef.current) return;
    if (!currentRoom) return;

    const saveMatchResults = async () => {
      savedRef.current = true;
      
      try {
        // Определяем причину завершения игры
        const lastLog = gameState.logs[gameState.logs.length - 1];
        const isPlayerLeft = lastLog?.action === 'Игра завершена' && lastLog?.details === 'Недостаточно игроков';
        
        console.log('[GameOver] Calling finalize-match edge function...', { isPlayerLeft });

        const { data, error } = await supabase.functions.invoke('finalize-match', {
          body: {
            roomId: currentRoom.id,
            roomName: currentRoom.name,
            leavingPlayerId: null, // Никто не выходит, игра завершилась
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
              logs: gameState.logs.slice(-5),
              winnerId: gameState.winnerId,
              finalScores: gameState.finalScores,
            },
          },
        });

        if (error) {
          console.error('[GameOver] Edge function error:', error);
        } else {
          console.log('[GameOver] Server saved match:', data);
        }
      } catch (error) {
        console.error('[GameOver] Error calling edge function:', error);
      }
    };

    saveMatchResults();
  }, [isHost, isSoloMode, gameState, currentRoom]);
  
  if (!gameState || gameState.phase !== 'finished') return null;
  
  const winner = gameState.players.find(p => p.id === gameState.winnerId);
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  
  const handleExit = () => {
    leaveRoom();
    navigate('/');
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="parchment rounded-xl border-4 border-ornament p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-display font-bold text-center mb-2">
          {isSoloMode ? '🎯 Тренировка окончена!' : '🏆 Игра окончена! 🏆'}
        </h2>
        
        {isSoloMode && (
          <p className="text-sm text-center text-muted-foreground mb-2">
            Соло-игры не учитываются в статистике
          </p>
        )}
        
        {winner && !isSoloMode && (
          <p className="text-xl text-center mb-4 text-primary font-semibold">
            Победитель: {winner.name}
          </p>
        )}
        
        <div className="space-y-3 mb-4">
          <p className="text-sm text-center text-muted-foreground">Итог = построенные пути + выполненные билеты − невыполненные билеты + неиспользованные станции + самый длинный путь.</p>
          {sortedPlayers.map((player, index) => {
            const fs = gameState.finalScores?.find(score => score.playerId === player.id);
            const stationCount = Math.max(0, 3 - gameState.placedStations.filter(station => station.playerId === player.id).length);
            const stationBonus = fs?.unusedStationsBonus ?? stationCount * UNUSED_STATION_POINTS;
            const routePoints = fs?.routePoints ?? player.score - (fs?.ticketBonus ?? 0) + (fs?.ticketPenalty ?? 0) - (fs?.longestPathBonus ?? 0) - stationBonus;
            const ticketBonus = fs?.ticketBonus ?? 0;
            const ticketPenalty = fs?.ticketPenalty ?? 0;
            const longestBonus = fs?.longestPathBonus ?? 0;
            const total = routePoints + ticketBonus - ticketPenalty + stationBonus + longestBonus;
            const winner = player.id === gameState.winnerId;
            return (
              <div key={player.id} className={`rounded-xl border p-3 space-y-2 ${winner ? 'border-gold bg-gold/15' : 'border-border bg-muted/20'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`} {player.name}</div>
                  <div className="font-bold text-xl">{total} очков</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="rounded bg-background/50 p-2"><div className="text-muted-foreground">🚂 Построенные пути</div><strong>+{routePoints}</strong></div>
                  <div className="rounded bg-background/50 p-2"><div className="text-muted-foreground">✓ Выполненные билеты ({fs?.completedTickets ?? 0})</div><strong className="text-green-600">+{ticketBonus}</strong></div>
                  <div className="rounded bg-background/50 p-2"><div className="text-muted-foreground">✗ Невыполненные билеты ({fs?.failedTickets ?? 0})</div><strong className="text-red-600">−{ticketPenalty}</strong></div>
                  <div className="rounded bg-background/50 p-2"><div className="text-muted-foreground">🏛️ Не построены станции ({fs?.unusedStations ?? stationCount} из 3)</div><strong className="text-purple-600">+{stationBonus} ({fs?.unusedStations ?? stationCount} × {UNUSED_STATION_POINTS})</strong></div>
                  <div className="rounded bg-background/50 p-2"><div className="text-muted-foreground">🏅 Самый длинный путь ({fs?.longestPath ?? 0} вагонов)</div><strong className="text-blue-600">+{longestBonus}</strong></div>
                </div>
                <div className="text-xs text-muted-foreground">Расчёт: {routePoints} + {ticketBonus} − {ticketPenalty} + {stationBonus} + {longestBonus} = <strong className="text-foreground">{total}</strong></div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground mb-4 space-y-1 bg-muted/10 p-2 rounded">
          <p className="font-semibold">Правила подсчёта очков:</p>
          <p>• Очки за построенные маршруты (1-8 вагонов)</p>
          <p>• Выполненные маршрутные билеты: +очки</p>
          <p>• Невыполненные маршрутные билеты: −очки</p>
          <p>• Неиспользованные станции (🏛️): +4 за каждую</p>
          <p>• Бонус за самый длинный непрерывный путь: +10 очков</p>
          <p className="text-muted-foreground/70 italic">При равенстве очков побеждает игрок с большим числом выполненных билетов, затем — с самым длинным путём</p>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={handleExit} className="btn-gold px-8">
            Выйти в лобби
          </Button>
        </div>
      </div>
    </div>
  );
};
