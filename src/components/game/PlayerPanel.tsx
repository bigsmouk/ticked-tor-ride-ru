import React from 'react';
import { Player, PlayerColor } from '@/types/game';

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
  isLocalPlayer: boolean;
  isOnline?: boolean;
  position: 'left' | 'right';
  index: number;
  onClick?: () => void;
}

const PLAYER_COLORS: Record<PlayerColor, string> = {
  red: '#bc3937', blue: '#317ab9', green: '#3c9872', yellow: '#cba543', black: '#55505a',
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player, isCurrentPlayer, isLocalPlayer, isOnline = true, onClick,
}) => {
  const accent = PLAYER_COLORS[player.color] ?? '#8a6c48';
  return (
    <button
      type="button"
      className={`player-panel ttr-player-compact ${isCurrentPlayer ? 'ttr-player-active' : ''}`}
      style={{ '--player-accent': accent } as React.CSSProperties}
      onClick={onClick}
      title={`Профиль игрока ${player.name}`}
    >
      <span className="ttr-player-avatar">
        {player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : player.name.charAt(0).toUpperCase()}
        <span className={`ttr-player-online ${isOnline ? 'is-online' : ''}`} />
      </span>
      <span className="ttr-player-body">
        <span className="ttr-player-name" title={player.name}>{player.name}{isLocalPlayer && <small> (Вы)</small>}</span>
        <span className="ttr-player-score">🏆 {player.score} очков</span>
        <span className="ttr-player-stats">
          <span title="Оставшиеся вагоны">🚃 {player.trainsRemaining}</span>
          <span title="Станции">🏛️ {player.stationsRemaining}</span>
          <span title="Карты вагонов">🃏 {player.trainCards.length}</span>
          <span title="Билеты">🎫 {player.destinationTickets.length}</span>
        </span>
      </span>
    </button>
  );
};
