import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const GameOverModal: React.FC = () => {
  const { gameState, leaveRoom } = useGameStore();
  const navigate = useNavigate();
  
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
