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
      <div className="parchment rounded-xl border-4 border-ornament p-8 shadow-2xl max-w-lg w-full mx-4">
        <h2 className="text-3xl font-display font-bold text-center mb-2">
          🏆 Игра окончена! 🏆
        </h2>
        
        {winner && (
          <p className="text-xl text-center mb-6 text-primary font-semibold">
            Победитель: {winner.name}
          </p>
        )}
        
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
            <span>Место</span>
            <span>Игрок</span>
            <span className="text-right">Очки</span>
            <span className="text-right">Путь</span>
          </div>
          
          {sortedPlayers.map((player, index) => {
            const finalScore = gameState.finalScores?.find(fs => fs.playerId === player.id);
            const isWinner = player.id === gameState.winnerId;
            
            return (
              <div 
                key={player.id}
                className={`grid grid-cols-4 gap-2 items-center p-2 rounded ${
                  isWinner ? 'bg-gold/20 border border-gold' : 'bg-muted/30'
                }`}
              >
                <span className="font-bold text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="font-medium truncate">{player.name}</span>
                <span className="text-right font-bold text-lg">{player.score}</span>
                <span className="text-right text-sm">{finalScore?.longestPath || 0}</span>
              </div>
            );
          })}
        </div>
        
        <div className="text-sm text-muted-foreground mb-6 space-y-1">
          <p>• Бонус за самый длинный путь: +10 очков</p>
          <p>• Выполненные маршруты: +очки</p>
          <p>• Невыполненные маршруты: −очки</p>
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
