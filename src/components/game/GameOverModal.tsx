import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const GameOverModal: React.FC = () => {
  const { gameState, currentRoom, leaveRoom } = useGameStore();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const savedRef = useRef(false);
  
  // Сохраняем результаты матча в БД (только один раз)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'finished' || savedRef.current) return;
    if (!currentRoom) return;
    
    const saveMatchResults = async () => {
      savedRef.current = true;
      
      try {
        // Определяем причину завершения игры
        const lastLog = gameState.logs[gameState.logs.length - 1];
        const isPlayerLeft = lastLog?.action === 'Игра завершена' && lastLog?.details === 'Недостаточно игроков';
        
        // Создаём запись матча
        const { data: matchData, error: matchError } = await supabase
          .from('match_history')
          .insert({
            room_id: currentRoom.id,
            room_name: currentRoom.name,
            player_count: gameState.players.length + (isPlayerLeft ? 1 : 0), // Учитываем вышедшего игрока
            game_data: {
              winnerId: gameState.winnerId,
              turnNumber: gameState.turnNumber,
              finishedAt: new Date().toISOString(),
              endReason: isPlayerLeft ? 'player_left' : 'normal',
            },
          })
          .select()
          .single();

        if (matchError) {
          console.error('Error saving match:', matchError);
          return;
        }

        // Создаём записи для каждого игрока
        const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
        
        const playerRecords = sortedPlayers.map((player, index) => {
          const finalScore = gameState.finalScores?.find(fs => fs.playerId === player.id);
          const routePoints = player.score 
            - ((finalScore as any)?.ticketBonus || 0) 
            + ((finalScore as any)?.ticketPenalty || 0) 
            - ((finalScore as any)?.longestPathBonus || 0);
          
          // Пытаемся найти профиль авторизованного игрока
          const isCurrentUser = profile && player.name === profile.display_name;
          
          // Если игрок остался последним из-за выхода противника - он победитель
          const isWinner = isPlayerLeft 
            ? (gameState.players.length === 1 || index === 0)
            : player.id === gameState.winnerId;
          
          return {
            match_id: matchData.id,
            profile_id: isCurrentUser ? profile.id : null,
            player_name: player.name,
            player_color: player.color,
            final_score: player.score,
            route_points: finalScore ? routePoints : player.score,
            ticket_points: ((finalScore as any)?.ticketBonus || 0) - ((finalScore as any)?.ticketPenalty || 0),
            longest_path_bonus: (finalScore as any)?.longestPathBonus || 0,
            tickets_completed: (finalScore as any)?.completedTickets || 0,
            tickets_failed: (finalScore as any)?.failedTickets || 0,
            is_winner: isWinner,
            placement: index + 1,
          };
        });

        const { error: playersError } = await supabase
          .from('match_players')
          .insert(playerRecords);

        if (playersError) {
          console.error('Error saving match players:', playersError);
        } else {
          console.log('[GameOver] Match results saved successfully', { isPlayerLeft });
        }
      } catch (error) {
        console.error('Error saving match results:', error);
      }
    };

    saveMatchResults();
  }, [gameState, currentRoom, profile]);
  
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
          🏆 Игра окончена! 🏆
        </h2>
        
        {winner && (
          <p className="text-xl text-center mb-4 text-primary font-semibold">
            Победитель: {winner.name}
          </p>
        )}
        
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-muted-foreground border-b pb-2">
            <span>Место</span>
            <span>Игрок</span>
            <span className="text-right">Маршруты</span>
            <span className="text-right text-green-600">+Билеты</span>
            <span className="text-right text-red-600">−Штраф</span>
            <span className="text-right text-blue-600">Путь</span>
            <span className="text-right font-bold">Итого</span>
          </div>
          
          {sortedPlayers.map((player, index) => {
            const finalScore = gameState.finalScores?.find(fs => fs.playerId === player.id);
            const isWinner = player.id === gameState.winnerId;
            
            return (
              <div 
                key={player.id}
                className={`grid grid-cols-7 gap-1 items-center p-2 rounded text-sm ${
                  isWinner ? 'bg-gold/20 border border-gold' : 'bg-muted/30'
                }`}
              >
                <span className="font-bold text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="font-medium truncate">{player.name}</span>
                <span className="text-right">
                  {(finalScore as any)?.ticketBonus !== undefined 
                    ? player.score - ((finalScore as any)?.ticketBonus || 0) + ((finalScore as any)?.ticketPenalty || 0) - ((finalScore as any)?.longestPathBonus || 0)
                    : '—'}
                </span>
                <span className="text-right text-green-600">
                  +{(finalScore as any)?.ticketBonus || 0}
                </span>
                <span className="text-right text-red-600">
                  −{(finalScore as any)?.ticketPenalty || 0}
                </span>
                <span className="text-right text-blue-600">
                  {(finalScore as any)?.longestPathBonus > 0 ? `+${(finalScore as any)?.longestPathBonus}` : '0'}
                  <span className="text-muted-foreground text-xs ml-1">({finalScore?.longestPath || 0})</span>
                </span>
                <span className="text-right font-bold text-lg">{player.score}</span>
              </div>
            );
          })}
        </div>
        
        {/* Destination tickets breakdown */}
        <div className="mb-4 space-y-2">
          <h3 className="font-semibold text-sm">Детали маршрутных билетов:</h3>
          {sortedPlayers.map(player => {
            const finalScore = gameState.finalScores?.find(fs => fs.playerId === player.id);
            return (
              <div key={player.id} className="text-xs bg-muted/20 p-2 rounded">
                <span className="font-medium">{player.name}:</span>
                <span className="ml-2">
                  Выполнено: {(finalScore as any)?.completedTickets || 0}, 
                  Не выполнено: {(finalScore as any)?.failedTickets || 0}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-muted-foreground mb-4 space-y-1 bg-muted/10 p-2 rounded">
          <p className="font-semibold">Правила подсчёта очков:</p>
          <p>• Очки за построенные маршруты (1-8 вагонов)</p>
          <p>• Выполненные маршрутные билеты: +очки</p>
          <p>• Невыполненные маршрутные билеты: −очки</p>
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
